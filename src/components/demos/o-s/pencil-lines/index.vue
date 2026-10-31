<script setup>
import { onUnmounted, reactive, shallowRef, watch } from 'vue'
import { useLoop, useTres } from '@tresjs/core'
import { useTexture } from '@tresjs/cientos'
import { Pane } from 'tweakpane'
import { createPencilLinesPass, VIEW } from './pencilLinesPass'

const pass = createPencilLinesPass()

const params = reactive({
  view: VIEW.FINAL,
  lineColor: '#29101a',
  diffuseWeight: 0.6,
  normalWeight: 0.3,
  grain: 10,
  edgeLow: 0.01,
  edgeHigh: 0.03,
  diffuseWobble: 1 / 40,
  normalWobble: 1 / 50,
  knotColor: '#99dd99',
  exposure: 1.75,
  spin: false,
  spinSpeed: 0.3
})

const knotRef = shallowRef()
// The render override outlives the component, so it has to know when to stop.
let disposed = false

const { state: cloudTexture } = useTexture('/textures/pencil-lines/cloud-noise.png')
watch(cloudTexture, (texture) => (pass.uniforms.uCloudTexture.value = texture ?? null), {
  immediate: true
})

const { renderer, scene, camera, sizes } = useTres()

watch(
  [sizes.width, sizes.height, sizes.pixelRatio],
  ([width, height, pixelRatio]) => {
    if (!width || !height) return
    const dpr = Math.min(pixelRatio, 2)
    pass.setSize(Math.round(width * dpr), Math.round(height * dpr))
  },
  { immediate: true }
)

const { onBeforeRender, render } = useLoop()

onBeforeRender(({ delta }) => {
  if (!params.spin || !knotRef.value) return
  knotRef.value.rotation.y += delta * params.spinSpeed
})

render((notifySuccess) => {
  if (!disposed && camera.value && scene.value) {
    pass.render({ renderer, scene: scene.value, camera: camera.value })
  }
  notifySuccess()
})

const pane = new Pane({ title: 'Pencil Lines' })

pane
  .addBinding(params, 'view', {
    label: 'view',
    options: {
      Final: VIEW.FINAL,
      'Lines only': VIEW.LINES,
      Normals: VIEW.NORMALS,
      'No lines': VIEW.SCENE
    }
  })
  .on('change', ({ value }) => (pass.uniforms.uView.value = value))

const linesFolder = pane.addFolder({ title: 'Lines' })
linesFolder
  .addBinding(params, 'lineColor', { label: 'color' })
  .on('change', ({ value }) => pass.uniforms.uLineColor.value.set(value))
linesFolder
  .addBinding(params, 'diffuseWeight', { label: 'colour edges', min: 0, max: 2, step: 0.01 })
  .on('change', ({ value }) => (pass.uniforms.uDiffuseWeight.value = value))
linesFolder
  .addBinding(params, 'normalWeight', { label: 'normal edges', min: 0, max: 1, step: 0.01 })
  .on('change', ({ value }) => (pass.uniforms.uNormalWeight.value = value))
linesFolder
  .addBinding(params, 'grain', { label: 'grain', min: 0, max: 30, step: 0.1 })
  .on('change', ({ value }) => (pass.uniforms.uGrain.value = value))
linesFolder
  .addBinding(params, 'edgeLow', { label: 'threshold low', min: 0, max: 0.1, step: 0.001 })
  .on('change', ({ value }) => (pass.uniforms.uEdgeLow.value = value))
linesFolder
  .addBinding(params, 'edgeHigh', { label: 'threshold high', min: 0.001, max: 0.2, step: 0.001 })
  .on('change', ({ value }) => (pass.uniforms.uEdgeHigh.value = value))

const wobbleFolder = pane.addFolder({ title: 'Wobble' })
wobbleFolder
  .addBinding(params, 'diffuseWobble', { label: 'colour', min: 0, max: 0.1, step: 0.001 })
  .on('change', ({ value }) => (pass.uniforms.uDiffuseWobble.value = value))
wobbleFolder
  .addBinding(params, 'normalWobble', { label: 'normal', min: 0, max: 0.1, step: 0.001 })
  .on('change', ({ value }) => (pass.uniforms.uNormalWobble.value = value))

const sceneFolder = pane.addFolder({ title: 'Scene', expanded: false })
sceneFolder.addBinding(params, 'knotColor', { label: 'knot' })
sceneFolder
  .addBinding(params, 'exposure', { label: 'exposure', min: 0.2, max: 3, step: 0.01 })
  .on('change', ({ value }) => (renderer.toneMappingExposure = value))
sceneFolder.addBinding(params, 'spin', { label: 'spin' })
sceneFolder.addBinding(params, 'spinSpeed', { label: 'spin speed', min: 0, max: 2, step: 0.01 })

onUnmounted(() => {
  disposed = true
  pane.dispose()
  pass.dispose()
})
</script>

<template>
  <TresMesh :rotation-x="-Math.PI / 2" receive-shadow>
    <TresPlaneGeometry :args="[10, 10]" />
    <TresMeshStandardMaterial color="#ffffff" />
  </TresMesh>

  <TresMesh ref="knotRef" :position="[0, 0.5, 0]" :rotation-y="Math.PI / 4" cast-shadow>
    <TresTorusKnotGeometry :args="[1, 0.3, 200, 32]" />
    <TresMeshBasicMaterial :color="params.knotColor" />
  </TresMesh>

  <TresAmbientLight :intensity="0.5" />
  <TresDirectionalLight
    :position="[2, 2, 2]"
    :intensity="1"
    cast-shadow
    :shadow-mapSize-width="2048"
    :shadow-mapSize-height="2048"
  />
</template>
