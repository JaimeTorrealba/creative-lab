<script setup>
import vertex from './vertex.glsl'
import fragment from './fragment.glsl'
import { useLoop } from '@tresjs/core'
import { Stars } from '@tresjs/cientos'
import { AdditiveBlending, BackSide, Vector3 } from 'three'
import { reactive, shallowRef, onUnmounted } from 'vue'
import { Pane } from 'tweakpane'

const PLANET_RADIUS = 6371000
const BASE_RAYLEIGH = new Vector3(5.5e-6, 13.0e-6, 22.4e-6)
const BASE_MIE = 21e-6

const SUN_DISTANCE = 14
const LIGHT_DISTANCE = 10

// the shell is only a proxy that generates fragments — the real atmosphere boundary is
// solved analytically in the shader, so it just has to comfortably enclose the thickest
// atmosphere the panel can dial in
const SHELL_RADIUS = 1.1

const sunDirFromAngles = (elevationDeg, azimuthDeg) => {
  const elevation = (elevationDeg * Math.PI) / 180
  const azimuth = (azimuthDeg * Math.PI) / 180
  return new Vector3(
    Math.cos(elevation) * Math.sin(azimuth),
    Math.sin(elevation),
    Math.cos(elevation) * Math.cos(azimuth)
  ).normalize()
}

const params = reactive({
  sunElevation: 0,
  sunAzimuth: 70,
  sunIntensity: 22,
  orbitSun: false,
  orbitSpeed: 0.15,
  thicknessKm: 100,
  rayleighIntensity: 1,
  rayleighScaleKm: 8,
  mieIntensity: 1,
  mieScaleKm: 1.2,
  mieG: 0.758,
  exposure: 1
})

// mutated in place rather than reassigned: the sun moves every frame while orbiting, and
// routing that through reactive state re-renders the whole subtree each time, which is
// what made the marker stutter
const sunDir = sunDirFromAngles(params.sunElevation, params.sunAzimuth)
const INITIAL_MARKER_POS = sunDir.clone().multiplyScalar(SUN_DISTANCE).toArray()
const INITIAL_LIGHT_POS = sunDir.clone().multiplyScalar(LIGHT_DISTANCE).toArray()

const sunMarkerRef = shallowRef()
const sunLightRef = shallowRef()

const uniforms = {
  uSunDir: { value: sunDir },
  uSunIntensity: { value: params.sunIntensity },
  uRayleighCoeff: { value: BASE_RAYLEIGH.clone() },
  uMieCoeff: { value: BASE_MIE },
  uMieG: { value: params.mieG },
  uPlanetRadius: { value: PLANET_RADIUS },
  uAtmosphereRadius: { value: PLANET_RADIUS + params.thicknessKm * 1000 },
  uRayleighScaleHeight: { value: params.rayleighScaleKm * 1000 },
  uMieScaleHeight: { value: params.mieScaleKm * 1000 },
  uExposure: { value: params.exposure }
}

const atmosphereShader = {
  vertexShader: vertex,
  fragmentShader: fragment,
  uniforms,
  side: BackSide,
  transparent: true,
  blending: AdditiveBlending,
  depthWrite: false,
  depthTest: false
}

const applySun = (elevationDeg, azimuthDeg) => {
  sunDir.copy(sunDirFromAngles(elevationDeg, azimuthDeg))
  sunMarkerRef.value?.position.copy(sunDir).multiplyScalar(SUN_DISTANCE)
  sunLightRef.value?.position.copy(sunDir).multiplyScalar(LIGHT_DISTANCE)
}

const updateSunDir = () => applySun(params.sunElevation, params.sunAzimuth)

const pane = new Pane()
onUnmounted(() => pane?.dispose())

const sunFolder = pane.addFolder({ title: 'Sun' })
sunFolder.addBinding(params, 'sunElevation', { min: -90, max: 90, step: 1 }).on('change', updateSunDir)
sunFolder.addBinding(params, 'sunAzimuth', { min: -180, max: 180, step: 1 }).on('change', updateSunDir)
sunFolder.addBinding(params, 'sunIntensity', { min: 0, max: 60, step: 0.5 }).on('change', (ev) => {
  uniforms.uSunIntensity.value = ev.value
})
sunFolder.addBinding(params, 'orbitSun')
sunFolder.addBinding(params, 'orbitSpeed', { min: 0.02, max: 1, step: 0.01 })

const atmosphereFolder = pane.addFolder({ title: 'Atmosphere' })
atmosphereFolder
  .addBinding(params, 'thicknessKm', { min: 20, max: 300, step: 1, label: 'thickness (km)' })
  .on('change', (ev) => {
    uniforms.uAtmosphereRadius.value = PLANET_RADIUS + ev.value * 1000
  })
atmosphereFolder
  .addBinding(params, 'rayleighIntensity', { min: 0, max: 4, step: 0.05, label: 'rayleigh' })
  .on('change', (ev) => {
    uniforms.uRayleighCoeff.value = BASE_RAYLEIGH.clone().multiplyScalar(ev.value)
  })
atmosphereFolder
  .addBinding(params, 'rayleighScaleKm', { min: 1, max: 40, step: 0.5, label: 'rayleigh h (km)' })
  .on('change', (ev) => {
    uniforms.uRayleighScaleHeight.value = ev.value * 1000
  })
atmosphereFolder
  .addBinding(params, 'mieIntensity', { min: 0, max: 8, step: 0.05, label: 'mie' })
  .on('change', (ev) => {
    uniforms.uMieCoeff.value = BASE_MIE * ev.value
  })
atmosphereFolder
  .addBinding(params, 'mieScaleKm', { min: 0.2, max: 20, step: 0.1, label: 'mie h (km)' })
  .on('change', (ev) => {
    uniforms.uMieScaleHeight.value = ev.value * 1000
  })
atmosphereFolder
  .addBinding(params, 'mieG', { min: 0, max: 0.999, step: 0.001, label: 'mie g' })
  .on('change', (ev) => {
    uniforms.uMieG.value = ev.value
  })
atmosphereFolder.addBinding(params, 'exposure', { min: 0.1, max: 4, step: 0.05 }).on('change', (ev) => {
  uniforms.uExposure.value = ev.value
})

const { onBeforeRender } = useLoop()
onBeforeRender(({ elapsed }) => {
  if (!params.orbitSun) return
  applySun(params.sunElevation, params.sunAzimuth + elapsed * params.orbitSpeed * 60)
})
</script>

<template>
  <!-- size is in pixels while size-attenuation is off, so stars hold their scale as you orbit -->
  <Stars :radius="70" :depth="20" :count="4000" :size="2" :size-attenuation="false" />

  <TresMesh>
    <TresSphereGeometry :args="[1, 64, 32]" />
    <TresMeshStandardMaterial color="#2b3a4a" :roughness="1" :metalness="0" />
  </TresMesh>

  <TresMesh :render-order="1">
    <TresSphereGeometry :args="[SHELL_RADIUS, 64, 32]" />
    <TresShaderMaterial v-bind="atmosphereShader" />
  </TresMesh>

  <TresMesh ref="sunMarkerRef" :position="INITIAL_MARKER_POS">
    <TresSphereGeometry :args="[0.35, 24, 16]" />
    <TresMeshBasicMaterial color="#fff6d0" :tone-mapped="false" />
  </TresMesh>

  <TresDirectionalLight
    ref="sunLightRef"
    :position="INITIAL_LIGHT_POS"
    :intensity="2.5"
    color="#fff3e0"
  />
  <TresAmbientLight :intensity="0.04" />
</template>
