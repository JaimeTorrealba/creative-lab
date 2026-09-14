<script setup>
import { onUnmounted, reactive, shallowRef } from 'vue'
import { useLoop, useTres } from '@tresjs/core'
import {
  BufferAttribute,
  BufferGeometry,
  Color,
  DataTexture,
  DataUtils,
  DoubleSide,
  DynamicDrawUsage,
  FloatType,
  GLSL3,
  HalfFloatType,
  LineBasicMaterial,
  LinearFilter,
  NearestFilter,
  RGBAFormat,
  RepeatWrapping,
  ShaderMaterial,
  Sphere,
  Vector2,
  Vector3
} from 'three'
import { Pane } from 'tweakpane'
import vertexShader from './vertex.glsl'
import fragmentShader from './fragment.glsl'
import { buildCageSegments, buildControlGrid } from './torus'
import { buildReliefTable, createDisplacementField } from './displacement'
import { buildBuffers, computeLevels, createTessellator } from './tessellator'

const GRIDS = [
  [8, 4],
  [12, 6],
  [16, 8],
  [24, 12]
]
const FIELD_SIZE = 256

const params = reactive({
  threshold: 2.5,
  maxLevel: 5,
  displacementAware: true,
  crackFix: true,
  freeze: false,
  grid: 1,
  major: 2.6,
  minor: 0.9,
  scale: 0.22,
  frequency: 2,
  octaves: 5,
  normalMapping: true,
  debug: 0,
  wireframe: false,
  cage: false
})

const stats = reactive({ triangles: 0, patches: 0, level: 0, rebuilds: 0 })

const geometry = shallowRef(null)
const cageGeometry = shallowRef(null)
const controlTexture = shallowRef(null)

let seed = 7
let field = null
let control = null
let relief = null
let tess = null
let dirty = true

// Half float rather than full float because linear filtering of RGBA16F is core in WebGL2, while
// RGBA32F needs OES_texture_float_linear.
const toHalf = (src) => {
  const out = new Uint16Array(src.length)
  for (let i = 0; i < src.length; i++) out[i] = DataUtils.toHalfFloat(src[i])
  return out
}

const surfaceTexture = new DataTexture(
  new Uint16Array(FIELD_SIZE * FIELD_SIZE * 4),
  FIELD_SIZE,
  FIELD_SIZE,
  RGBAFormat,
  HalfFloatType
)
surfaceTexture.wrapS = RepeatWrapping
surfaceTexture.wrapT = RepeatWrapping
surfaceTexture.minFilter = LinearFilter
surfaceTexture.magFilter = LinearFilter

const uniforms = {
  uControl: { value: null },
  uSurface: { value: surfaceTexture },
  uGrid: { value: new Vector2() },
  uDisplacementScale: { value: params.scale },
  uMaxLevel: { value: params.maxLevel },
  uNormalMapping: { value: 1 },
  uDebugMode: { value: 0 },
  uLightDir: { value: new Vector3(0.55, 0.72, 0.42) },
  uBaseColor: { value: new Color('#b7bfcc') },
  uWireColor: { value: new Color('#6fe0cd') }
}

const material = new ShaderMaterial({
  glslVersion: GLSL3,
  uniforms,
  vertexShader,
  fragmentShader,
  side: DoubleSide
})

// Same uniform objects by reference, so every slider still drives both; only the debug mode is
// overridden, to flat lines.
const wireMaterial = new ShaderMaterial({
  glslVersion: GLSL3,
  uniforms: { ...uniforms, uDebugMode: { value: 4 } },
  vertexShader,
  fragmentShader,
  wireframe: true,
  polygonOffset: true,
  polygonOffsetFactor: -2,
  polygonOffsetUnits: -2
})

const cageMaterial = new LineBasicMaterial({ color: '#4d5a6b', transparent: true, opacity: 0.7 })

const applyField = () => {
  field = createDisplacementField({
    size: FIELD_SIZE,
    seed,
    octaves: params.octaves,
    frequency: params.frequency
  })
  surfaceTexture.image.data = toHalf(field.surface)
  surfaceTexture.needsUpdate = true
  relief = buildReliefTable(field, ...GRIDS[params.grid])
  dirty = true
}

const applyControl = () => {
  const [gx, gy] = GRIDS[params.grid]
  control = buildControlGrid(gx, gy, params.major, params.minor)

  controlTexture.value?.dispose()
  const texture = new DataTexture(control, gx, gy, RGBAFormat, FloatType)
  texture.minFilter = NearestFilter
  texture.magFilter = NearestFilter
  texture.needsUpdate = true
  controlTexture.value = texture
  uniforms.uControl.value = texture
  uniforms.uGrid.value.set(gx, gy)

  cageGeometry.value?.dispose()
  const cage = new BufferGeometry()
  cage.setAttribute('position', new BufferAttribute(buildCageSegments(control, gx, gy), 3))
  cageGeometry.value = cage
  dirty = true
}

const allocate = () => {
  const [gx, gy] = GRIDS[params.grid]
  tess = createTessellator(gx, gy, params.maxLevel)

  geometry.value?.dispose()
  const geo = new BufferGeometry()
  geo.setAttribute('aPatch', new BufferAttribute(tess.aPatch, 2).setUsage(DynamicDrawUsage))
  geo.setAttribute('aUV', new BufferAttribute(tess.aUV, 2).setUsage(DynamicDrawUsage))
  geo.setAttribute('aLevel', new BufferAttribute(tess.aLevel, 1).setUsage(DynamicDrawUsage))
  geo.setIndex(new BufferAttribute(tess.indices, 1).setUsage(DynamicDrawUsage))
  // No position attribute to derive one from, and the surface never leaves this radius.
  geo.boundingSphere = new Sphere(new Vector3(), params.major + params.minor + 1)
  geometry.value = geo

  stats.patches = tess.patches
  dirty = true
}

const rebuild = () => {
  buildBuffers(tess, params.crackFix)
  const geo = geometry.value
  const upload = (attribute, count) => {
    attribute.clearUpdateRanges()
    attribute.addUpdateRange(0, count)
    attribute.needsUpdate = true
  }
  upload(geo.getAttribute('aPatch'), tess.vertexCount * 2)
  upload(geo.getAttribute('aUV'), tess.vertexCount * 2)
  upload(geo.getAttribute('aLevel'), tess.vertexCount)
  upload(geo.index, tess.indexCount)
  geo.setDrawRange(0, tess.indexCount)

  stats.triangles = tess.triangles
  stats.level = Number(tess.avgLevel.toFixed(2))
  stats.rebuilds++
}

applyField()
applyControl()
allocate()

const { camera, sizes } = useTres()
const { onBeforeRender } = useLoop()

onBeforeRender(() => {
  const cam = camera.value
  if (!cam || !geometry.value) return

  if (!params.freeze) {
    cam.updateMatrixWorld()
    const changed = computeLevels(tess, {
      controlPoints: control,
      viewMatrix: cam.matrixWorldInverse.elements,
      // Half the viewport height over tan(fov/2): the pixel size of a unit at unit depth.
      focal: (0.5 * sizes.height.value) / Math.tan((cam.fov * Math.PI) / 360),
      near: cam.near,
      threshold: params.threshold,
      maxLevel: params.maxLevel,
      relief,
      displacementScale: params.scale,
      displacementAware: params.displacementAware
    })
    if (changed) dirty = true
  }

  if (!dirty) return
  dirty = false
  rebuild()
})

const pane = new Pane({ title: 'Adaptive Tessellation' })

const tessFolder = pane.addFolder({ title: 'Tessellation' })
tessFolder.addBinding(params, 'threshold', {
  label: 'flatness (px)',
  min: 0.5,
  max: 20,
  step: 0.5
})
tessFolder
  .addBinding(params, 'maxLevel', { label: 'max level', min: 0, max: 5, step: 1 })
  .on('change', ({ value }) => {
    uniforms.uMaxLevel.value = value
    allocate()
  })
tessFolder.addBinding(params, 'displacementAware', { label: 'displacement-aware' })
tessFolder.addBinding(params, 'crackFix', { label: 'crack fix' }).on('change', () => (dirty = true))
tessFolder.addBinding(params, 'freeze', { label: 'freeze levels' })

const meshFolder = pane.addFolder({ title: 'Control mesh' })
meshFolder
  .addBinding(params, 'grid', {
    label: 'grid',
    options: { '8 x 4': 0, '12 x 6': 1, '16 x 8': 2, '24 x 12': 3 }
  })
  .on('change', () => {
    relief = buildReliefTable(field, ...GRIDS[params.grid])
    applyControl()
    allocate()
  })
meshFolder
  .addBinding(params, 'major', { label: 'major radius', min: 1.4, max: 4, step: 0.05 })
  .on('change', applyControl)
meshFolder
  .addBinding(params, 'minor', { label: 'minor radius', min: 0.3, max: 1.5, step: 0.05 })
  .on('change', applyControl)

const dispFolder = pane.addFolder({ title: 'Displacement' })
dispFolder
  .addBinding(params, 'scale', { label: 'scale', min: 0, max: 0.5, step: 0.005 })
  .on('change', ({ value }) => (uniforms.uDisplacementScale.value = value))
dispFolder
  .addBinding(params, 'frequency', { label: 'frequency', min: 1, max: 8, step: 0.5 })
  .on('change', applyField)
dispFolder
  .addBinding(params, 'octaves', { label: 'octaves', min: 1, max: 7, step: 1 })
  .on('change', applyField)
dispFolder
  .addBinding(params, 'normalMapping', { label: 'normal mapping' })
  .on('change', ({ value }) => (uniforms.uNormalMapping.value = value ? 1 : 0))
dispFolder.addButton({ title: 'New displacement' }).on('click', () => {
  seed++
  applyField()
})

const debugFolder = pane.addFolder({ title: 'Debug' })
debugFolder
  .addBinding(params, 'debug', {
    label: 'view',
    options: { Shaded: 0, 'Tessellation level': 1, Normals: 2, Displacement: 3 }
  })
  .on('change', ({ value }) => (uniforms.uDebugMode.value = value))
debugFolder.addBinding(params, 'wireframe', { label: 'wireframe' })
debugFolder.addBinding(params, 'cage', { label: 'control cage' })

const statsFolder = pane.addFolder({ title: 'Stats' })
statsFolder.addBinding(stats, 'triangles', { readonly: true, format: (v) => v.toFixed(0) })
statsFolder.addBinding(stats, 'patches', { readonly: true, format: (v) => v.toFixed(0) })
statsFolder.addBinding(stats, 'level', { readonly: true, label: 'avg level' })
statsFolder.addBinding(stats, 'rebuilds', { readonly: true, format: (v) => v.toFixed(0) })

onUnmounted(() => {
  pane?.dispose()
  geometry.value?.dispose()
  cageGeometry.value?.dispose()
  controlTexture.value?.dispose()
  surfaceTexture.dispose()
  material.dispose()
  wireMaterial.dispose()
  cageMaterial.dispose()
})
</script>

<template>
  <TresMesh :geometry="geometry" :material="material" />
  <TresMesh v-if="params.wireframe" :geometry="geometry" :material="wireMaterial" />
  <TresLineSegments v-if="params.cage" :geometry="cageGeometry" :material="cageMaterial" />
</template>
