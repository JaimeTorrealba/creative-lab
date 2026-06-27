<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { Pane } from 'tweakpane'

const canvas = ref(null)
let animId = null
let ctx    = null
let pane   = null

// ── Canvas resolution ─────────────────────────────────────────────────────────
const SIZE = 800

// ── Tweakpane parameters ──────────────────────────────────────────────────────
// Based on inconvergent/fracture (Python) – translated to JS with normalised coords.
//
// How it works:
//   1. Scatter thousands of tiny "attractor" points across the canvas.
//   2. Seed a handful of fractures at random positions with random directions.
//   3. Each step a fracture looks for attractors inside its field of vision,
//      averages their directions and advances one step that way.
//   4. If the tip touches an existing crack it stops (collision).
//   5. If no attractors are visible it stops (domain exhausted).
//   6. After every round of steps, each alive tip may spawn a child that grows
//      roughly perpendicular — creating the branching crack pattern.
const params = {
  speed:              3,      // simulation steps per animation frame

  // ── Attractor sources ────────────────────────────────────────────────────────
  numSources:      3000,      // number of attractor points scattered in the canvas
  minSourceSpacing: 0.010,   // minimum distance between two attractor points (Poisson-disk)

  // ── Seeding ───────────────────────────────────────────────────────────────────
  numInitialCracks:   5,     // how many root fractures to start with

  // ── Fracture growth ──────────────────────────────────────────────────────────
  fieldOfVision:    0.10,    // radius in which a fracture searches for attractors
  forwardBias:      0.50,    // cosine threshold – attractors behind this angle are ignored
                             // (0 = any direction, 1 = only exactly ahead)
  stepSize:         0.005,   // distance the tip advances per simulation step
  speedDecay:       0.997,   // each step: speed ×= speedDecay  (< 1 → energy fades)

  // ── Spawning ─────────────────────────────────────────────────────────────────
  // After all alive fractures step, each tip has a chance to fork a child.
  // Probability = currentSpeed × spawnRate, so fast/fresh tips fork more.
  spawnRate:        0.25,    // base probability of spawning per alive tip per step
  spawnAngleSpread: 0.60,    // angular randomness around the 90° turn (radians)
  childSpeedRatio:  0.85,    // child's initial speed as a fraction of parent's current speed

  // ── Collision ─────────────────────────────────────────────────────────────────
  // collisionRadius MUST be < stepSize so a fracture never collides with itself.
  collisionRadius:  0.004,   // proximity to an existing crack that causes termination

  // ── Render ────────────────────────────────────────────────────────────────────
  bgColor:    '#111118',
  crackColor: '#b8d0ee',
}

// ── Spatial-hash constants ────────────────────────────────────────────────────
// Cell sizes chosen so that the 3-cell neighbourhood always covers the query radius.
const SRC_CELL = 0.05    // source grid cell (should be ≤ fieldOfVision)
const COL_CELL = 0.01    // collision grid cell (should be > collisionRadius)

// ── Simulation state ──────────────────────────────────────────────────────────
let sources       = []   // [[x, y], …] attractor points
let sourceGrid    = {}   // spatial hash: key → [[x, y], …]

let aliveFractures = []  // fractures that are still growing
// (dead fractures are dropped after their last segment is drawn incrementally)

let collisionGrid  = {}  // spatial hash of all visited crack points for collision tests

// ── Source grid ───────────────────────────────────────────────────────────────
function buildSourceGrid() {
  sourceGrid = {}
  for (const [x, y] of sources) {
    const k = `${Math.floor(x / SRC_CELL)},${Math.floor(y / SRC_CELL)}`
    if (!sourceGrid[k]) sourceGrid[k] = []
    sourceGrid[k].push([x, y])
  }
}

// All attractor points within `radius` of (x, y)
function sourcesNear(x, y, radius) {
  const out  = []
  const span = Math.ceil(radius / SRC_CELL) + 1
  const cx   = Math.floor(x / SRC_CELL)
  const cy   = Math.floor(y / SRC_CELL)
  for (let dx = -span; dx <= span; dx++) {
    for (let dy = -span; dy <= span; dy++) {
      const pts = sourceGrid[`${cx + dx},${cy + dy}`]
      if (!pts) continue
      for (const pt of pts) {
        if (Math.hypot(pt[0] - x, pt[1] - y) <= radius) out.push(pt)
      }
    }
  }
  return out
}

// ── Collision grid ────────────────────────────────────────────────────────────
// Register a point as part of an existing crack so future fractures can stop here.
function registerCrackPoint(x, y) {
  const k = `${Math.floor(x / COL_CELL)},${Math.floor(y / COL_CELL)}`
  if (!collisionGrid[k]) collisionGrid[k] = []
  collisionGrid[k].push([x, y])
}

// True if (x, y) lands within `radius` of any existing crack point.
function hitsCrack(x, y, radius) {
  const span = Math.ceil(radius / COL_CELL) + 1
  const cx   = Math.floor(x / COL_CELL)
  const cy   = Math.floor(y / COL_CELL)
  for (let dx = -span; dx <= span; dx++) {
    for (let dy = -span; dy <= span; dy++) {
      const pts = collisionGrid[`${cx + dx},${cy + dy}`]
      if (!pts) continue
      for (const [px, py] of pts) {
        if (Math.hypot(px - x, py - y) < radius) return true
      }
    }
  }
  return false
}

// ── Poisson-disk source distribution ─────────────────────────────────────────
// "Dart throwing": keep trying random positions and reject those too close to
// existing points.  A per-cell grid makes each rejection test O(1).
function distributeSourcesDarts(num, minDist) {
  const result = []
  const grid   = {}
  const cell   = minDist

  function tooClose(x, y) {
    const cx = Math.floor(x / cell)
    const cy = Math.floor(y / cell)
    for (let ddx = -2; ddx <= 2; ddx++) {
      for (let ddy = -2; ddy <= 2; ddy++) {
        const pts = grid[`${cx + ddx},${cy + ddy}`]
        if (!pts) continue
        for (const [px, py] of pts) {
          if (Math.hypot(px - x, py - y) < minDist) return true
        }
      }
    }
    return false
  }

  const maxTries = num * 30
  let tries = 0
  while (result.length < num && tries < maxTries) {
    tries++
    const x = Math.random()
    const y = Math.random()
    if (tooClose(x, y)) continue
    result.push([x, y])
    const k = `${Math.floor(x / cell)},${Math.floor(y / cell)}`
    if (!grid[k]) grid[k] = []
    grid[k].push([x, y])
  }
  return result
}

// ── Draw one crack segment ────────────────────────────────────────────────────
// Two passes – a wide translucent halo gives the glassy illuminated feel,
// then a thin bright core is the actual crack line.
function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r},${g},${b},${alpha})`
}

function drawCrackSegment(x1, y1, x2, y2) {
  const x1s = x1 * SIZE, y1s = y1 * SIZE
  const x2s = x2 * SIZE, y2s = y2 * SIZE

  // Halo pass – wide and very faint
  ctx.strokeStyle = hexToRgba(params.crackColor, 0.10)
  ctx.lineWidth   = 4.0
  ctx.beginPath()
  ctx.moveTo(x1s, y1s)
  ctx.lineTo(x2s, y2s)
  ctx.stroke()

  // Core pass – thin and nearly opaque
  ctx.strokeStyle = hexToRgba(params.crackColor, 0.90)
  ctx.lineWidth   = 0.8
  ctx.beginPath()
  ctx.moveTo(x1s, y1s)
  ctx.lineTo(x2s, y2s)
  ctx.stroke()
}

// ── Fracture factory ──────────────────────────────────────────────────────────
// `speed` starts at 1.0 for root fractures and decreases each step.
// Children inherit a fraction of parent's current speed, so cracks near the
// seed are denser than cracks far from it.
function createFracture(x, y, angle, speed) {
  return { tip: [x, y], angle, speed, alive: true }
}

// ── Step one fracture ─────────────────────────────────────────────────────────
// Advances the tip by one step.  Returns true if still alive.
function stepFracture(f) {
  if (!f.alive) return false

  // Energy fades – slower fractures are less likely to spawn children later
  f.speed *= params.speedDecay

  const [cx, cy] = f.tip
  const fwdX = Math.cos(f.angle)
  const fwdY = Math.sin(f.angle)

  // 1. Find all attractors inside the field of vision
  const nearby = sourcesNear(cx, cy, params.fieldOfVision)

  // 2. Keep only those that are roughly ahead of us.
  //    dot = cosine between our direction and the vector to the attractor.
  //    Filtering out behind-us attractors keeps growth directional.
  const forwardDirs = []
  for (const [sx, sy] of nearby) {
    const ex   = sx - cx
    const ey   = sy - cy
    const dist = Math.hypot(ex, ey)
    if (dist < 1e-9) continue
    const dot = (fwdX * ex + fwdY * ey) / dist
    if (dot > params.forwardBias) {
      forwardDirs.push([ex / dist, ey / dist])  // unit vector toward attractor
    }
  }

  // 3. No visible attractors → domain exhausted, fracture stops
  if (forwardDirs.length === 0) {
    f.alive = false
    return false
  }

  // 4. Average all attractor directions → new growth unit vector.
  //    This is the core of the algorithm from the original Python code
  //    (masked_diff / masked_nrm summed and normalised).
  let sumX = 0, sumY = 0
  for (const [vx, vy] of forwardDirs) { sumX += vx; sumY += vy }
  const magn  = Math.hypot(sumX, sumY)
  const newDx = sumX / magn
  const newDy = sumY / magn

  // 5. Advance tip one step
  const newX = cx + newDx * params.stepSize
  const newY = cy + newDy * params.stepSize
  f.angle    = Math.atan2(newDy, newDx)

  // 6. Die if tip left the canvas
  if (newX < 0 || newX > 1 || newY < 0 || newY > 1) {
    f.alive = false
    return false
  }

  // 7. Collision: new tip is too close to an existing crack?
  //    Because stepSize (0.005) > collisionRadius (0.004), consecutive points
  //    on the SAME fracture are always more than collisionRadius apart, so a
  //    fracture can never accidentally collide with itself.
  if (hitsCrack(newX, newY, params.collisionRadius)) {
    f.alive = false
    return false
  }

  // 8. Accept the step – draw the new segment and register the tip for future collision checks
  const [px, py] = f.tip
  f.tip = [newX, newY]
  registerCrackPoint(newX, newY)
  drawCrackSegment(px, py, newX, newY)

  return true
}

// ── Spawn from fronts ─────────────────────────────────────────────────────────
// After every round of steps the alive tips can each fork a child.
// The child's direction is ±90° from the parent's current direction, with a
// small angular randomness added.  It inherits a fraction of the parent's speed.
// High-speed (fresh, near the seed) fractures spawn more often, creating the
// characteristic density gradient of real glass cracks.
const MAX_FRACTURES = 2000   // safety cap so the demo doesn't run forever

function spawnFromFronts() {
  const toAdd = []
  for (const f of aliveFractures) {
    if (aliveFractures.length + toAdd.length >= MAX_FRACTURES) break

    // Probability = currentSpeed × spawnRate
    if (Math.random() > f.speed * params.spawnRate) continue

    const [tx, ty]  = f.tip
    const side       = Math.random() < 0.5 ? 1 : -1
    const childAngle = f.angle + side * (Math.PI / 2) + (Math.random() - 0.5) * params.spawnAngleSpread
    const childSpeed = f.speed * params.childSpeedRatio

    toAdd.push(createFracture(tx, ty, childAngle, childSpeed))
  }
  aliveFractures.push(...toAdd)
}

// ── Global simulation step ────────────────────────────────────────────────────
// 1. Every alive fracture takes one step.
// 2. Dead ones are dropped (their path was already drawn incrementally).
// 3. Then surviving tips get a chance to spawn children.
function step() {
  if (!ctx) return
  ctx.lineCap  = 'round'
  ctx.lineJoin = 'round'

  const surviving = []
  for (const f of aliveFractures) {
    if (stepFracture(f)) surviving.push(f)
    // dead fractures are simply discarded — last segment already drawn
  }
  aliveFractures = surviving

  spawnFromFronts()
}

// ── Initialisation ─────────────────────────────────────────────────────────────
function init() {
  // Distribute attractor points (Poisson-disk darts)
  sources = distributeSourcesDarts(params.numSources, params.minSourceSpacing)
  buildSourceGrid()

  // Reset all fracture and collision state
  aliveFractures = []
  collisionGrid  = {}

  // Seed root fractures at random positions inside the central half of the canvas.
  // Random angles simulate multiple simultaneous impact sites (like dropped glass).
  for (let i = 0; i < params.numInitialCracks; i++) {
    const x     = 0.25 + Math.random() * 0.5
    const y     = 0.25 + Math.random() * 0.5
    const angle = Math.random() * Math.PI * 2
    aliveFractures.push(createFracture(x, y, angle, 1.0))
    // Register the seed position so later fractures can collide with it
    registerCrackPoint(x, y)
  }
}

// ── Reset ──────────────────────────────────────────────────────────────────────
function reset() {
  if (animId) cancelAnimationFrame(animId)
  ctx.fillStyle = params.bgColor
  ctx.fillRect(0, 0, SIZE, SIZE)
  init()
  startLoop()
}

// ── Render loop ────────────────────────────────────────────────────────────────
// Segments are drawn inside step() incrementally – no full-canvas redraw each frame.
// The loop stops automatically once all fractures have died, leaving the final
// crack pattern on the canvas.
function startLoop() {
  const loop = () => {
    for (let s = 0; s < params.speed; s++) step()
    if (aliveFractures.length > 0) {
      animId = requestAnimationFrame(loop)
    } else {
      animId = null  // simulation finished naturally
    }
  }
  animId = requestAnimationFrame(loop)
}

// ── Lifecycle ──────────────────────────────────────────────────────────────────
onMounted(() => {
  const el  = canvas.value
  el.width  = SIZE
  el.height = SIZE
  ctx = el.getContext('2d')

  ctx.fillStyle = params.bgColor
  ctx.fillRect(0, 0, SIZE, SIZE)

  init()
  startLoop()

  // ── Tweakpane GUI ─────────────────────────────────────────────────────────────
  pane = new Pane({ title: 'Fracture' })

  const simFolder = pane.addFolder({ title: 'Simulation' })
  simFolder.addBinding(params, 'speed',             { min: 1,     max: 20,    step: 1,      label: 'Steps per frame' })
  simFolder.addBinding(params, 'numSources',        { min: 500,   max: 8000,  step: 100,    label: 'Attractor sources' })
  simFolder.addBinding(params, 'minSourceSpacing',  { min: 0.004, max: 0.05,  step: 0.001,  label: 'Min source spacing' })
  simFolder.addBinding(params, 'numInitialCracks',  { min: 1,     max: 20,    step: 1,      label: 'Seed fractures' })

  const growthFolder = pane.addFolder({ title: 'Growth' })
  growthFolder.addBinding(params, 'fieldOfVision',  { min: 0.02,  max: 0.30,  step: 0.005,  label: 'Field of vision' })
  growthFolder.addBinding(params, 'forwardBias',    { min: -0.5,  max: 0.99,  step: 0.01,   label: 'Forward bias' })
  growthFolder.addBinding(params, 'stepSize',       { min: 0.003, max: 0.015, step: 0.001,  label: 'Step size' })
  growthFolder.addBinding(params, 'speedDecay',     { min: 0.980, max: 1.000, step: 0.0005, label: 'Speed decay' })

  const spawnFolder = pane.addFolder({ title: 'Spawning' })
  spawnFolder.addBinding(params, 'spawnRate',        { min: 0.01, max: 1.00,         step: 0.01,  label: 'Spawn rate' })
  spawnFolder.addBinding(params, 'spawnAngleSpread', { min: 0.00, max: Math.PI / 2,  step: 0.05,  label: 'Angle spread (rad)' })
  spawnFolder.addBinding(params, 'childSpeedRatio',  { min: 0.50, max: 1.00,         step: 0.01,  label: 'Child speed ratio' })

  const collisionFolder = pane.addFolder({ title: 'Collision' })
  collisionFolder.addBinding(params, 'collisionRadius', { min: 0.001, max: 0.010, step: 0.001, label: 'Collision radius' })

  const renderFolder = pane.addFolder({ title: 'Render' })
  renderFolder.addBinding(params, 'crackColor', { label: 'Crack colour' })
  renderFolder.addBinding(params, 'bgColor',    { label: 'Background' })

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
