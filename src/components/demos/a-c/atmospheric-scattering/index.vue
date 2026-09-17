<script setup>
import vertex from './vertex.glsl'
import fragment from './fragment.glsl'
import { useLoop } from '@tresjs/core'
import { Stars } from '@tresjs/cientos'
import { AdditiveBlending, BackSide, Color, Vector3 } from 'three'
import { reactive, shallowRef, onUnmounted } from 'vue'
import { Pane } from 'tweakpane'

const PLANET_RADIUS = 6371000
const BASE_RAYLEIGH = new Vector3(5.5e-6, 13.0e-6, 22.4e-6)
const BASE_MIE = 21e-6

const SUN_DISTANCE = 14
const LIGHT_DISTANCE = 10

// must match MAX_LIGHTS in the fragment shader
const MAX_LIGHTS = 3

// the planet's shadow edge is hard in scene units; a band either side of it keeps a moon from
// snapping to black as it crosses in
const PENUMBRA = 0.15

// the shell is only a proxy that generates fragments — the real atmosphere boundary is
// solved analytically in the shader, so it just has to comfortably enclose the thickest
// atmosphere the panel can dial in
const SHELL_RADIUS = 1.1

const toRad = (deg) => (deg * Math.PI) / 180

const smoothstep = (edge0, edge1, x) => {
  const t = Math.min(Math.max((x - edge0) / (edge1 - edge0), 0), 1)
  return t * t * (3 - 2 * t)
}

const sunDirFromAngles = (elevationDeg, azimuthDeg) => {
  const elevation = toRad(elevationDeg)
  const azimuth = toRad(azimuthDeg)
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

// Real moonlight is about a four-hundred-thousandth of sunlight, which next to the sun is
// nothing at all. intensity is an artistic gain in the same units as the sun's, not an albedo.
const moons = reactive([
  {
    enabled: true,
    orbitRadius: 3.2,
    inclination: 15,
    node: 0,
    speed: 0.25,
    phaseOffset: 0,
    size: 0.18,
    color: '#cfc9b8',
    intensity: 2.5,
    illumination: 0
  },
  {
    enabled: false,
    orbitRadius: 5.0,
    inclination: -35,
    node: 60,
    speed: 0.15,
    phaseOffset: 120,
    size: 0.12,
    color: '#b8c9d8',
    intensity: 1.8,
    illumination: 0
  }
])

// mutated in place rather than reassigned: the sun moves every frame while orbiting, and
// routing that through reactive state re-renders the whole subtree each time, which is
// what made the marker stutter
const sunDir = sunDirFromAngles(params.sunElevation, params.sunAzimuth)
const INITIAL_MARKER_POS = sunDir.clone().multiplyScalar(SUN_DISTANCE).toArray()
const INITIAL_LIGHT_POS = sunDir.clone().multiplyScalar(LIGHT_DISTANCE).toArray()

const sunMarkerRef = shallowRef()
const sunLightRef = shallowRef()
const moonRefs = []

// index 0 is the sun, held by reference so applySun keeps writing straight into the uniform
const lightDirs = [sunDir, new Vector3(), new Vector3()]
const lightColors = [
  new Vector3(1, 1, 1).multiplyScalar(params.sunIntensity),
  new Vector3(),
  new Vector3()
]
const moonColors = moons.map((moon) => new Color(moon.color))

const uniforms = {
  uLightDir: { value: lightDirs },
  uLightColor: { value: lightColors },
  uLightCount: { value: 1 },
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

const orbitU = new Vector3()
const orbitV = new Vector3()
const moonPos = new Vector3()
const shadowPoint = new Vector3()

const applyMoons = (elapsed) => {
  let count = 1

  moons.forEach((moon, i) => {
    if (!moon.enabled) {
      moon.illumination = 0
      return
    }

    // orbit-plane basis: u along the ascending node, v the same vector swung into the tilt
    const inc = toRad(moon.inclination)
    const node = toRad(moon.node)
    orbitU.set(Math.cos(node), 0, -Math.sin(node))
    orbitV.set(
      Math.sin(node) * Math.cos(inc),
      Math.sin(inc),
      Math.cos(node) * Math.cos(inc)
    )

    const theta = toRad(moon.phaseOffset) + elapsed * moon.speed
    moonPos
      .copy(orbitU)
      .multiplyScalar(Math.cos(theta))
      .addScaledVector(orbitV, Math.sin(theta))
      .multiplyScalar(moon.orbitRadius)

    moonRefs[i]?.position.copy(moonPos)

    lightDirs[count].copy(moonPos).normalize()

    // full when the moon sits opposite the sun, dark when it passes across it — the same phase
    // the standard material paints on the sphere, so the crescent and the glow always agree
    const illum = 0.5 * (1 - lightDirs[count].dot(sunDir))

    // the planet casts a cylinder of its own radius away from the sun, and scene units put that
    // radius at exactly 1
    const along = moonPos.dot(sunDir)
    let lit = 1
    if (along < 0) {
      shadowPoint.copy(sunDir).multiplyScalar(along)
      lit = smoothstep(1 - PENUMBRA, 1 + PENUMBRA, moonPos.distanceTo(shadowPoint))
    }

    moon.illumination = illum * lit
    const tint = moonColors[i]
    lightColors[count]
      .set(tint.r, tint.g, tint.b)
      .multiplyScalar(moon.intensity * moon.illumination)

    count++
  })

  uniforms.uLightCount.value = Math.min(count, MAX_LIGHTS)
}

const pane = new Pane()
onUnmounted(() => pane?.dispose())

const sunFolder = pane.addFolder({ title: 'Sun' })
sunFolder.addBinding(params, 'sunElevation', { min: -90, max: 90, step: 1 }).on('change', updateSunDir)
sunFolder.addBinding(params, 'sunAzimuth', { min: -180, max: 180, step: 1 }).on('change', updateSunDir)
sunFolder.addBinding(params, 'sunIntensity', { min: 0, max: 60, step: 0.5 }).on('change', (ev) => {
  lightColors[0].set(1, 1, 1).multiplyScalar(ev.value)
})
sunFolder.addBinding(params, 'orbitSun')
sunFolder.addBinding(params, 'orbitSpeed', { min: 0.02, max: 1, step: 0.01 })

const moonsFolder = pane.addFolder({ title: 'Moons' })
moons.forEach((moon, i) => {
  const folder = moonsFolder.addFolder({ title: `Moon ${i + 1}`, expanded: i === 0 })
  folder.addBinding(moon, 'enabled')
  folder.addBinding(moon, 'orbitRadius', { min: 1.5, max: 12, step: 0.1, label: 'orbit r' })
  folder.addBinding(moon, 'inclination', { min: -90, max: 90, step: 1 })
  folder.addBinding(moon, 'node', { min: -180, max: 180, step: 1 })
  folder.addBinding(moon, 'speed', { min: -1, max: 1, step: 0.01 })
  folder.addBinding(moon, 'phaseOffset', { min: -180, max: 180, step: 1, label: 'phase' })
  folder.addBinding(moon, 'size', { min: 0.03, max: 0.5, step: 0.01 })
  folder.addBinding(moon, 'color').on('change', (ev) => moonColors[i].set(ev.value))
  folder.addBinding(moon, 'intensity', { min: 0, max: 20, step: 0.1 })
  folder.addBinding(moon, 'illumination', {
    readonly: true,
    label: 'lit',
    format: (v) => v.toFixed(2)
  })
})

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
  if (params.orbitSun) {
    applySun(params.sunElevation, params.sunAzimuth + elapsed * params.orbitSpeed * 60)
  }
  applyMoons(elapsed)
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

  <!-- lit by the same directional light as the planet, so the crescent on the sphere is the
       phase the scattering pass is being handed -->
  <TresMesh
    v-for="(moon, i) in moons"
    :key="i"
    :ref="(el) => (moonRefs[i] = el)"
    :visible="moon.enabled"
    :scale="moon.size"
  >
    <TresSphereGeometry :args="[1, 32, 16]" />
    <TresMeshStandardMaterial :color="moon.color" :roughness="1" :metalness="0" />
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
