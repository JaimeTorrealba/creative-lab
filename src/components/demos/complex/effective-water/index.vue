<script setup>
import { reactive, onMounted, onUnmounted } from 'vue'
import { Color, Vector3, Vector4 } from 'three'
import { useLoop } from '@tresjs/core'
import { Pane } from 'tweakpane'
import vertex from './vertex.glsl'
import fragment from './fragment.glsl'

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
  sunElevation: 35,
  sunAzimuth: 120,
  specularPower: 120,
  fresnelPower: 3.0
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

const uniforms = reactive({
  uTime: { value: 0 },
  uWaves: { value: params.waves.map(waveToVec4) },
  uAmplitudeScale: { value: params.amplitudeScale },
  uMaxElevation: { value: maxElevation() },
  uTroughColor: { value: new Color(params.troughColor) },
  uCrestColor: { value: new Color(params.crestColor) },
  uSkyColor: { value: new Color(params.skyColor) },
  uSunDirection: { value: sunDirection() },
  uSpecularPower: { value: params.specularPower },
  uFresnelPower: { value: params.fresnelPower }
})

function updateWaves() {
  params.waves.forEach((wave, i) => uniforms.uWaves.value[i].copy(waveToVec4(wave)))
  uniforms.uMaxElevation.value = maxElevation()
}

function updateSun() {
  uniforms.uSunDirection.value.copy(sunDirection())
}

const { onBeforeRender } = useLoop()
onBeforeRender(({ delta }) => {
  uniforms.uTime.value += delta * params.timeScale
})

let pane
onMounted(() => {
  pane = new Pane({ title: 'Effective Water' })

  const globalFolder = pane.addFolder({ title: 'Global' })
  globalFolder.addBinding(params, 'timeScale', { label: 'time scale', min: 0, max: 3, step: 0.01 })
  globalFolder
    .addBinding(params, 'amplitudeScale', { label: 'amplitude', min: 0, max: 1.5, step: 0.01 })
    .on('change', (e) => {
      uniforms.uAmplitudeScale.value = e.value
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
})

onUnmounted(() => pane?.dispose())
</script>

<template>
  <TresMesh :rotation="[-Math.PI / 2, 0, 0]">
    <TresPlaneGeometry :args="[30, 30, 256, 256]" />
    <TresShaderMaterial
      :vertex-shader="vertex"
      :fragment-shader="fragment"
      :uniforms="uniforms"
      :wireframe="params.wireframe"
    />
  </TresMesh>
</template>
