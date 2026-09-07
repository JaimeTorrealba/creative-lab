<script setup>
import { onUnmounted, reactive, shallowRef } from 'vue'
import { useLoop, useTres } from '@tresjs/core'
import { OrbitControls } from '@tresjs/cientos'
import {
  BackSide,
  Color,
  DoubleSide,
  GLSL3,
  ShaderMaterial,
  SphereGeometry,
  Vector2,
  Vector3,
  Vector4
} from 'three'
import { Pane } from 'tweakpane'
import vertexShader from './vertex.glsl'
import fragmentShader from './fragment.glsl'
import skyVertexShader from './skyVertex.glsl'
import skyFragmentShader from './skyFragment.glsl'
import { buildRadialGrid } from './buildRadialGrid'
import { buildWaterTextures } from './buildWaterTextures'

const FIELD_SIZE = 256
const RING_OPTIONS = { 64: 64, 96: 96, 128: 128, 192: 192 }
const SECTOR_OPTIONS = { 256: 256, 384: 384, 512: 512, 768: 768 }

// The chapter's four superposed maps: period and amplitude in metres, speed in metres per second,
// direction as a compass bearing. Only the first two reach the vertex shader.
const octaves = reactive([
  { period: 180, amplitude: 1.2, speed: 3.0, direction: 20, enabled: true },
  { period: 62, amplitude: 0.5, speed: 1.8, direction: -35, enabled: true },
  { period: 9, amplitude: 0.35, speed: 0.9, direction: 12, enabled: true },
  { period: 2.6, amplitude: 0.15, speed: 0.5, direction: -60, enabled: true }
])

const params = reactive({
  timeScale: 1,
  amplitude: 1,
  sharpen: 0.35,
  sailSpeed: 0,
  sailHeading: 0,
  rings: 128,
  sectors: 512,
  rMin: 0.1,
  rMax: 8000,
  exponent: 4,
  deepColor: '#08303f',
  shallowColor: '#2d7f96',
  fresnelPower: 4.5,
  specularPower: 220,
  specularIntensity: 1.4,
  detailStrength: 2.5,
  tilt: 1,
  fadeDispStart: 900,
  fadeDispEnd: 2600,
  fadeDetailStart: 120,
  fadeDetailEnd: 900,
  fadeHorizonStart: 2500,
  fadeHorizonEnd: 7500,
  horizonColor: '#bcd3e3',
  zenithColor: '#3f7fc4',
  sunColor: '#fff0d0',
  sunIntensity: 6,
  sunElevation: 18,
  sunAzimuth: 155,
  wireframe: false,
  debug: 0
})

const stats = reactive({ vertices: 0, triangles: 0 })

const toRad = (deg) => (deg * Math.PI) / 180

function sunDirection() {
  const elevation = toRad(params.sunElevation)
  const azimuth = toRad(params.sunAzimuth)
  return new Vector3(
    Math.cos(elevation) * Math.sin(azimuth),
    Math.sin(elevation),
    Math.cos(elevation) * Math.cos(azimuth)
  )
}

const { swell, detail } = buildWaterTextures({ size: FIELD_SIZE })

// Shared by reference with the dome's material, so one slider drives the sky, the Fresnel
// reflection and the horizon fade at once.
const skyUniforms = {
  uHorizonColor: { value: new Color(params.horizonColor) },
  uZenithColor: { value: new Color(params.zenithColor) },
  uSunColor: { value: new Color(params.sunColor) },
  uSunDir: { value: sunDirection() },
  uSunIntensity: { value: params.sunIntensity }
}

// A plain object, not reactive(): these are mutated every frame, and routing that through Vue
// reactivity re-triggers patchProp and re-renders the subtree once per frame.
const uniforms = {
  ...skyUniforms,
  uSwell: { value: swell },
  uDetail: { value: detail },
  uOctave: { value: octaves.map(() => new Vector4()) },
  uTexels: { value: FIELD_SIZE },
  uAmplitude: { value: params.amplitude },
  uMaxElevation: { value: 1 },
  uSharpen: { value: params.sharpen },
  uEyeLocal: { value: new Vector3() },
  uDeepColor: { value: new Color(params.deepColor) },
  uShallowColor: { value: new Color(params.shallowColor) },
  uWireColor: { value: new Color('#6fe0cd') },
  uDetailStrength: { value: params.detailStrength },
  uFresnelPower: { value: params.fresnelPower },
  uSpecularPower: { value: params.specularPower },
  uSpecularIntensity: { value: params.specularIntensity },
  uTilt: { value: params.tilt },
  uFadeDisp: { value: new Vector2(params.fadeDispStart, params.fadeDispEnd) },
  uFadeDetail: { value: new Vector2(params.fadeDetailStart, params.fadeDetailEnd) },
  uFadeHorizon: { value: new Vector2(params.fadeHorizonStart, params.fadeHorizonEnd) },
  uDebugMode: { value: 0 }
}

const waterMaterial = new ShaderMaterial({
  glslVersion: GLSL3,
  uniforms,
  vertexShader,
  fragmentShader,
  // the shader always shades against its own up-facing normal, so winding never has to be
  // reasoned about, and a crest rising above the eye still draws
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

const skyGeometry = new SphereGeometry(1000, 32, 16)
const skyMaterial = new ShaderMaterial({
  glslVersion: GLSL3,
  uniforms: skyUniforms,
  vertexShader: skyVertexShader,
  fragmentShader: skyFragmentShader,
  side: BackSide,
  // no depth at all, so the dome's radius cannot clip water drawn beyond it
  depthWrite: false,
  depthTest: false
})

const geometry = shallowRef(null)

const maxElevation = () => {
  const swellAmp = octaves.slice(0, 2).reduce((sum, o) => sum + (o.enabled ? o.amplitude : 0), 0)
  return Math.max(swellAmp * params.amplitude, 0.001)
}

const rebuildGrid = () => {
  geometry.value?.dispose()
  const built = buildRadialGrid({
    rings: params.rings,
    sectors: params.sectors,
    rMin: params.rMin,
    rMax: params.rMax,
    exponent: params.exponent,
    maxAmplitude: maxElevation() + params.sharpen
  })
  geometry.value = built.geometry
  stats.vertices = built.vertexCount
  stats.triangles = built.triangleCount
}

rebuildGrid()

const rigRef = shallowRef()
const skyRef = shallowRef()
const controlsRef = shallowRef()

let time = 0
// how far we have sailed, in world metres (x, then z in .y). The camera never actually moves:
// OrbitControls owns its position and its target, and translating either behind its back makes
// the view snap. Folding the distance into the sampling offsets flows the ocean past instead.
const sail = new Vector2()

const wrap = (x) => ((x % 1) + 1) % 1

const { onBeforeRender } = useLoop()
const { camera } = useTres()

onBeforeRender(({ delta }) => {
  const rig = rigRef.value
  if (!rig || !camera.value) return

  time += delta * params.timeScale
  const heading = toRad(params.sailHeading)
  sail.x += Math.sin(heading) * params.sailSpeed * delta
  sail.y += Math.cos(heading) * params.sailSpeed * delta

  // 18.2: the grid is re-centred under the eye every frame, which is what makes the ring spacing
  // a distance-based LOD. Only XZ — the water surface stays at y = 0 in world space.
  rig.position.set(camera.value.position.x, 0, camera.value.position.z)
  skyRef.value?.position.copy(camera.value.position)
  uniforms.uEyeLocal.value.subVectors(camera.value.position, rig.position)

  // The whole world-space anchoring lives in these four offsets, wrapped into [0,1) here in
  // float64. Doing it in the shader instead would mean carrying an eight-kilometre coordinate in
  // float32, whose spacing there is about a millimetre — the fine octaves would quantise away.
  octaves.forEach((o, i) => {
    const dx = Math.sin(toRad(o.direction))
    const dz = Math.cos(toRad(o.direction))
    const wx = rig.position.x + sail.x - dx * o.speed * time
    const wz = rig.position.z + sail.y - dz * o.speed * time
    uniforms.uOctave.value[i].set(
      wrap(wx / o.period),
      wrap(wz / o.period),
      1 / o.period,
      o.enabled ? o.amplitude : 0
    )
  })

  uniforms.uMaxElevation.value = maxElevation()
})

const pane = new Pane({ title: 'Vertex Texture Water' })

const bind = (folder, target, key, options, apply) =>
  folder.addBinding(target, key, options).on('change', (ev) => apply(ev.value))

const globalFolder = pane.addFolder({ title: 'Global' })
globalFolder.addBinding(params, 'timeScale', { label: 'time scale', min: 0, max: 3, step: 0.01 })
bind(globalFolder, params, 'amplitude', { label: 'amplitude', min: 0, max: 3, step: 0.01 }, (v) => {
  uniforms.uAmplitude.value = v
})
bind(
  globalFolder,
  params,
  'sharpen',
  { label: 'crest sharpen', min: 0, max: 2, step: 0.01 },
  (v) => {
    uniforms.uSharpen.value = v
  }
)

const octaveFolder = pane.addFolder({ title: 'Octaves' })
octaves.forEach((octave, i) => {
  const role = i < 2 ? 'swell (displaces)' : 'detail (normals only)'
  const folder = octaveFolder.addFolder({ title: `${i + 1}. ${role}`, expanded: i < 2 })
  folder.addBinding(octave, 'enabled')
  folder.addBinding(octave, 'period', { min: 1, max: 400, step: 0.1 })
  folder.addBinding(octave, 'amplitude', { min: 0, max: 3, step: 0.01 })
  folder.addBinding(octave, 'speed', { min: 0, max: 10, step: 0.05 })
  folder.addBinding(octave, 'direction', { min: -180, max: 180, step: 1 })
})

// r = a0 + a1 * i^exponent concentrates rings by a fixed law, but the screen-space spacing it
// produces depends on eye height: at 3 m the i^4 default packs almost everything into the first
// twenty rings (89 px at ring 20, 0.02 px at ring 120), while from a 2 km cockpit — the altitude
// Pacific Fighters was tuned for — the same law spreads evenly across five decades. Hence the
// exponent slider and the presets; the Ring spacing view shows what the combination delivers.
const gridFolder = pane.addFolder({ title: 'Grid' })
bind(gridFolder, params, 'rings', { options: RING_OPTIONS }, rebuildGrid)
bind(gridFolder, params, 'sectors', { options: SECTOR_OPTIONS }, rebuildGrid)
bind(gridFolder, params, 'exponent', { min: 1, max: 6, step: 0.1 }, rebuildGrid)
bind(gridFolder, params, 'rMin', { label: 'r min', min: 0.1, max: 20, step: 0.1 }, rebuildGrid)
bind(gridFolder, params, 'rMax', { label: 'r max', min: 1000, max: 40000, step: 100 }, rebuildGrid)

const cameraFolder = pane.addFolder({ title: 'Camera' })
cameraFolder.addBinding(params, 'sailSpeed', { label: 'sail speed', min: 0, max: 40, step: 0.1 })
cameraFolder.addBinding(params, 'sailHeading', { label: 'heading', min: -180, max: 180, step: 1 })

const applyPreset = (height, targetDistance) => {
  if (!camera.value || !controlsRef.value) return
  camera.value.position.set(0, height, 0)
  controlsRef.value.instance.target.set(0, 0, -targetDistance)
}
cameraFolder.addButton({ title: 'Eye level (3 m)' }).on('click', () => applyPreset(3, 30))
cameraFolder.addButton({ title: 'Flight sim (2 km)' }).on('click', () => applyPreset(2000, 3000))

const shading = pane.addFolder({ title: 'Shading' })
bind(shading, params, 'deepColor', { label: 'deep' }, (v) => uniforms.uDeepColor.value.set(v))
bind(shading, params, 'shallowColor', { label: 'shallow' }, (v) =>
  uniforms.uShallowColor.value.set(v)
)
bind(shading, params, 'fresnelPower', { label: 'fresnel', min: 0.5, max: 8, step: 0.1 }, (v) => {
  uniforms.uFresnelPower.value = v
})
bind(shading, params, 'specularPower', { label: 'specular', min: 8, max: 512, step: 1 }, (v) => {
  uniforms.uSpecularPower.value = v
})
bind(
  shading,
  params,
  'specularIntensity',
  { label: 'spec gain', min: 0, max: 5, step: 0.05 },
  (v) => {
    uniforms.uSpecularIntensity.value = v
  }
)
bind(shading, params, 'detailStrength', { label: 'detail', min: 0, max: 8, step: 0.05 }, (v) => {
  uniforms.uDetailStrength.value = v
})
// 18.5: drop this to 0 and the black speckle the chapter describes appears along the horizon
bind(shading, params, 'tilt', { label: 'normal tilt', min: 0, max: 1, step: 0.01 }, (v) => {
  uniforms.uTilt.value = v
})

const fades = pane.addFolder({ title: 'Fades (m)', expanded: false })
const fadePairs = [
  ['fadeDispStart', 'fadeDispEnd', 'uFadeDisp', 4000],
  ['fadeDetailStart', 'fadeDetailEnd', 'uFadeDetail', 2000],
  ['fadeHorizonStart', 'fadeHorizonEnd', 'uFadeHorizon', 12000]
]
fadePairs.forEach(([startKey, endKey, uniformKey, max]) => {
  const apply = () => uniforms[uniformKey].value.set(params[startKey], params[endKey])
  bind(fades, params, startKey, { min: 0, max, step: 10 }, apply)
  bind(fades, params, endKey, { min: 0, max, step: 10 }, apply)
})

const sky = pane.addFolder({ title: 'Sky' })
bind(sky, params, 'horizonColor', { label: 'horizon' }, (v) =>
  skyUniforms.uHorizonColor.value.set(v)
)
bind(sky, params, 'zenithColor', { label: 'zenith' }, (v) => skyUniforms.uZenithColor.value.set(v))
bind(sky, params, 'sunColor', { label: 'sun' }, (v) => skyUniforms.uSunColor.value.set(v))
bind(sky, params, 'sunIntensity', { label: 'sun gain', min: 0, max: 30, step: 0.1 }, (v) => {
  skyUniforms.uSunIntensity.value = v
})
const updateSun = () => skyUniforms.uSunDir.value.copy(sunDirection())
bind(sky, params, 'sunElevation', { label: 'elevation', min: -5, max: 90, step: 1 }, updateSun)
bind(sky, params, 'sunAzimuth', { label: 'azimuth', min: -180, max: 180, step: 1 }, updateSun)

const debug = pane.addFolder({ title: 'Debug' })
bind(
  debug,
  params,
  'debug',
  { label: 'view', options: { Shaded: 0, Normals: 1, Height: 2, 'Ring spacing': 3 } },
  (v) => (uniforms.uDebugMode.value = v)
)
debug.addBinding(params, 'wireframe')

const statsFolder = pane.addFolder({ title: 'Stats', expanded: false })
statsFolder.addBinding(stats, 'vertices', { readonly: true, format: (v) => v.toFixed(0) })
statsFolder.addBinding(stats, 'triangles', { readonly: true, format: (v) => v.toFixed(0) })

onUnmounted(() => {
  pane?.dispose()
  geometry.value?.dispose()
  skyGeometry.dispose()
  waterMaterial.dispose()
  wireMaterial.dispose()
  skyMaterial.dispose()
  swell.dispose()
  detail.dispose()
})
</script>

<template>
  <OrbitControls ref="controlsRef" :target="[0, 0, -30]" />

  <TresGroup ref="rigRef">
    <TresMesh :geometry="geometry" :material="waterMaterial" :frustum-culled="false" />
    <TresMesh
      v-if="params.wireframe"
      :geometry="geometry"
      :material="wireMaterial"
      :frustum-culled="false"
    />
  </TresGroup>

  <TresMesh
    ref="skyRef"
    :geometry="skyGeometry"
    :material="skyMaterial"
    :render-order="-1"
    :frustum-culled="false"
  />
</template>
