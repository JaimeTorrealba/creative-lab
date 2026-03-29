<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { Pane } from 'tweakpane'

const canvas = ref(null)
let animId = null
let ctx    = null
let pane   = null

// ── Canvas resolution ──────────────────────────────────────────────────────────
const SIZE = 800

// ── Simulation parameters ──────────────────────────────────────────────────────
//
// "Differential Lattice" by inconvergent — translated from Python/CUDA to JS.
//
// How it works:
//   1. A small seed cluster of nodes starts at the canvas center.
//   2. Every step each node examines its neighborhood (within outerInfluenceRadius):
//        a. Pairs that pass the RELATIVE-NEIGHBORHOOD test become spring-linked:
//             pull together when too far, push apart when too close.
//        b. Unlinked nearby nodes contribute a pure REPULSION force.
//        c. All candidates contribute to the local centroid; each node then
//           pushes AWAY from that centroid (EXPANSION force), making the
//           lattice grow outward like slime mold.
//   3. Each frame, nodes sitting on the sparse outer edge (few neighbors)
//      randomly SPAWN a child node nearby, extending the network.
//
// All positions and radii use normalized [0, 1] coordinates.

const params = {
  stepsPerFrame:    3,        // simulation steps computed per animation frame

  // Node geometry — every spacing radius is derived from nodeRadius
  nodeRadius:       0.0070,   // base unit; scale this to change mesh density

  // Force multipliers (match the original Python stp / spring_stp / reject_stp / cohesion_stp)
  moveStep:         0.00003,  // max displacement applied per simulation step
  springForce:      5.0,      // attraction/repulsion strength between spring-linked pairs
  rejectForce:      0.15,     // repulsion strength from unlinked nearby nodes
  expansionForce:   1.2,      // outward pressure — nodes push away from local centroid

  // Spawning
  spawnRatio:       0.06,     // fraction of eligible outer nodes that spawn a child per frame
  spawnThreshold:   28,       // a node can spawn when its neighbor count is below this
  maxNodes:         2000,     // total node cap (performance guard)

  // Render
  bgColor:   '#111118',
  nodeColor: '#c8ddf4',
  edgeColor: '#3460a0',
}

// ── Derived radii — recomputed from nodeRadius on every reset ──────────────────
let springRejectRadius   = 0  // spring pushes apart when dist < this
let springAttractRadius  = 0  // spring pulls together when dist > this
let outerInfluenceRadius = 0  // maximum neighborhood search radius
let linkIgnoreRadius     = 0  // nodes farther apart than this cannot be relative neighbors
let CELL_SIZE            = 0  // spatial-hash cell side (= outerInfluenceRadius)

function computeDerivedRadii() {
  springRejectRadius   = params.nodeRadius * 1.9
  springAttractRadius  = params.nodeRadius * 2.0
  outerInfluenceRadius = params.nodeRadius * 10.0
  linkIgnoreRadius     = params.nodeRadius * 5.0
  // One cell covers exactly the influence radius, so a 3×3 cell search is sufficient.
  CELL_SIZE = outerInfluenceRadius
}

// ── Simulation state ───────────────────────────────────────────────────────────
let nodes = []  // [{ x, y, dx, dy, neighborCount }, …]
let edges = []  // [[idxA, idxB], …]  rebuilt each step for drawing

// ── Spatial hash ───────────────────────────────────────────────────────────────
function buildSpatialHash() {
  const grid = {}
  for (let i = 0; i < nodes.length; i++) {
    const { x, y } = nodes[i]
    const key = `${Math.floor(x / CELL_SIZE)},${Math.floor(y / CELL_SIZE)}`
    if (!grid[key]) grid[key] = []
    grid[key].push(i)
  }
  return grid
}

// Returns indices of all nodes within outerInfluenceRadius of (x, y), excluding selfIdx.
// A 3×3 cell search is provably sufficient when CELL_SIZE = outerInfluenceRadius.
function getNeighborhoodOf(grid, x, y, selfIdx) {
  const candidates = []
  const cx = Math.floor(x / CELL_SIZE)
  const cy = Math.floor(y / CELL_SIZE)
  for (let dx = -1; dx <= 1; dx++) {
    for (let dy = -1; dy <= 1; dy++) {
      const bucket = grid[`${cx + dx},${cy + dy}`]
      if (!bucket) continue
      for (const j of bucket) {
        if (j === selfIdx) continue
        if (Math.hypot(nodes[j].x - x, nodes[j].y - y) < outerInfluenceRadius) {
          candidates.push(j)
        }
      }
    }
  }
  return candidates
}

// ── Relative-neighborhood test ─────────────────────────────────────────────────
// Two nodes i and j are relative neighbors when no third node l lies inside the
// "lens" between them — i.e., is closer to BOTH i and j than they are to each other.
// Here we test against i's own candidate set, which is an exact approximation
// because any disqualifying l must itself lie within outerInfluenceRadius of i.
function areRelativeNeighbors(ni, nj, distIJ, candidatesOfI) {
  if (distIJ > linkIgnoreRadius) return false
  for (const l of candidatesOfI) {
    const nl = nodes[l]
    const dLtoI = Math.hypot(nl.x - ni.x, nl.y - ni.y)
    const dLtoJ = Math.hypot(nl.x - nj.x, nl.y - nj.y)
    // l is "inside the lens" → i and j are NOT relative neighbors
    if (distIJ > Math.max(dLtoI, dLtoJ)) return false
  }
  return true
}

// ── One simulation step ────────────────────────────────────────────────────────
function simulationStep(spatialHash) {
  const n = nodes.length
  edges = []

  for (let i = 0; i < n; i++) {
    const ni = nodes[i]
    const candidatesOfI = getNeighborhoodOf(spatialHash, ni.x, ni.y, i)

    let springRejectForceX = 0
    let springRejectForceY = 0
    let centroidSumX = 0
    let centroidSumY = 0
    let neighborCount = 0

    for (const j of candidatesOfI) {
      const nj = nodes[j]
      const diffX = ni.x - nj.x  // vector pointing from j → i
      const diffY = ni.y - nj.y
      const dist  = Math.hypot(diffX, diffY)
      if (dist <= 0) continue

      // Accumulate positions for the local centroid (used by expansion force below)
      centroidSumX += nj.x
      centroidSumY += nj.y
      neighborCount++

      const unitX = diffX / dist  // unit vector j → i
      const unitY = diffY / dist

      if (areRelativeNeighbors(ni, nj, dist, candidatesOfI)) {
        if (i < j) edges.push([i, j])  // record edge once for drawing

        if (dist > springAttractRadius) {
          // Linked but too far → spring pulls i toward j
          springRejectForceX -= unitX * params.springForce
          springRejectForceY -= unitY * params.springForce
        } else if (dist < springRejectRadius) {
          // Linked but too close → spring pushes i away from j
          springRejectForceX += unitX * params.springForce
          springRejectForceY += unitY * params.springForce
        }
      } else {
        // Unlinked: repulsion only
        springRejectForceX += unitX * params.rejectForce
        springRejectForceY += unitY * params.rejectForce
      }
    }

    // Expansion force: push each node away from the centroid of its neighborhood.
    // This outward pressure drives the lattice to grow — equivalent to the
    // negated cohesion term in the original CUDA step kernel.
    let expansionForceX = 0
    let expansionForceY = 0
    if (neighborCount > 0) {
      const towardCentroidX = centroidSumX / neighborCount - ni.x
      const towardCentroidY = centroidSumY / neighborCount - ni.y
      const centroidDist    = Math.hypot(towardCentroidX, towardCentroidY)
      if (centroidDist > 1e-9) {
        expansionForceX = -(towardCentroidX / centroidDist) * params.expansionForce
        expansionForceY = -(towardCentroidY / centroidDist) * params.expansionForce
      }
    }

    // Store displacement — applied after all nodes are evaluated so forces are consistent
    ni.dx = (springRejectForceX + expansionForceX) * params.moveStep
    ni.dy = (springRejectForceY + expansionForceY) * params.moveStep
    ni.neighborCount = neighborCount
  }

  // Apply displacements, keeping nodes inside the canvas boundary
  for (const node of nodes) {
    node.x = Math.max(0.001, Math.min(0.999, node.x + node.dx))
    node.y = Math.max(0.001, Math.min(0.999, node.y + node.dy))
  }
}

// ── Spawn new nodes ────────────────────────────────────────────────────────────
// Nodes on the sparse outer fringe (low neighbor count) probabilistically spawn
// a child node at a short random offset, extending the network outward.
function spawnNewNodes() {
  if (nodes.length >= params.maxNodes) return

  const spawnOffset = params.nodeRadius * 0.5
  const toAdd = []

  for (const node of nodes) {
    if (nodes.length + toAdd.length >= params.maxNodes) break
    if (node.neighborCount >= params.spawnThreshold) continue
    if (Math.random() > params.spawnRatio) continue

    const angle = Math.random() * Math.PI * 2
    toAdd.push({
      x: node.x + Math.cos(angle) * spawnOffset,
      y: node.y + Math.sin(angle) * spawnOffset,
      dx: 0, dy: 0, neighborCount: 0,
    })
  }

  nodes.push(...toAdd)
}

// ── Draw frame ─────────────────────────────────────────────────────────────────
function draw() {
  ctx.fillStyle = params.bgColor
  ctx.fillRect(0, 0, SIZE, SIZE)

  // Edges (drawn behind nodes)
  ctx.strokeStyle = params.edgeColor
  ctx.lineWidth   = 0.7
  ctx.globalAlpha = 0.65
  ctx.beginPath()
  for (const [a, b] of edges) {
    ctx.moveTo(nodes[a].x * SIZE, nodes[a].y * SIZE)
    ctx.lineTo(nodes[b].x * SIZE, nodes[b].y * SIZE)
  }
  ctx.stroke()

  // Nodes
  ctx.fillStyle   = params.nodeColor
  ctx.globalAlpha = 0.85
  const drawRadius = params.nodeRadius * SIZE * 0.55
  for (const { x, y } of nodes) {
    ctx.beginPath()
    ctx.arc(x * SIZE, y * SIZE, drawRadius, 0, Math.PI * 2)
    ctx.fill()
  }

  ctx.globalAlpha = 1
}

// ── Initialisation ─────────────────────────────────────────────────────────────
function init() {
  computeDerivedRadii()
  nodes = []
  edges = []

  // Seed: 20 nodes arranged in a tight circle at the canvas center
  const initialCount = 20
  const seedRadius   = params.nodeRadius * 0.8
  for (let k = 0; k < initialCount; k++) {
    const angle = (k / initialCount) * Math.PI * 2
    nodes.push({
      x: 0.5 + Math.cos(angle) * seedRadius,
      y: 0.5 + Math.sin(angle) * seedRadius,
      dx: 0, dy: 0, neighborCount: 0,
    })
  }
}

// ── Reset ──────────────────────────────────────────────────────────────────────
function reset() {
  if (animId) cancelAnimationFrame(animId)
  init()
  startLoop()
}

// ── Render loop ────────────────────────────────────────────────────────────────
function startLoop() {
  const loop = () => {
    // Rebuild the spatial hash before every step so forces use current positions
    for (let s = 0; s < params.stepsPerFrame; s++) {
      simulationStep(buildSpatialHash())
    }
    spawnNewNodes()
    draw()
    animId = requestAnimationFrame(loop)
  }
  animId = requestAnimationFrame(loop)
}

// ── Lifecycle ──────────────────────────────────────────────────────────────────
onMounted(() => {
  const el  = canvas.value
  el.width  = SIZE
  el.height = SIZE
  ctx       = el.getContext('2d')

  init()
  startLoop()

  // ── Tweakpane GUI ──────────────────────────────────────────────────────────
  pane = new Pane({ title: 'Differential Lattice' })

  const simFolder = pane.addFolder({ title: 'Simulation' })
  simFolder.addBinding(params, 'stepsPerFrame', { min: 1,      max: 15,     step: 1,        label: 'Steps / frame' })
  simFolder.addBinding(params, 'nodeRadius',    { min: 0.003,  max: 0.015,  step: 0.0005,   label: 'Node radius' })
  simFolder.addBinding(params, 'moveStep',      { min: 0.00001, max: 0.0001, step: 0.000005, label: 'Move step' })
  simFolder.addBinding(params, 'maxNodes',      { min: 100,    max: 5000,   step: 100,      label: 'Max nodes' })

  const forcesFolder = pane.addFolder({ title: 'Forces' })
  forcesFolder.addBinding(params, 'springForce',    { min: 0.5,  max: 15,  step: 0.5, label: 'Spring force' })
  forcesFolder.addBinding(params, 'rejectForce',    { min: 0.01, max: 1.0, step: 0.01, label: 'Reject force' })
  forcesFolder.addBinding(params, 'expansionForce', { min: 0.1,  max: 5.0, step: 0.1,  label: 'Expansion force' })

  const spawnFolder = pane.addFolder({ title: 'Spawning' })
  spawnFolder.addBinding(params, 'spawnRatio',     { min: 0.005, max: 0.3, step: 0.005, label: 'Spawn ratio' })
  spawnFolder.addBinding(params, 'spawnThreshold', { min: 5,     max: 60,  step: 1,     label: 'Spawn threshold' })

  const renderFolder = pane.addFolder({ title: 'Render' })
  renderFolder.addBinding(params, 'bgColor',   { label: 'Background' })
  renderFolder.addBinding(params, 'nodeColor', { label: 'Node colour' })
  renderFolder.addBinding(params, 'edgeColor', { label: 'Edge colour' })

  pane.addButton({ title: '↺  Reset' }).on('click', reset)
})

onUnmounted(() => {
  if (animId) cancelAnimationFrame(animId)
  pane?.dispose()
})
</script>

<template>
  <canvas ref="canvas" />
</template>
