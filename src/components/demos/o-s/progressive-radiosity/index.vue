<script setup>
import { onUnmounted } from 'vue'
import { useLoop, useTres } from '@tresjs/core'
import { ACESFilmicToneMapping } from 'three'
import { createRadiosityScene, SURFACE_COLORS } from './radiosityScene'
import { createRadiositySolver } from './radiositySolver'
import { createRadiosityPane, VIEW } from './radiosityPane'

const params = {
  shotsPerBatch: 48,
  batchesPerFrame: 3,
  stopUnshot: 0.5,
  ambientTerm: true,
  density: 32,
  shooterBlock: 2,
  itemResolution: 256,
  softVisibility: true,
  depthTolerance: 1,
  showItemBuffer: false,
  lightPower: 40,
  lightColor: '#fff1dc',
  lightX: 0,
  lightZ: 0,
  swayLight: false,
  boxX: 0.42,
  boxZ: 0.35,
  boxRotation: -0.3,
  animateBox: false,
  animationSpeed: 1,
  whiteColor: SURFACE_COLORS.white,
  leftColor: SURFACE_COLORS.left,
  rightColor: SURFACE_COLORS.right,
  view: VIEW.RADIOSITY,
  exposure: 1.2,
  residualGain: 8
}

const stats = { elements: 0, shooters: 0, shots: 0, unshot: 100, state: 'solving' }
const clock = { box: 0, light: 0 }

const radiosityScene = createRadiosityScene()
const solver = createRadiositySolver(radiosityScene)
const { renderer, camera } = useTres()

const previousToneMapping = renderer.toneMapping
const previousExposure = renderer.toneMappingExposure
renderer.toneMapping = ACESFilmicToneMapping

const { pane, fpsGraph } = createRadiosityPane({
  params,
  stats,
  onRestart: () => solver.reset()
})

const getSettings = () => ({
  ...params,
  palette: {
    white: params.whiteColor,
    left: params.leftColor,
    right: params.rightColor,
    light: SURFACE_COLORS.light
  }
})

const clampLight = (value) => Math.min(Math.max(value, -0.65), 0.65)

const getSceneState = () => {
  const lightX = params.lightX + (params.swayLight ? Math.sin(clock.light * 0.6) * 0.45 : 0)
  const orbit = params.animateBox ? clock.box : 0
  return {
    light: { x: clampLight(lightX), z: params.lightZ },
    shortBox: {
      x: params.boxX + Math.sin(orbit * 0.7) * 0.12,
      z: params.boxZ + (Math.cos(orbit * 0.7) - 1) * 0.12,
      rotation: params.boxRotation + orbit * 0.6
    }
  }
}

const advanceClock = (delta) => {
  const step = Math.min(delta, 0.1) * params.animationSpeed
  if (params.animateBox) clock.box += step
  if (params.swayLight) clock.light += step
}

const updateStats = () => {
  const { converged, ...counts } = solver.getStats()
  Object.assign(stats, counts)
  const moving = params.animateBox || params.swayLight
  stats.state = moving ? 'moving' : converged ? 'converged' : 'solving'
}

const { onBeforeRender, render } = useLoop()

onBeforeRender(({ delta }) => advanceClock(delta))

render((notifySuccess) => {
  if (!camera.value) {
    notifySuccess()
    return
  }
  fpsGraph.begin()
  const settings = getSettings()
  renderer.toneMappingExposure = params.exposure
  solver.sync(settings, getSceneState())
  solver.step(renderer, settings)
  const view = { camera: camera.value, mode: params.view, residualGain: params.residualGain }
  solver.render(renderer, view, settings)
  updateStats()
  fpsGraph.end()
  notifySuccess()
})

onUnmounted(() => {
  pane.dispose()
  solver.dispose()
  renderer.toneMapping = previousToneMapping
  renderer.toneMappingExposure = previousExposure
  renderer.autoClear = true
  renderer.setRenderTarget(null)
})
</script>

<template>
  <TresGroup />
</template>
