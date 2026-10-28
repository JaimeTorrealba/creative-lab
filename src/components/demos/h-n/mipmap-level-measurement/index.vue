<script setup>
import { onBeforeUnmount } from 'vue'
import { useLoop, useTres } from '@tresjs/core'
import { Box3, Box3Helper, Color } from 'three/webgpu'
import { GROUND_URL, HEIGHT_URL } from './constants'
import { buildMipChain, loadImageDataFromUrl } from './mipChain'
import { createCalibrationTexture } from './calibration'
import { createChunkGeometries } from './terrain'
import { createStreamedTerrain } from './streamedTerrain'
import { createMeasurement } from './measurement'
import { createMipStreaming } from './streaming'
import { createMeasurementPane, refreshMeasurementStats } from './pane'

const params = { threshold: 0.15, chunksPerCycle: 4, calibrationView: false }

const { renderer, camera } = useTres()
const { onBeforeRender } = useLoop()

// TresCanvas initializes WebGPU asynchronously; the backend must exist before checking it
await renderer.init()
const isWebGPU = renderer.backend.isWebGPUBackend === true

const [heightData, groundData] = await Promise.all([
  loadImageDataFromUrl(HEIGHT_URL),
  loadImageDataFromUrl(GROUND_URL)
])
const mipChain = buildMipChain(groundData)
const calibrationTexture = createCalibrationTexture(groundData.width)
const geometries = createChunkGeometries(heightData)
const terrain = createStreamedTerrain({ geometries, mipChain, calibrationTexture })
const measurement = createMeasurement({ renderer, geometries, calibrationTexture })
const selectionHelper = new Box3Helper(new Box3(), new Color('#ffffff'))
selectionHelper.visible = false
let selectedChunkIndex = null

const refreshStats = () =>
  refreshMeasurementStats({ stats, terrain, streaming, params, chunkIndex: selectedChunkIndex })

const streaming = createMipStreaming({
  terrain,
  measurement,
  params,
  onBatchMeasured: () => refreshStats()
})

const { pane, stats } = createMeasurementPane({
  params,
  isWebGPU,
  onThresholdChange: () => {
    streaming.reapplyAllDecisions()
    refreshStats()
  },
  onCalibrationViewChange: (isEnabled) => terrain.setCalibrationView(isEnabled)
})
refreshStats()

const selectChunk = (event) => {
  const chunkIndex = event.object?.userData.chunkIndex
  if (chunkIndex === undefined) return
  selectedChunkIndex = chunkIndex
  selectionHelper.box.copy(terrain.chunks[chunkIndex].mesh.geometry.boundingBox)
  selectionHelper.visible = true
  refreshStats()
}

onBeforeRender(() => {
  if (!isWebGPU || !camera.value) return
  streaming.update(camera.value)
})

onBeforeUnmount(() => {
  streaming.dispose()
  measurement.dispose()
  terrain.dispose()
  calibrationTexture.dispose()
  selectionHelper.dispose()
  pane.dispose()
})
</script>

<template>
  <primitive :object="terrain.group" @click="selectChunk" />
  <primitive :object="selectionHelper" />
  <TresDirectionalLight :position="[-20, 30, 10]" :intensity="2.5" />
  <TresAmbientLight :intensity="0.6" />
</template>
