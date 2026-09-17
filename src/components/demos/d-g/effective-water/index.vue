<script setup>
import { reactive, onMounted, onUnmounted } from 'vue'
import { Color, Vector3, Vector4 } from 'three'
import { useLoop } from '@tresjs/core'
import { Pane } from 'tweakpane'
import vertex from './vertex.glsl'
import fragment from './fragment.glsl'
import floorVertex from './floor_vertex.glsl'
import floorFragment from './floor_fragment.glsl'

const PLANE_SIZE = 30

const params = reactive({
  timeScale: 1.0,
  amplitudeScale: 1.0,
  wireframe: false,
  waves: [
    { direction: 0, steepness: 0.3, wavelength: 12 },
    { direction: 30, steepness: 0.25, wavelength: 7 },
    { direction: -20, steepness: 0.2, wavelength: 5 },
    { direction: 50, steepness: 0.15, wavelength: 3 }
  ],
  troughColor: '#0b2f4a',
  crestColor: '#4e97b0',
  skyColor: '#cfe8ff',
  // the ch.2 gather is a single ray per floor point, so it wants a highish sun: the lower it
  // goes, the more of the surface turns the escaping ray past the critical angle and the network
  // washes out into the fill
  sunElevation: 60,
  sunAzimuth: 120,
  specularPower: 120,
  fresnelPower: 3.0,
  depth: 3.5,
  tint: '#6fd0e0',
  turbidity: 0.35,
  floorColor: '#9c8867',
  fill: 0.16,
  caustics: true,
  causticColor: '#dff1ff',
  causticGain: 2.2,
  sunDisk: 220,
  softness: 0.03,
  ior: 1.333,
  debugCaustics: false
})

const toRad = (deg) => (deg * Math.PI) / 180

function waveToVec4(wave) {
  const angle = toRad(wave.direction)
  return new Vector4(Math.cos(angle), Math.sin(angle), wave.steepness, wave.wavelength)
}

// A = Q/k, so the crest-to-plane height is sum(steepness * L / 2PI)
function maxElevation() {
  const total = params.waves.reduce(
    (sum, w) => sum + (w.steepness * w.wavelength) / (2 * Math.PI),
    0
  )
  return Math.max(total * params.amplitudeScale, 0.001)
}

function sunDirection() {
  const elevation = toRad(params.sunElevation)
  const azimuth = toRad(params.sunAzimuth)
  return new Vector3(
    Math.cos(elevation) * Math.sin(azimuth),
    Math.sin(elevation),
    Math.cos(elevation) * Math.cos(azimuth)
  )
}

// the picker holds what a metre of water lets through, so invert it into the extinction that
// produces that transmittance — dialing the tint blue makes red fall off first, as it should
function absorptionFromTint(hex) {
  const tint = new Color(hex)
  return new Vector3(
    -Math.log(Math.max(tint.r, 0.002)),
    -Math.log(Math.max(tint.g, 0.002)),
    -Math.log(Math.max(tint.b, 0.002))
  )
}

// shared by reference with the floor, which re-evaluates the same wave field to trace the light
// path back out of the water — the two must never be able to drift apart
const uTime = { value: 0 }
const uWaves = { value: params.waves.map(waveToVec4) }
const uAmplitudeScale = { value: params.amplitudeScale }
const uSunDirection = { value: sunDirection() }
const uFloorY = { value: -params.depth }

// plain objects, not reactive(): uTime is written every frame, and routing that through Vue
// reactivity re-renders the subtree once per frame
const uniforms = {
  uTime,
  uWaves,
  uAmplitudeScale,
  uSunDirection,
  uFloorY,
  uMaxElevation: { value: maxElevation() },
  uTroughColor: { value: new Color(params.troughColor) },
  uCrestColor: { value: new Color(params.crestColor) },
  uSkyColor: { value: new Color(params.skyColor) },
  uSpecularPower: { value: params.specularPower },
  uFresnelPower: { value: params.fresnelPower },
  uAbsorption: { value: absorptionFromTint(params.tint) },
  uTurbidity: { value: params.turbidity }
}

const floorUniforms = {
  uTime,
  uWaves,
  uAmplitudeScale,
  uSunDirection,
  uFloorY,
  uEta: { value: params.ior },
  uFloorColor: { value: new Color(params.floorColor) },
  uCausticColor: { value: new Color(params.causticColor) },
  uCausticGain: { value: params.causticGain },
  uSunDisk: { value: params.sunDisk },
  uFill: { value: params.fill },
  uSoftness: { value: params.softness },
  uDebug: { value: 0 }
}

function updateWaves() {
  params.waves.forEach((wave, i) => uWaves.value[i].copy(waveToVec4(wave)))
  uniforms.uMaxElevation.value = maxElevation()
}

function updateSun() {
  uSunDirection.value.copy(sunDirection())
}

function updateCausticGain() {
  floorUniforms.uCausticGain.value = params.caustics ? params.causticGain : 0
}

const { onBeforeRender } = useLoop()
onBeforeRender(({ delta }) => {
  uTime.value += delta * params.timeScale
})

let pane
onMounted(() => {
  pane = new Pane({ title: 'Effective Water' })

  const globalFolder = pane.addFolder({ title: 'Global' })
  globalFolder.addBinding(params, 'timeScale', { label: 'time scale', min: 0, max: 3, step: 0.01 })
  globalFolder
    .addBinding(params, 'amplitudeScale', { label: 'amplitude', min: 0, max: 1.5, step: 0.01 })
    .on('change', (e) => {
      uAmplitudeScale.value = e.value
      uniforms.uMaxElevation.value = maxElevation()
    })
  globalFolder.addBinding(params, 'wireframe')

  params.waves.forEach((wave, i) => {
    const folder = pane.addFolder({ title: `Wave ${i + 1}`, expanded: i === 0 })
    folder
      .addBinding(wave, 'direction', { label: 'direction', min: -180, max: 180, step: 1 })
      .on('change', updateWaves)
    folder
      .addBinding(wave, 'steepness', { label: 'steepness', min: 0, max: 1, step: 0.01 })
      .on('change', updateWaves)
    folder
      .addBinding(wave, 'wavelength', { label: 'wavelength', min: 1, max: 30, step: 0.1 })
      .on('change', updateWaves)
  })

  const shading = pane.addFolder({ title: 'Shading' })
  shading
    .addBinding(params, 'troughColor', { label: 'trough' })
    .on('change', (e) => uniforms.uTroughColor.value.set(e.value))
  shading
    .addBinding(params, 'crestColor', { label: 'crest' })
    .on('change', (e) => uniforms.uCrestColor.value.set(e.value))
  shading
    .addBinding(params, 'skyColor', { label: 'sky' })
    .on('change', (e) => uniforms.uSkyColor.value.set(e.value))
  shading
    .addBinding(params, 'sunElevation', { label: 'sun elevation', min: 5, max: 90, step: 1 })
    .on('change', updateSun)
  shading
    .addBinding(params, 'sunAzimuth', { label: 'sun azimuth', min: -180, max: 180, step: 1 })
    .on('change', updateSun)
  shading
    .addBinding(params, 'specularPower', { label: 'specular', min: 8, max: 512, step: 1 })
    .on('change', (e) => (uniforms.uSpecularPower.value = e.value))
  shading
    .addBinding(params, 'fresnelPower', { label: 'fresnel', min: 0.5, max: 8, step: 0.1 })
    .on('change', (e) => (uniforms.uFresnelPower.value = e.value))

  const body = pane.addFolder({ title: 'Water body' })
  body
    .addBinding(params, 'depth', { label: 'depth', min: 0.5, max: 8, step: 0.1 })
    .on('change', (e) => (uFloorY.value = -e.value))
  body
    .addBinding(params, 'tint', { label: 'transmit / m' })
    .on('change', (e) => uniforms.uAbsorption.value.copy(absorptionFromTint(e.value)))
  body
    .addBinding(params, 'turbidity', { label: 'turbidity', min: 0.02, max: 2, step: 0.01 })
    .on('change', (e) => (uniforms.uTurbidity.value = e.value))
  body
    .addBinding(params, 'floorColor', { label: 'floor' })
    .on('change', (e) => floorUniforms.uFloorColor.value.set(e.value))
  body
    .addBinding(params, 'fill', { label: 'fill light', min: 0, max: 1, step: 0.01 })
    .on('change', (e) => (floorUniforms.uFill.value = e.value))

  const caustics = pane.addFolder({ title: 'Caustics' })
  caustics.addBinding(params, 'caustics', { label: 'enabled' }).on('change', updateCausticGain)
  caustics
    .addBinding(params, 'causticGain', { label: 'gain', min: 0, max: 6, step: 0.01 })
    .on('change', updateCausticGain)
  caustics
    .addBinding(params, 'causticColor', { label: 'tint' })
    .on('change', (e) => floorUniforms.uCausticColor.value.set(e.value))
  // tightness of the sun disk the gather is matched against: low spreads the network into a
  // broad wash, high narrows it to thin filaments
  caustics
    .addBinding(params, 'sunDisk', { label: 'sun disk', min: 20, max: 1500, step: 5 })
    .on('change', (e) => (floorUniforms.uSunDisk.value = e.value))
  caustics
    .addBinding(params, 'softness', { label: 'softness (m)', min: 0, max: 0.3, step: 0.005 })
    .on('change', (e) => (floorUniforms.uSoftness.value = e.value))
  caustics
    .addBinding(params, 'ior', { label: 'water ior', min: 1.0, max: 1.6, step: 0.001 })
    .on('change', (e) => (floorUniforms.uEta.value = e.value))
  caustics
    .addBinding(params, 'debugCaustics', { label: 'caustics only' })
    .on('change', (e) => (floorUniforms.uDebug.value = e.value ? 1 : 0))
})

onUnmounted(() => pane?.dispose())
</script>

<template>
  <TresMesh :rotation="[-Math.PI / 2, 0, 0]" :position="[0, -params.depth, 0]">
    <TresPlaneGeometry :args="[PLANE_SIZE, PLANE_SIZE]" />
    <TresShaderMaterial
      :vertex-shader="floorVertex"
      :fragment-shader="floorFragment"
      :uniforms="floorUniforms"
    />
  </TresMesh>

  <TresMesh :rotation="[-Math.PI / 2, 0, 0]">
    <TresPlaneGeometry :args="[PLANE_SIZE, PLANE_SIZE, 256, 256]" />
    <TresShaderMaterial
      :vertex-shader="vertex"
      :fragment-shader="fragment"
      :uniforms="uniforms"
      :wireframe="params.wireframe"
      :transparent="true"
    />
  </TresMesh>
</template>
