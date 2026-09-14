<script setup>
import { onUnmounted, reactive, shallowRef, watch } from 'vue'
import { useLoop, useTres } from '@tresjs/core'
import { useGLTF } from '@tresjs/cientos'
import { Mesh, PlaneGeometry, Points } from 'three'
import { Pane } from 'tweakpane'
import { createPipeline, DEBUG } from './pipeline'
import { buildElements, createSurfelGeometry, flattenModel } from './surfels'

const MODELS = {
  Necronomicon: '/models/necronomicon_custom_vertex_colors.glb',
  Gears: '/models/gears.glb'
}

const MODEL_OPTIONS = { Necronomicon: 'Necronomicon', Gears: 'Gears' }
const OBJECT = { MODEL: 0, GROUND: 1 }
const GROUND_SIZE = 15

const loaders = {
  Necronomicon: useGLTF(MODELS.Necronomicon),
  Gears: useGLTF(MODELS.Gears, { draco: true })
}

const params = reactive({
  model: 'Necronomicon',
  blend: 0.65,
  hierarchy: true,
  clusterSize: 32,
  groundSegments: 32,
  indirect: true,
  aoStrength: 1,
  ambient: 1,
  indirectStrength: 2,
  lightAzimuth: 40,
  lightElevation: 52,
  paused: false,
  debug: DEBUG.FINAL,
  diskScale: 1
})

const stats = { fps: 0, elements: 0, clusters: 0 }

const pipeline = createPipeline()
const { renderer, camera, sizes } = useTres()
const ready = shallowRef(false)

const model = new Mesh()
const ground = new Mesh()
const surfels = new Points()

model.material = pipeline.createShadeMaterial(OBJECT.MODEL, '#cfc7b4')
ground.material = pipeline.createShadeMaterial(OBJECT.GROUND, '#a8552f')

surfels.material = pipeline.surfelMaterial
surfels.frustumCulled = false

const objects = [model, ground]
let elements = null

const applyLight = () => {
  const azimuth = (params.lightAzimuth * Math.PI) / 180
  const elevation = (params.lightElevation * Math.PI) / 180
  pipeline.lightDirection
    .set(
      Math.cos(elevation) * Math.cos(azimuth),
      Math.sin(elevation),
      Math.cos(elevation) * Math.sin(azimuth)
    )
    .normalize()
}

const rebuild = () => {
  const source = loaders[params.model].state.value
  if (!source) return

  const welded = flattenModel(source.scene)
  if (!welded) return

  // Scale and lift are baked into the geometry rather than left on the mesh, because the transform
  // pass carries element areas through untouched: a scaled matrix would leave every disk claiming
  // the area it had before.
  welded.computeBoundingSphere()
  const fit = 2.6 / welded.boundingSphere.radius
  welded.scale(fit, fit, fit)
  welded.computeBoundingBox()
  welded.translate(0, 0.12 - welded.boundingBox.min.y, 0)

  model.geometry?.dispose()
  model.geometry = welded

  ground.geometry?.dispose()
  ground.geometry = new PlaneGeometry(
    GROUND_SIZE,
    GROUND_SIZE,
    params.groundSegments,
    params.groundSegments
  ).rotateX(-Math.PI / 2)

  elements?.dispose()
  elements = buildElements(
    [{ geometry: model.geometry }, { geometry: ground.geometry }],
    params.clusterSize
  )

  pipeline.setClusterSize(params.clusterSize)
  pipeline.setElements(renderer, elements)

  surfels.geometry?.dispose()
  surfels.geometry = createSurfelGeometry(elements.side, elements.padded)

  stats.elements = elements.count
  stats.clusters = elements.clusterCount
  ready.value = true
}

watch(
  () => [params.model, loaders[params.model].state.value],
  () => rebuild(),
  { immediate: true }
)

const syncUniforms = () => {
  const shade = pipeline.shadeUniforms
  shade.uAmbient.value = params.ambient
  shade.uAOStrength.value = params.aoStrength
  shade.uIndirectStrength.value = params.indirect ? params.indirectStrength : 0
  shade.uDebug.value = Math.min(params.debug, DEBUG.INDIRECT)

  pipeline.surfelUniforms.uDiskScale.value = params.diskScale

  const showSurfels = params.debug === DEBUG.SURFELS
  surfels.visible = showSurfels
  objects.forEach((object) => (object.visible = !showSurfels))
}

const { onBeforeRender } = useLoop()

onBeforeRender(({ elapsed, delta }) => {
  if (delta > 0) stats.fps = 1 / delta
  if (!ready.value) return

  // The model hovers rather than spins. Something has to move for the solve to be worth running
  // every frame, and a rising and falling contact shadow shows that better than a rotation, which a
  // rotationally symmetric occlusion field would barely register at all.
  if (!params.paused) model.position.y = 0.35 + Math.sin(elapsed * 0.7) * 0.3

  objects.forEach((object, id) => {
    object.updateMatrixWorld(true)
    pipeline.matrices[id].copy(object.matrixWorld)
  })

  if (camera.value?.isPerspectiveCamera) {
    // gl_PointSize is in pixels, so a world-space disk radius needs the projection scale of the
    // current frame to come out the right size on screen.
    const fov = (camera.value.fov * Math.PI) / 180
    const dpr = Math.min(sizes.pixelRatio.value, 2)
    pipeline.surfelUniforms.uProjectionScale.value =
      (sizes.height.value * dpr) / (2 * Math.tan(fov / 2))
  }

  syncUniforms()
  pipeline.solve(renderer, params)
})

const pane = new Pane({ title: 'Dynamic AO' })

const solveFolder = pane.addFolder({ title: 'Solve' })
solveFolder.addBinding(params, 'model', { label: 'model', options: MODEL_OPTIONS })
solveFolder.addBinding(params, 'blend', { label: 'pass blend', min: 0, max: 1, step: 0.01 })
solveFolder.addBinding(params, 'hierarchy', { label: 'hierarchy' })
solveFolder
  .addBinding(params, 'clusterSize', { label: 'cluster size', options: { 16: 16, 32: 32, 64: 64 } })
  .on('change', rebuild)
solveFolder
  .addBinding(params, 'groundSegments', {
    label: 'ground detail',
    options: { 16: 16, 24: 24, 32: 32, 48: 48 }
  })
  .on('change', rebuild)

const lightFolder = pane.addFolder({ title: 'Lighting' })
lightFolder
  .addBinding(params, 'lightAzimuth', { label: 'azimuth', min: 0, max: 360, step: 1 })
  .on('change', applyLight)
lightFolder
  .addBinding(params, 'lightElevation', { label: 'elevation', min: 5, max: 88, step: 1 })
  .on('change', applyLight)
lightFolder.addBinding(params, 'aoStrength', { label: 'AO strength', min: 0, max: 1, step: 0.01 })
lightFolder.addBinding(params, 'ambient', { label: 'ambient', min: 0, max: 2, step: 0.01 })
lightFolder.addBinding(params, 'indirect', { label: 'indirect light' })
lightFolder.addBinding(params, 'indirectStrength', { label: 'bleed', min: 0, max: 6, step: 0.05 })

const sceneFolder = pane.addFolder({ title: 'Scene', expanded: false })
sceneFolder.addBinding(params, 'paused', { label: 'freeze' })
sceneFolder
  .addBinding({ model: '#cfc7b4' }, 'model', { label: 'model colour' })
  .on('change', ({ value }) => pipeline.albedos[OBJECT.MODEL].set(value))
sceneFolder
  .addBinding({ ground: '#a8552f' }, 'ground', { label: 'ground colour' })
  .on('change', ({ value }) => pipeline.albedos[OBJECT.GROUND].set(value))

const debugFolder = pane.addFolder({ title: 'Debug' })
debugFolder.addBinding(params, 'debug', {
  label: 'view',
  options: {
    Final: DEBUG.FINAL,
    'Accessibility only': DEBUG.ACCESS,
    'Bent normal': DEBUG.BENT,
    'Indirect only': DEBUG.INDIRECT,
    'Surface elements': DEBUG.SURFELS
  }
})
debugFolder.addBinding(params, 'diskScale', { label: 'disk size', min: 0.2, max: 4, step: 0.05 })
debugFolder.addBinding(stats, 'fps', {
  label: 'fps',
  readonly: true,
  view: 'graph',
  interval: 120,
  min: 0,
  max: 144
})
debugFolder.addBinding(stats, 'elements', {
  label: 'elements',
  readonly: true,
  format: (value) => value.toFixed(0)
})
debugFolder.addBinding(stats, 'clusters', {
  label: 'clusters',
  readonly: true,
  format: (value) => value.toFixed(0)
})

applyLight()

onUnmounted(() => {
  pane?.dispose()
  pipeline.dispose()
  elements?.dispose()
  objects.forEach((object) => object.geometry?.dispose())
  surfels.geometry?.dispose()
})
</script>

<template>
  <template v-if="ready">
    <primitive :object="model" />
    <primitive :object="ground" />
    <primitive :object="surfels" />
  </template>
</template>
