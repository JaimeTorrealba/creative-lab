<script setup>
import { onUnmounted } from 'vue'
import { useLoop, useTres } from '@tresjs/core'
import { Color } from 'three'
import { createCornellScene, SURFACE_COLORS } from './cornellScene'
import { createPipeline, VIEW } from './pipeline'
import { createGiPane } from './giPane'

const params = {
  directionsPerFrame: 8,
  layers: 4,
  bundleResolution: 512,
  bounces: 3,
  normalBias: 0.008,
  slopeBias: 1.5,
  peelEpsilon: 0.002,
  maxDirections: 1024,
  directionsPerBounce: 256,
  vertexDirectionsPerFrame: 32,
  temporal: 0.9,
  warmup: 48,
  lightPower: 8,
  lightColor: '#fff1dc',
  softness: 0.004,
  shadowBias: 0.002,
  shadowNormalOffset: 1,
  swayLight: false,
  environmentColor: '#2b3a52',
  environmentStrength: 0,
  animateSphere: true,
  sphereSpeed: 1,
  leftColor: SURFACE_COLORS.left,
  rightColor: SURFACE_COLORS.right,
  sphereColor: SURFACE_COLORS.sphere,
  view: VIEW.FINAL,
  exposure: 1,
  resolutionScale: 1,
  antialias: true,
  aaSamples: 16,
  aaMovingBlend: 0.5,
  debugDirection: 0,
  debugLayer: 0
}

const stats = { screenDirections: 0, vertexPasses: 0, raysPerFrame: 0, aaSamples: 0 }
const settings = { ...params, environment: new Color(), animated: true }

const cornell = createCornellScene()
const pipeline = createPipeline(cornell)
const { renderer, camera } = useTres()

const syncSettings = () => {
  Object.assign(settings, params)
  settings.environment.set(params.environmentColor).multiplyScalar(params.environmentStrength)
  settings.animated = params.animateSphere || params.swayLight
}

const { pane, fpsGraph } = createGiPane({
  params,
  stats,
  onReset: () => pipeline.resetAll(),
  onViewChange: () => pipeline.resetColor(),
  onSurfaceColor: (surface, hex) => cornell.setSurfaceColor(surface, hex)
})

const clock = { sphere: 0, light: 0 }

const animateScene = (delta) => {
  if (params.animateSphere) clock.sphere += delta * params.sphereSpeed
  if (params.swayLight) clock.light += delta
  cornell.placeSphere(clock.sphere)
  cornell.placeLight(clock.light, params.swayLight)
  cornell.updateDynamicPoints()
}

const updateStats = () => {
  const { screenDirections, vertexPasses, aaSamples } = pipeline.getStats()
  stats.screenDirections = screenDirections
  stats.vertexPasses = vertexPasses
  stats.aaSamples = aaSamples
  const tracing = settings.animated || screenDirections < params.maxDirections
  stats.raysPerFrame = tracing ? params.directionsPerFrame * params.bundleResolution ** 2 : 0
}

const { onBeforeRender, render } = useLoop()

onBeforeRender(({ delta }) => {
  syncSettings()
  if (settings.animated) animateScene(Math.min(delta, 0.1))
})

render((notifySuccess) => {
  if (!camera.value) {
    notifySuccess()
    return
  }
  fpsGraph.begin()
  pipeline.renderFrame(renderer, camera.value, settings)
  updateStats()
  fpsGraph.end()
  notifySuccess()
})

animateScene(0)

onUnmounted(() => {
  pane.dispose()
  pipeline.dispose()
  cornell.dispose()
  renderer.autoClear = true
  renderer.setRenderTarget(null)
})
</script>

<template>
  <TresGroup />
</template>
