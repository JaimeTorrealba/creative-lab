<script setup>
import { onUnmounted, reactive, shallowRef, watch } from 'vue'
import { useLoop, useTres } from '@tresjs/core'
import { useGLTF } from '@tresjs/cientos'
import { watchOnce } from '@vueuse/core'
import { Pane } from 'tweakpane'
import { createPipeline, setUncertainty, DEBUG, MODE } from './pipeline'

// One colour per part of the model, so the sketchy shade map has the flat colour
// patches the chapter asks for instead of a single grey mass.
const PART_COLORS = {
  outerHull: '#c5542e',
  axle: '#3a6f99',
  gears: '#d2a53c'
}

const pipeline = createPipeline()

const params = reactive({
  mode: MODE.BLUEPRINT,
  debug: DEBUG.FINAL,
  lineWidth: 1,
  normalThreshold: 0.35,
  depthThreshold: 0.0035,
  blueprintLayers: 4,
  layerFade: 0.72,
  blueprintStrength: 1.35,
  blueprintLine: '#cfe4ff',
  blueprintPaper: '#0d2f63',
  grid: true,
  gridSpacing: 24,
  sketchyLayers: 1,
  style: 0,
  edgeUncertainty: 0.012,
  shadeUncertainty: 0.022,
  noiseScale: 4.5,
  octaves: 3,
  repeat: 1,
  boil: 6,
  inkStrength: 1.5,
  ink: '#25201c',
  sketchyPaper: '#f2ebdd',
  grain: 0.45,
  autoRotate: true,
  rotateSpeed: 0.12
})

const { state, isLoading } = useGLTF('/models/gears.glb', { draco: true })
const modelReady = shallowRef(false)
// The render override outlives the component, so it has to know when to stop.
let disposed = false

watchOnce(isLoading, (loading) => {
  if (loading) return
  state.value.scene.traverse((child) => {
    if (!child.isMesh) return
    child.material = pipeline.createShadeMaterial(PART_COLORS[child.name] ?? '#b3ada1')
  })
  modelReady.value = true
})

const { renderer, scene, camera, sizes } = useTres()

watch(
  [sizes.width, sizes.height, sizes.pixelRatio],
  ([width, height, pixelRatio]) => {
    if (!width || !height) return
    const dpr = Math.min(pixelRatio, 2)
    pipeline.setSize(Math.round(width * dpr), Math.round(height * dpr))
  },
  { immediate: true }
)

const { onBeforeRender, render } = useLoop()

onBeforeRender(({ elapsed }) => {
  if (params.autoRotate && modelReady.value) {
    state.value.scene.rotation.y = elapsed * params.rotateSpeed
  }

  // Boiling: quantising time makes the uncertainty field re-roll in discrete steps,
  // the way the ink moves between frames of hand-drawn animation. Zero freezes it.
  // The seed wraps because an ever-growing offset would eventually swamp the noise
  // coordinates in float32 and flatten the turbulence out.
  pipeline.sketchyUniforms.uSeed.value =
    params.boil > 0 ? (Math.floor(elapsed * params.boil) % 128) * 7.31 : 0

  // Two matrices at different angles is what 15.3 means by two degrees of
  // uncertainty: the ink and the colour drift in different directions.
  setUncertainty(pipeline.sketchyUniforms.uEdgeMatrix.value, params.edgeUncertainty, 0)
  setUncertainty(pipeline.sketchyUniforms.uShadeMatrix.value, params.shadeUncertainty, 1.15)
})

render((notifySuccess) => {
  if (disposed || !camera.value || !scene.value) {
    notifySuccess()
    return
  }

  pipeline.render({
    renderer,
    scene: scene.value,
    camera: camera.value,
    mode: params.mode,
    debug: params.debug,
    layers: params.mode === MODE.SKETCHY ? params.sketchyLayers : params.blueprintLayers,
    layerFade: params.layerFade
  })

  notifySuccess()
})

const pane = new Pane({ title: 'Blueprint & Sketchy' })

const modeBinding = pane.addBinding(params, 'mode', {
  label: 'render',
  options: { Blueprint: MODE.BLUEPRINT, Sketchy: MODE.SKETCHY }
})

const edgeFolder = pane.addFolder({ title: 'Edges' })
edgeFolder
  .addBinding(params, 'lineWidth', { label: 'line width (px)', min: 0.5, max: 4, step: 0.1 })
  .on('change', ({ value }) => (pipeline.edgeUniforms.uLineWidth.value = value))
edgeFolder
  .addBinding(params, 'normalThreshold', { label: 'crease', min: 0.02, max: 1.5, step: 0.01 })
  .on('change', ({ value }) => (pipeline.edgeUniforms.uNormalThreshold.value = value))
edgeFolder
  .addBinding(params, 'depthThreshold', { label: 'depth step', min: 0.0002, max: 0.02, step: 0.0002 })
  .on('change', ({ value }) => (pipeline.edgeUniforms.uDepthThreshold.value = value))

const blueprintFolder = pane.addFolder({ title: 'Blueprint' })
blueprintFolder.addBinding(params, 'blueprintLayers', {
  label: 'depth layers',
  min: 1,
  max: 6,
  step: 1
})
blueprintFolder.addBinding(params, 'layerFade', {
  label: 'layer fade',
  min: 0.2,
  max: 1,
  step: 0.01
})
blueprintFolder
  .addBinding(params, 'blueprintStrength', { label: 'line strength', min: 0.2, max: 4, step: 0.05 })
  .on('change', ({ value }) => (pipeline.blueprintUniforms.uLineStrength.value = value))
blueprintFolder
  .addBinding(params, 'blueprintLine', { label: 'line' })
  .on('change', ({ value }) => pipeline.blueprintUniforms.uLineColor.value.set(value))
blueprintFolder
  .addBinding(params, 'blueprintPaper', { label: 'paper' })
  .on('change', ({ value }) => pipeline.blueprintUniforms.uPaperColor.value.set(value))
blueprintFolder
  .addBinding(params, 'grid', { label: 'grid' })
  .on('change', ({ value }) => (pipeline.blueprintUniforms.uGrid.value = value ? 1 : 0))
blueprintFolder
  .addBinding(params, 'gridSpacing', { label: 'grid (px)', min: 8, max: 64, step: 1 })
  .on('change', ({ value }) => (pipeline.blueprintUniforms.uGridSpacing.value = value))

const sketchyFolder = pane.addFolder({ title: 'Sketchy' })
sketchyFolder.hidden = true
modeBinding.on('change', ({ value }) => {
  blueprintFolder.hidden = value === MODE.SKETCHY
  sketchyFolder.hidden = value !== MODE.SKETCHY
})

sketchyFolder
  .addBinding(params, 'style', {
    label: 'style',
    options: { 'Colour patches': 0, Graphite: 1 }
  })
  .on('change', ({ value }) => (pipeline.shadeUniforms.uGraphite.value = value))
sketchyFolder.addBinding(params, 'sketchyLayers', {
  label: 'depth layers',
  min: 1,
  max: 3,
  step: 1
})
sketchyFolder.addBinding(params, 'edgeUncertainty', {
  label: 'edge uncertainty',
  min: 0,
  max: 0.06,
  step: 0.001
})
sketchyFolder.addBinding(params, 'shadeUncertainty', {
  label: 'shade uncertainty',
  min: 0,
  max: 0.06,
  step: 0.001
})
sketchyFolder
  .addBinding(params, 'noiseScale', { label: 'noise scale', min: 1, max: 14, step: 0.1 })
  .on('change', ({ value }) => (pipeline.sketchyUniforms.uNoiseScale.value = value))
sketchyFolder
  .addBinding(params, 'octaves', { label: 'octaves', min: 1, max: 5, step: 1 })
  .on('change', ({ value }) => (pipeline.sketchyUniforms.uOctaves.value = value))
sketchyFolder
  .addBinding(params, 'repeat', { label: 'repeated edges', min: 1, max: 3, step: 1 })
  .on('change', ({ value }) => (pipeline.sketchyUniforms.uRepeat.value = value))
sketchyFolder.addBinding(params, 'boil', { label: 'boil (steps/s)', min: 0, max: 16, step: 1 })
sketchyFolder
  .addBinding(params, 'inkStrength', { label: 'ink strength', min: 0.2, max: 4, step: 0.05 })
  .on('change', ({ value }) => (pipeline.sketchyUniforms.uLineStrength.value = value))
sketchyFolder
  .addBinding(params, 'ink', { label: 'ink' })
  .on('change', ({ value }) => pipeline.sketchyUniforms.uInkColor.value.set(value))
sketchyFolder
  .addBinding(params, 'sketchyPaper', { label: 'paper' })
  .on('change', ({ value }) => pipeline.paperColor.set(value))
sketchyFolder
  .addBinding(params, 'grain', { label: 'paper grain', min: 0, max: 1, step: 0.01 })
  .on('change', ({ value }) => (pipeline.sketchyUniforms.uGrain.value = value))

const modelFolder = pane.addFolder({ title: 'Model', expanded: false })
modelFolder.addBinding(params, 'autoRotate', { label: 'auto rotate' })
modelFolder.addBinding(params, 'rotateSpeed', { label: 'speed', min: 0, max: 0.8, step: 0.01 })

const debugFolder = pane.addFolder({ title: 'Debug', expanded: false })
debugFolder.addBinding(params, 'debug', {
  label: 'view',
  options: {
    Final: DEBUG.FINAL,
    'Edge map': DEBUG.EDGE,
    'Shade map': DEBUG.SHADE,
    Normals: DEBUG.NORMALS,
    Depth: DEBUG.DEPTH
  }
})

onUnmounted(() => {
  disposed = true
  pane?.dispose()
  pipeline.dispose()
})
</script>
<template>
  <primitive v-if="modelReady" :object="state.scene" />
</template>
