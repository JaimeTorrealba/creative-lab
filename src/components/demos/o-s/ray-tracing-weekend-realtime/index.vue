<script setup>
import { onMounted, onUnmounted, ref, shallowRef } from 'vue'
import { Pane } from 'tweakpane'
import * as EssentialsPlugin from '@tweakpane/plugin-essentials'
import { requestRTDevice } from '@/utils/renderComputeToImage'
import { createRealtimeRenderer } from './realtimeRenderer'
import { createFlyCamera } from './flyCamera'
import { buildFinalSceneBuffers } from './world'

// Listing [scene-final]'s camera; the rest are real-time knobs.
const params = {
  vfov: 20,
  defocus_angle: 0.6,
  focus_dist: 10,
  max_depth: 50,
  samples_per_pixel: 500,
  samples_per_frame: 1,
  render_scale: 1,
  move_speed: 3
}
const stats = { samples: 0 }

const canvasRef = shallowRef(null)
const isSupported = ref(true)
const isPointerLocked = ref(false)
let device = null
let renderer = null
let flyCamera = null
let pane = null
let fpsGraph = null
let frameId = 0
let lastFrameTime = performance.now()
let isFrameInFlight = false
let isUnmounted = false
const accumulation = { sampleStart: 0, seedOffset: 0 }

const restartAccumulation = () => {
  accumulation.sampleStart = 0
}

const syncCanvasSize = () => {
  const canvas = canvasRef.value
  const width = Math.max(1, Math.floor(canvas.clientWidth * params.render_scale))
  const height = Math.max(1, Math.floor(canvas.clientHeight * params.render_scale))
  const size = renderer.getSize()
  if (size.width === width && size.height === height) return
  renderer.resize(width, height)
  restartAccumulation()
}

const renderSamples = () => {
  const { sampleStart, seedOffset } = accumulation
  const sampleCount = Math.min(params.samples_per_frame, params.samples_per_pixel - sampleStart)
  if (sampleCount <= 0) return
  isFrameInFlight = true
  const frame = { view: flyCamera.getView(), params, sampleStart, sampleCount, seedOffset }
  // Timed from submit to GPU completion, so the graph counts path-traced frames, not rAF
  // ticks; it holds its last value once accumulation reaches samples_per_pixel.
  fpsGraph.begin()
  renderer
    .renderFrame(frame)
    .then(() => fpsGraph.end())
    .catch((error) => !isUnmounted && console.error(error))
    .finally(() => (isFrameInFlight = false))
  accumulation.sampleStart += sampleCount
  accumulation.seedOffset += sampleCount
  stats.samples = accumulation.sampleStart
}

// Input is read every animation frame; a new frame is only submitted once the GPU is done
// with the previous one, so a slow GPU doesn't pile up work.
const runFrameLoop = (now) => {
  frameId = requestAnimationFrame(runFrameLoop)
  const deltaSeconds = (now - lastFrameTime) / 1000
  lastFrameTime = now
  if (flyCamera.update(deltaSeconds, params)) restartAccumulation()
  if (isFrameInFlight) return
  syncCanvasSize()
  renderSamples()
}

const createTweakPane = () => {
  pane = new Pane({ title: 'Ray Tracing in One Weekend' })
  pane.registerPlugin(EssentialsPlugin)
  const cameraFolder = pane.addFolder({ title: 'Camera (book)' })
  cameraFolder.addBinding(params, 'vfov', { min: 5, max: 120, step: 1 })
  cameraFolder.addBinding(params, 'defocus_angle', {
    label: 'depth of field',
    min: 0,
    max: 10,
    step: 0.1
  })
  cameraFolder.addBinding(params, 'focus_dist', { min: 0.5, max: 30, step: 0.1 })
  cameraFolder.addBinding(params, 'max_depth', { min: 1, max: 50, step: 1 })
  cameraFolder.addBinding(params, 'samples_per_pixel', { min: 1, max: 5000, step: 1 })
  const realtimeFolder = pane.addFolder({ title: 'Real time' })
  realtimeFolder.addBinding(params, 'samples_per_frame', { min: 1, max: 16, step: 1 })
  realtimeFolder.addBinding(params, 'render_scale', { min: 0.25, max: 1, step: 0.05 })
  realtimeFolder.addBinding(params, 'move_speed', { min: 0.5, max: 20, step: 0.5 })
  realtimeFolder.addBinding(stats, 'samples', { readonly: true, format: (value) => `${value}` })
  fpsGraph = realtimeFolder.addBlade({ view: 'fpsgraph', label: 'fps', rows: 2 })
  // Only the book's camera changes the image; listening on the whole pane would also catch the
  // read-only monitor and the fps graph, which emit 'change' on every refresh and restart the accumulation.
  cameraFolder.on('change', restartAccumulation)
}

onMounted(async () => {
  device = await requestRTDevice()
  if (!device || isUnmounted) {
    isSupported.value = Boolean(device)
    return
  }
  const world = buildFinalSceneBuffers()
  renderer = await createRealtimeRenderer({ device, canvas: canvasRef.value, world })
  if (isUnmounted) return
  flyCamera = createFlyCamera({
    element: canvasRef.value,
    lookfrom: [13, 2, 3],
    lookat: [0, 0, 0],
    onPointerLockChange: (isLocked) => (isPointerLocked.value = isLocked)
  })
  createTweakPane()
  frameId = requestAnimationFrame(runFrameLoop)
})

onUnmounted(() => {
  isUnmounted = true
  cancelAnimationFrame(frameId)
  flyCamera?.dispose()
  pane?.dispose()
  renderer?.destroy()
  device?.destroy()
})
</script>

<template>
  <div class="rt-realtime">
    <canvas ref="canvasRef" class="rt-canvas" />
    <p v-if="!isSupported" class="rt-hint has-text-danger">
      WebGPU is not supported in this browser.
    </p>
    <p v-else-if="!isPointerLocked" class="rt-hint">
      Click to look around · WASD move · Q up · E down · Esc releases the mouse
    </p>
  </div>
</template>

<style scoped>
.rt-realtime {
  position: fixed;
  inset: 0;
  background: #000;
}
.rt-canvas {
  display: block;
  width: 100%;
  height: 100%;
  cursor: crosshair;
}
.rt-hint {
  position: absolute;
  left: 50%;
  bottom: 1.5rem;
  transform: translateX(-50%);
  padding: 0.3rem 0.8rem;
  font-size: 0.85rem;
  color: #eee;
  background: rgb(0 0 0 / 60%);
  border-radius: 4px;
  pointer-events: none;
}
</style>
