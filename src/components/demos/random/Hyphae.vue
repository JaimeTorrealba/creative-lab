<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { Pane } from 'tweakpane'

const canvas = ref(null)
let animId = null
let ctx = null
let pane = null

// ── Tweakpane parameters (mutated live by the GUI) ────────────────────────────
const params = {
  speed: 30, // growth attempts simulated per animation frame
  lineWidth: 0.35 // tube thickness multiplier relative to node radius
}

// ── Fixed simulation constants ────────────────────────────────────────────────
const SIZE = 800 // canvas resolution in pixels
const ONE = 1 / SIZE // one pixel expressed in normalised [0,1] space

const BASE_RADIUS = 40 * ONE // starting radius of every seed node (normalised)
const RADIUS_DECAY = 0.92 // each successive branch is this fraction thinner
const MAX_ANGLE_DRIFT = Math.PI // maximum random angle change per branch step (radians)
const MAX_ATTEMPTS = 15 // a node stops growing after this many failed placements
const BOUND_RADIUS = 0.45 // all nodes must stay within this radius of centre (0.5, 0.5)
const SEED_COUNT = 9 // number of initial seed nodes
const SEED_AREA = 0.45 // seed nodes are placed randomly within this radius of centre
const NMAX = 200_000 // hard cap on total node count

// ── Spatial grid constants ─────────────────────────────────────────────────────
// The canvas is divided into a uniform grid of square zones.
// When checking whether a new node overlaps an existing one we only need to
// search the 3×3 neighbourhood of zones — avoiding an O(n²) check each step.
const ZONE_WIDTH = 2 * (BASE_RADIUS / ONE) // zone size in pixels
const ZONE_COUNT = Math.max(1, Math.floor(SIZE / ZONE_WIDTH)) // zones per axis

// ── Per-node typed arrays (pre-allocated up to NMAX) ─────────────────────────
// All positional values are in normalised [0,1] space (not pixels).
const nodeX = new Float32Array(NMAX) // x position of each node
const nodeY = new Float32Array(NMAX) // y position of each node
const nodeRadius = new Float32Array(NMAX) // collision radius (also determines tube thickness)
const nodeAngle = new Float32Array(NMAX) // current growth direction in radians
const nodeGeneration = new Float32Array(NMAX) // how many branch steps deep from the seed
const nodeParent = new Int32Array(NMAX).fill(-1) // index of parent node (-1 = root/seed)
const nodeAttempts = new Int32Array(NMAX) // failed placement attempts so far
const nodeFirstChild = new Int32Array(NMAX).fill(-1) // index of first successful child (-1 = still a leaf)

// ── Spatial hash grid ─────────────────────────────────────────────────────────
// spatialGrid[zoneIndex] holds an array of node indices whose centres fall in that zone.
let spatialGrid = []

// Total number of active nodes (grows during simulation, never shrinks).
let nodeCount = 0

// ── Spatial grid helpers ──────────────────────────────────────────────────────

// Converts a normalised (x, y) position into a flat zone index.
function getZoneIndex(x, y) {
  const col = 1 + Math.floor(x * ZONE_COUNT)
  const row = 1 + Math.floor(y * ZONE_COUNT)
  return col * (ZONE_COUNT + 2) + row
}

// Returns all node indices sitting in the 3×3 zone neighbourhood around (x, y).
// This is the fast path for finding potential collision partners.
function getNeighbourIndices(x, y) {
  const col = 1 + Math.floor(x * ZONE_COUNT)
  const row = 1 + Math.floor(y * ZONE_COUNT)
  const result = []
  for (let dc = -1; dc <= 1; dc++) {
    for (let dr = -1; dr <= 1; dr++) {
      const idx = (col + dc) * (ZONE_COUNT + 2) + (row + dr)
      if (idx >= 0 && idx < spatialGrid.length) {
        const bucket = spatialGrid[idx]
        for (let n = 0; n < bucket.length; n++) result.push(bucket[n])
      }
    }
  }
  return result
}

// ── Box-Muller normal distribution ───────────────────────────────────────────
// Produces a normally-distributed random number (mean=0, σ=1).
// Used to give branch angles an organic, bell-curve jitter instead of uniform noise.
function randomNormal() {
  const u = 1 - Math.random()
  const v = Math.random()
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
}

// ── Drawing ───────────────────────────────────────────────────────────────────
// Draws a filled "tube" from parent (x1,y1) to child (x2,y2)
// by stamping a series of filled circles along the segment path.
// This replicates the original Python render.circles() technique.
function drawSegment(x1, y1, x2, y2, radius) {
  const dx = x2 - x1
  const dy = y2 - y1
  const dist = Math.sqrt(dx * dx + dy * dy)
  const steps = Math.max(6, Math.floor(dist / ONE)) // at least 6 stamps, more for longer segments
  const angle = Math.atan2(dy, dx)

  // params.lineWidth lets the user scale the tube thickness at runtime
  const pixelRadius = Math.max(0.5, SIZE * radius * params.lineWidth)

  for (let s = 0; s <= steps; s++) {
    const t = s / steps
    const cx = SIZE * (x1 + t * dist * Math.cos(angle))
    const cy = SIZE * (y1 + t * dist * Math.sin(angle))
    ctx.beginPath()
    ctx.arc(cx, cy, pixelRadius, 0, Math.PI * 2)
    ctx.fill()
  }
}

// ── Initialisation ────────────────────────────────────────────────────────────
// Resets the spatial grid and places SEED_COUNT seed nodes randomly inside
// the seed circle. Seeds are roots: they have no parent and start at BASE_RADIUS.
function init() {
  spatialGrid = Array.from({ length: (ZONE_COUNT + 2) ** 2 }, () => [])
  let i = 0
  while (i < SEED_COUNT) {
    const x = Math.random()
    const y = Math.random()
    // Reject positions outside the seed placement circle
    if (Math.sqrt((x - 0.5) ** 2 + (y - 0.5) ** 2) >= SEED_AREA) continue

    nodeX[i] = x
    nodeY[i] = y
    // Small random variation in seed radius gives diversity between branches
    nodeRadius[i] = BASE_RADIUS + 0.2 * BASE_RADIUS * (1 - 2 * Math.random())
    nodeAngle[i] = Math.random() * Math.PI * 2
    nodeGeneration[i] = 1
    nodeParent[i] = -1 // root node — no parent
    nodeFirstChild[i] = -1 // no children yet
    nodeAttempts[i] = 0
    spatialGrid[getZoneIndex(x, y)].push(i)
    i++
  }
  nodeCount = i
}

// ── Simulation step ───────────────────────────────────────────────────────────
// Runs `params.speed` growth attempts per animation frame.
// One attempt: pick a random existing node → try to sprout a new child node from it.
function step() {
  if (!ctx || nodeCount >= NMAX) return

  ctx.fillStyle = 'rgba(255,255,255,0.92)'

  for (let iter = 0; iter < params.speed; iter++) {
    if (nodeCount >= NMAX) break

    // 1. Pick a random active node to attempt growth from
    const k = Math.floor(Math.random() * nodeCount)
    nodeAttempts[k]++

    // Skip nodes that have exceeded their attempt budget (they are "exhausted")
    if (nodeAttempts[k] > MAX_ATTEMPTS) continue

    // 2. Compute the candidate child's radius
    //    - First child: inherits parent's radius unchanged (no decay yet)
    //    - Subsequent branches (parent already has a child): apply RADIUS_DECAY
    const childRadius = nodeFirstChild[k] > -1 ? nodeRadius[k] * RADIUS_DECAY : nodeRadius[k]

    // Branches thinner than one pixel are invisible — kill the node
    if (childRadius < ONE) {
      nodeAttempts[k] = MAX_ATTEMPTS + 1
      continue
    }

    // 3. Compute the candidate child's generation depth
    //    Generation only increments when the parent already has another child.
    const childGeneration = nodeFirstChild[k] > -1 ? nodeGeneration[k] + 1 : nodeGeneration[k]

    // 4. Compute the child's growth angle
    //    The angle drifts from the parent's angle by a normally-distributed offset.
    //    The drift scale grows slowly with generation (older lineages curve more),
    //    giving the characteristic organic, winding look of real hyphae.
    const driftScale = 1 - 1 / Math.pow(childGeneration + 1, 0.1)
    const childAngle = nodeAngle[k] + driftScale * randomNormal() * MAX_ANGLE_DRIFT

    // 5. Project the child position one radius-length away in the growth direction
    const childX = nodeX[k] + Math.sin(childAngle) * childRadius
    const childY = nodeY[k] + Math.cos(childAngle) * childRadius

    // 6. Reject if child lands outside the bounding circle
    if (Math.sqrt((childX - 0.5) ** 2 + (childY - 0.5) ** 2) > BOUND_RADIUS) continue

    // 7. Collision check: new node must not overlap any existing node
    //    (the parent itself is always adjacent and skipped to avoid false rejection)
    const neighbours = getNeighbourIndices(childX, childY).filter(
      (a) => a !== k && a !== nodeParent[k]
    )
    let noOverlap = true
    for (let n = 0; n < neighbours.length; n++) {
      const ni = neighbours[n]
      const dist = Math.sqrt((nodeX[ni] - childX) ** 2 + (nodeY[ni] - childY) ** 2)
      // Circles overlap when the centre-to-centre distance < sum of radii / 2
      if (dist * 2 <= nodeRadius[ni] + childRadius) {
        noOverlap = false
        break
      }
    }

    // 8. Accept: record the new node and draw the connecting segment
    if (noOverlap) {
      nodeX[nodeCount] = childX
      nodeY[nodeCount] = childY
      nodeRadius[nodeCount] = childRadius
      nodeAngle[nodeCount] = childAngle
      nodeParent[nodeCount] = k
      nodeGeneration[nodeCount] = childGeneration
      nodeAttempts[nodeCount] = 0
      nodeFirstChild[nodeCount] = -1

      // Mark the parent as no longer a leaf — future branches will be thinner
      if (nodeFirstChild[k] < 0) nodeFirstChild[k] = nodeCount

      spatialGrid[getZoneIndex(childX, childY)].push(nodeCount)
      drawSegment(nodeX[k], nodeY[k], childX, childY, childRadius)
      nodeCount++
    }
  }
}

// ── Reset ─────────────────────────────────────────────────────────────────────
// Clears the canvas and restarts the simulation from fresh seed nodes.
function reset() {
  if (animId) cancelAnimationFrame(animId)
  ctx.fillStyle = '#111'
  ctx.fillRect(0, 0, SIZE, SIZE)
  init()
  startLoop()
}

function startLoop() {
  const loop = () => {
    step()
    animId = requestAnimationFrame(loop)
  }
  animId = requestAnimationFrame(loop)
}

// ── Lifecycle ─────────────────────────────────────────────────────────────────
onMounted(() => {
  const el = canvas.value
  el.width = SIZE
  el.height = SIZE
  ctx = el.getContext('2d')

  ctx.fillStyle = '#111'
  ctx.fillRect(0, 0, SIZE, SIZE)

  init()
  startLoop()

  // Tweakpane GUI
  pane = new Pane({ title: 'Hyphae' })
  pane.addBinding(params, 'speed', {
    min: 1,
    max: 200,
    step: 1,
    label: 'Speed (steps/frame)'
  })
  pane.addBinding(params, 'lineWidth', {
    min: 0.05,
    max: 1.0,
    step: 0.01,
    label: 'Line width'
  })
  pane.addButton({ title: 'Reset' }).on('click', reset)
})

onUnmounted(() => {
  if (animId) cancelAnimationFrame(animId)
  pane?.dispose()
})
</script>

<template>
  <canvas ref="canvas" />
</template>

<style scoped>
canvas {
  display: block;
  border-radius: 4px;
  max-width: 90vmin;
  max-height: 90vmin;
  width: 800px;
  height: 800px;
}
</style>
