<script setup>
import { computed, onUnmounted, watch } from 'vue'
import { useTresContext } from '@tresjs/core'
import { useGLTF } from '@tresjs/cientos'
import { Box3, Vector3 } from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js'
import { N8AOPass } from 'n8ao'
import { Pane } from 'tweakpane'

const { renderer, scene: tresScene, camera, sizes, controls } = useTresContext()

const { state } = useGLTF('/models/Ganz_render.glb')
const model = computed(() => state.value?.scene)

let composer
let n8aoPass
let pane
let initialized = false

const frameCamera = () => {
  const cam = camera.activeCamera.value
  if (!cam || !model.value) return
  const box = new Box3().setFromObject(model.value)
  const center = box.getCenter(new Vector3())
  const size = box.getSize(new Vector3())
  const maxDim = Math.max(size.x, size.y, size.z)
  // Open side faces +X (walls sit at -X, -Z, +Z): sit outside it and look in
  cam.position.set(center.x + maxDim * 1.1, center.y + size.y * 0.1, center.z)
  cam.lookAt(center)
  cam.near = maxDim / 100
  cam.far = maxDim * 10
  cam.updateProjectionMatrix()
  if (controls.value) {
    controls.value.target.copy(center)
    controls.value.update()
  }
}

const setupPane = () => {
  const c = n8aoPass.configuration
  pane = new Pane({ title: 'N8AO' })
  pane.addBinding(c, 'screenSpaceRadius', { label: 'screen-space radius' })
  pane.addBinding(c, 'aoRadius', { min: 0, max: 64, step: 1 })
  pane.addBinding(c, 'distanceFalloff', { min: 0, max: 1, step: 0.01 })
  pane.addBinding(c, 'intensity', { min: 0, max: 20, step: 0.1 })
  pane.addBinding(c, 'aoSamples', { min: 1, max: 64, step: 1 })
  pane.addBinding(c, 'denoiseSamples', { min: 1, max: 16, step: 1 })
  pane.addBinding(c, 'denoiseRadius', { min: 0, max: 24, step: 1 })
  pane.addBinding(c, 'halfRes', { label: 'half resolution' })

  const colorParams = { color: '#' + c.color.getHexString() }
  pane
    .addBinding(colorParams, 'color', { label: 'ao color' })
    .on('change', ({ value }) => c.color.set(value))

  const displayParams = { mode: 'Split' }
  pane
    .addBinding(displayParams, 'mode', {
      label: 'display',
      options: {
        Combined: 'Combined',
        AO: 'AO',
        'No AO': 'No AO',
        Split: 'Split',
        'Split AO': 'Split AO'
      }
    })
    .on('change', ({ value }) => n8aoPass.setDisplayMode(value))
}

const init = () => {
  if (initialized) return
  const gl = renderer.instance
  const cam = camera.activeCamera.value
  const width = sizes.width.value
  const height = sizes.height.value
  if (!gl || !tresScene.value || !cam || !width || !height || !model.value) return
  initialized = true

  frameCamera()

  composer = new EffectComposer(gl)
  composer.addPass(new RenderPass(tresScene.value, cam))

  n8aoPass = new N8AOPass(tresScene.value, cam, width, height)
  n8aoPass.configuration.screenSpaceRadius = true
  n8aoPass.configuration.aoRadius = 16
  n8aoPass.configuration.distanceFalloff = 0.2
  n8aoPass.configuration.intensity = 5
  n8aoPass.configuration.aoSamples = 16
  n8aoPass.configuration.denoiseSamples = 8
  n8aoPass.configuration.denoiseRadius = 12
  n8aoPass.setDisplayMode('Split')
  composer.addPass(n8aoPass)

  composer.addPass(new OutputPass())

  renderer.replaceRenderFunction((notifySuccess) => {
    composer.render()
    notifySuccess()
  })

  setupPane()
}

watch([model, () => renderer.instance, camera.activeCamera, () => sizes.width.value], init, {
  immediate: true
})

watch([() => sizes.width.value, () => sizes.height.value], ([width, height]) => {
  if (!composer || !width || !height) return
  composer.setSize(width, height)
  n8aoPass.setSize(width, height)
})

onUnmounted(() => {
  pane?.dispose()
  composer?.dispose()
})
</script>
<template>
  <primitive v-if="model" :object="model" />
  <TresAmbientLight :intensity="0.6" />
  <TresDirectionalLight :position="[3, 8, 5]" :intensity="1.2" />
</template>
