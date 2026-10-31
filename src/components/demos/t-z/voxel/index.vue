<script setup>
import { shallowRef, onUnmounted } from 'vue'
import { MeshLambertMaterial } from 'three'
import { useLoop, useTres } from '@tresjs/core'
import { useEventListener } from '@vueuse/core'
import { loadVoxelModels, disposeVoxelModels } from './models'
import { voxelizeModel } from './voxelizeModel'
import {
  createVoxelGeometry,
  createVoxelMesh,
  growVoxelPool,
  killVoxelTweens,
  morphVoxels
} from './voxelMorph'
import { createVoxelPane } from './pane'

const MODEL_SIZE = 9
const CLICK_MAX_DURATION = 200

const params = { modelIndex: 0, gridSize: 0.24, boxSize: 0.24, boxRoundness: 0.03 }
const voxels = []
const material = new MeshLambertMaterial()
let geometry = createVoxelGeometry(params)
let voxelsPerModel = []
let activeModelIndex = params.modelIndex

const voxelMesh = shallowRef()
const lightHolderRef = shallowRef()

const models = await loadVoxelModels(MODEL_SIZE)

const voxelizeAllModels = () => {
  voxelsPerModel = models.map(({ scene }) => voxelizeModel(scene, params.gridSize))
}

const getMaxVoxelCount = () => Math.max(...voxelsPerModel.map((modelVoxels) => modelVoxels.length))

const ensureVoxelCapacity = () => {
  growVoxelPool(voxels, getMaxVoxelCount(), params.gridSize)
  const currentMesh = voxelMesh.value
  if (currentMesh && currentMesh.instanceMatrix.count >= voxels.length) return

  const nextMesh = createVoxelMesh({ geometry, material, voxels })
  if (currentMesh) {
    killVoxelTweens(currentMesh, voxels)
    nextMesh.rotation.copy(currentMesh.rotation)
    currentMesh.dispose()
  }
  voxelMesh.value = nextMesh
}

const showModel = (index) => {
  activeModelIndex = index
  params.modelIndex = index
  morphVoxels({ mesh: voxelMesh.value, voxels, targetVoxels: voxelsPerModel[index] })
}

const handleModelChange = (index) => {
  if (index !== activeModelIndex) showModel(index)
}

const handleGridChange = () => {
  voxelizeAllModels()
  ensureVoxelCapacity()
  showModel(activeModelIndex)
}

const handleBoxChange = () => {
  const previousGeometry = geometry
  geometry = createVoxelGeometry(params)
  voxelMesh.value.geometry = geometry
  previousGeometry.dispose()
}

voxelizeAllModels()
ensureVoxelCapacity()
showModel(activeModelIndex)

const pane = createVoxelPane({
  params,
  onModelChange: handleModelChange,
  onGridChange: handleGridChange,
  onBoxChange: handleBoxChange
})

const showNextModel = () => {
  showModel((activeModelIndex + 1) % models.length)
  pane.refresh()
}

// A quick click cycles models; a longer press is an orbit drag
const { renderer, camera } = useTres()
let pointerDownTime = 0
useEventListener(renderer.domElement, 'pointerdown', () => (pointerDownTime = performance.now()))
useEventListener(renderer.domElement, 'pointerup', () => {
  if (performance.now() - pointerDownTime < CLICK_MAX_DURATION) showNextModel()
})

// Lights and shadow plane follow the camera, so the auto-rotating view keeps the same lighting
const { onBeforeRender } = useLoop()
onBeforeRender(() => {
  lightHolderRef.value?.quaternion.copy(camera.value.quaternion)
})

onUnmounted(() => {
  pane.dispose()
  killVoxelTweens(voxelMesh.value, voxels)
  voxelMesh.value.dispose()
  geometry.dispose()
  material.dispose()
  disposeVoxelModels(models)
})
</script>

<template>
  <primitive :object="voxelMesh" />
  <TresAmbientLight :intensity="1.5" />
  <TresGroup ref="lightHolderRef">
    <TresSpotLight
      :position="[0, 15, 3]"
      :intensity="1.3"
      :decay="0"
      cast-shadow
      :shadow-mapSize-width="1024"
      :shadow-mapSize-height="1024"
      :shadow-camera-near="10"
      :shadow-camera-far="30"
    />
    <TresSpotLight :position="[0, -4, 5]" :intensity="1.3" :decay="0" />
    <TresMesh :position="[0, -4, 0]" :rotation="[-Math.PI / 2, 0, 0]" receive-shadow>
      <TresPlaneGeometry :args="[35, 35]" />
      <TresShadowMaterial :opacity="0.1" />
    </TresMesh>
  </TresGroup>
</template>
