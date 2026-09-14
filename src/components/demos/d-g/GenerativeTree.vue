<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { Pane } from 'tweakpane'

const canvas = ref(null)
let animId = null
let ctx = null
let pane = null

// ── Canvas resolution ────────────────────────────────────────────────────────
const SIZE = 800
const ONE = 1 / SIZE // one pixel in normalised [0,1] space

// ── Tweakpane parameters ──────────────────────────────────────────────────────
// Based on inconvergent/tree (Python) – translated to JS & normalised coords.
const params = {
  speed: 3, // simulation steps per animation frame
  initRadius: 0.025, // trunk starting radius (normalised)
  branchDiminish: 0.000022, // radius lost per step (linear thinning)
  splitDiminish: 0.71, // child branch radius as fraction of parent
  splitAngle: 0.3 * Math.PI, // max fork deviation angle (radians)
  splitProbScale: 0.18, // branching probability multiplier
  angleDrift: 0.003, // max normal-distributed angle drift per step
  angleExp: 2.2, // drift bias exponent (tips curve more than trunk)
  lineWidth: 1.0, // rendering line width multiplier
  bgColor: '#111111', // canvas background colour
  branchColor: '#fff5e6' // branch stroke colour (warm cream)
}

// ── Per-branch state ──────────────────────────────────────────────────────────
// Each branch is a plain object: { x, y, r, a, g, prevX, prevY }
//   x, y   – current tip position (normalised)
//   r       – current radius (normalised), decreases each step
//   a       – current growth angle (radians)
//   g       – generation depth (0 = trunk)
//   prevX/Y – previous tip position, so we can draw segments
let branches = []
let rootR = 0 // initial trunk radius, kept for probability/drift formulas

const MAX_BRANCHES = 2000 // safety cap to prevent runaway growth

// ── Box-Muller normal distribution ───────────────────────────────────────────
function randomNormal() {
  const u = 1 - Math.random()
  const v = Math.random()
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
}

// ── Draw one branch segment ────────────────────────────────────────────────────
// Draws a round-capped line from prevX/Y to x/y with width proportional to radius.
function drawSegment(b) {
  const alpha = Math.min(0.95, 0.45 + (b.r / rootR) * 0.55) // thicker = more opaque
  ctx.strokeStyle = hexToRgba(params.branchColor, alpha)
  ctx.lineWidth = Math.max(0.5, b.r * SIZE * 2 * params.lineWidth)
  ctx.beginPath()
  ctx.moveTo(b.prevX * SIZE, b.prevY * SIZE)
  ctx.lineTo(b.x * SIZE, b.y * SIZE)
  ctx.stroke()
}

// ── Hex colour → rgba string ───────────────────────────────────────────────────
function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r},${g},${b},${alpha})`
}

// ── Simulation step ────────────────────────────────────────────────────────────
// Processes every active branch once:
//   1. Thin the branch (reduce r)
//   2. Drift the growth angle
//   3. Advance the tip by one pixel
//   4. Die if too thin or out of bounds
//   5. Possibly create a forked child branch
//
// Directly derived from Branch.step() and Tree.step() in inconvergent/tree.
function step() {
  if (!ctx || branches.length === 0) return

  ctx.lineCap = 'round'

  const toAdd = []
  const toRemove = []

  for (let i = 0; i < branches.length; i++) {
    const b = branches[i]

    // 1. Thin the branch linearly (original: self.r -= branch_diminish)
    b.r -= params.branchDiminish

    // 2. Angle drift — scales with how depleted the branch is.
    //    Original formula: scale = one + root_r - r
    //                      da    = (1 + scale/root_r) ** angle_exp
    //    When fresh (r≈rootR): da≈1.  When dying (r≈ONE): da≈2^angleExp ≈ 4.6.
    const scale = ONE + rootR - b.r
    const driftFactor = Math.pow(1 + scale / rootR, params.angleExp)
    b.a += driftFactor * randomNormal() * params.angleDrift

    // 3. Advance tip one normalised pixel in growth direction
    b.prevX = b.x
    b.prevY = b.y
    b.x += Math.cos(b.a) * ONE
    b.y += Math.sin(b.a) * ONE

    // 4a. Die if radius drops below one pixel
    if (b.r <= ONE) {
      toRemove.push(i)
      continue
    }

    // 4b. Die if the tip has left the canvas
    if (b.x < 0 || b.x > 1 || b.y < 0 || b.y > 1) {
      toRemove.push(i)
      continue
    }

    // 5. Draw the segment this step produced
    drawSegment(b)

    // 6. Branching probability — increases as the branch thins.
    //    Original: branch_prob = (root_r - r + one) * branch_prob_scale
    if (branches.length + toAdd.length < MAX_BRANCHES) {
      const prob = (rootR - b.r + ONE) * params.splitProbScale
      if (Math.random() < prob) {
        const sign = Math.random() < 0.5 ? 1 : -1
        const forkA = sign * Math.random() * params.splitAngle
        const childR = b.r * params.splitDiminish
        if (childR > ONE) {
          toAdd.push({
            x: b.x,
            y: b.y,
            r: childR,
            a: b.a + forkA,
            g: b.g + 1,
            prevX: b.x,
            prevY: b.y
          })
        }
      }
    }
  }

  // Remove dead branches (reverse order to preserve indices)
  for (let i = toRemove.length - 1; i >= 0; i--) {
    branches.splice(toRemove[i], 1)
  }

  branches.push(...toAdd)
}

// ── Initialisation ─────────────────────────────────────────────────────────────
// Starts with a single trunk at the bottom centre growing straight up.
function init() {
  branches = []
  rootR = params.initRadius
  branches.push({
    x: 0.5,
    y: 0.92, // slightly above bottom edge
    r: params.initRadius,
    a: -Math.PI / 2, // −90° = straight up
    g: 0,
    prevX: 0.5,
    prevY: 0.92
  })
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
function startLoop() {
  const loop = () => {
    for (let s = 0; s < params.speed; s++) step()
    animId = requestAnimationFrame(loop)
  }
  animId = requestAnimationFrame(loop)
}

// ── Lifecycle ──────────────────────────────────────────────────────────────────
onMounted(() => {
  const el = canvas.value
  el.width = SIZE
  el.height = SIZE
  ctx = el.getContext('2d')

  ctx.fillStyle = params.bgColor
  ctx.fillRect(0, 0, SIZE, SIZE)

  init()
  startLoop()

  // ── Tweakpane GUI ────────────────────────────────────────────────────────────
  pane = new Pane({ title: 'Generative Tree' })

  const simFolder = pane.addFolder({ title: 'Simulation' })
  simFolder.addBinding(params, 'speed', { min: 1, max: 20, step: 1, label: 'Speed (steps/frame)' })
  simFolder.addBinding(params, 'initRadius', {
    min: 0.005,
    max: 0.06,
    step: 0.001,
    label: 'Trunk radius'
  })
  simFolder.addBinding(params, 'branchDiminish', {
    min: 5e-6,
    max: 0.0002,
    step: 1e-6,
    label: 'Diminish rate'
  })

  const branchFolder = pane.addFolder({ title: 'Branching' })
  branchFolder.addBinding(params, 'splitDiminish', {
    min: 0.4,
    max: 0.95,
    step: 0.01,
    label: 'Split size ratio'
  })
  branchFolder.addBinding(params, 'splitAngle', {
    min: 0.05,
    max: Math.PI,
    step: 0.01,
    label: 'Split angle (rad)'
  })
  branchFolder.addBinding(params, 'splitProbScale', {
    min: 0.01,
    max: 1.0,
    step: 0.01,
    label: 'Split probability'
  })

  const curveFolder = pane.addFolder({ title: 'Curvature' })
  curveFolder.addBinding(params, 'angleDrift', {
    min: 0.0005,
    max: 0.015,
    step: 0.0005,
    label: 'Angle drift'
  })
  curveFolder.addBinding(params, 'angleExp', {
    min: 0.5,
    max: 5.0,
    step: 0.1,
    label: 'Drift exponent'
  })

  const renderFolder = pane.addFolder({ title: 'Render' })
  renderFolder.addBinding(params, 'lineWidth', {
    min: 0.1,
    max: 3.0,
    step: 0.05,
    label: 'Line width'
  })
  renderFolder.addBinding(params, 'branchColor', { label: 'Branch colour' })
  renderFolder.addBinding(params, 'bgColor', { label: 'Background' })

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
