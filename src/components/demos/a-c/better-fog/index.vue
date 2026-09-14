<script setup>
import { onUnmounted } from 'vue'
import { useTextures } from '@tresjs/cientos'
import { watchOnce } from '@vueuse/core'
import { BackSide, Color, MathUtils, ShaderMaterial, Vector3 } from 'three'
import { Pane } from 'tweakpane'
import vertex from './vertex.glsl'
import fragment from './fragment.glsl'
import skyVertex from './sky-vertex.glsl'
import skyFragment from './sky-fragment.glsl'

const { textures, isLoading } = useTextures([
  '/textures/world-creator/height.jpg',
  '/textures/world-creator/color.jpg',
  '/textures/world-creator/normal.jpg',
  '/textures/world-creator/ao.png'
])

watchOnce(isLoading, (newVal) => {
  if (!newVal) {
    terrainMaterial.uniforms.uHeightMap.value = textures.value[0]
    terrainMaterial.uniforms.uColorMap.value = textures.value[1]
    terrainMaterial.uniforms.uNormalMap.value = textures.value[2]
    terrainMaterial.uniforms.uAoMap.value = textures.value[3]
  }
})

const fogUniforms = {
  uMode: { value: 3 },
  uFogDensity: { value: 0.07 },
  uFogColor: { value: new Color(0.5, 0.6, 0.7) },
  uSunColor: { value: new Color(1.0, 0.9, 0.7) },
  uSunPower: { value: 8 },
  uHeightFogA: { value: 0.12 },
  uHeightFogB: { value: 0.4 },
  uSunDir: { value: new Vector3() }
}

const terrainMaterial = new ShaderMaterial({
  uniforms: {
    ...fogUniforms,
    uHeightMap: { value: null },
    uColorMap: { value: null },
    uNormalMap: { value: null },
    uAoMap: { value: null },
    uHeightScale: { value: 2.0 },
    uBetaExt: { value: new Vector3(0.03, 0.045, 0.07) },
    uBetaIns: { value: new Vector3(0.03, 0.045, 0.07) }
  },
  vertexShader: vertex,
  fragmentShader: fragment
})

const skyMaterial = new ShaderMaterial({
  uniforms: fogUniforms,
  vertexShader: skyVertex,
  fragmentShader: skyFragment,
  side: BackSide
})

const params = {
  mode: 3,
  fogDensity: 0.07,
  fogColor: '#8099b3',
  sunColor: '#ffe6b3',
  sunPower: 8,
  heightFogA: 0.12,
  heightFogB: 0.4,
  betaExt: { x: 0.03, y: 0.045, z: 0.07 },
  betaIns: { x: 0.03, y: 0.045, z: 0.07 },
  sunElevation: 15,
  sunAzimuth: 225,
  heightScale: 2.0
}

const updateSunDir = () => {
  const elevation = MathUtils.degToRad(params.sunElevation)
  const azimuth = MathUtils.degToRad(params.sunAzimuth)
  fogUniforms.uSunDir.value.set(
    Math.cos(elevation) * Math.sin(azimuth),
    Math.sin(elevation),
    Math.cos(elevation) * Math.cos(azimuth)
  )
}
updateSunDir()

const pane = new Pane()
pane
  .addBinding(params, 'mode', {
    label: 'technique',
    options: {
      'Basic distance': 0,
      'Sun scattering': 1,
      'Extinction / Inscattering': 2,
      'Height based': 3
    }
  })
  .on('change', ({ value }) => (fogUniforms.uMode.value = value))
pane
  .addBinding(params, 'fogDensity', { min: 0, max: 0.3, step: 0.001 })
  .on('change', ({ value }) => (fogUniforms.uFogDensity.value = value))
pane
  .addBinding(params, 'fogColor')
  .on('change', ({ value }) => fogUniforms.uFogColor.value.set(value))
pane
  .addBinding(params, 'sunColor')
  .on('change', ({ value }) => fogUniforms.uSunColor.value.set(value))
pane
  .addBinding(params, 'sunPower', { min: 1, max: 64, step: 1 })
  .on('change', ({ value }) => (fogUniforms.uSunPower.value = value))
pane
  .addBinding(params, 'heightScale', { min: 0, max: 4, step: 0.05 })
  .on('change', ({ value }) => (terrainMaterial.uniforms.uHeightScale.value = value))

const heightFolder = pane.addFolder({ title: 'Height fog' })
heightFolder
  .addBinding(params, 'heightFogA', { label: 'density (a)', min: 0, max: 0.5, step: 0.001 })
  .on('change', ({ value }) => (fogUniforms.uHeightFogA.value = value))
heightFolder
  .addBinding(params, 'heightFogB', { label: 'falloff (b)', min: 0.01, max: 2, step: 0.01 })
  .on('change', ({ value }) => (fogUniforms.uHeightFogB.value = value))

const scatterFolder = pane.addFolder({ title: 'Extinction / Inscattering' })
scatterFolder
  .addBinding(params, 'betaExt', {
    label: 'extinction',
    x: { min: 0, max: 0.2, step: 0.001 },
    y: { min: 0, max: 0.2, step: 0.001 },
    z: { min: 0, max: 0.2, step: 0.001 }
  })
  .on('change', ({ value }) =>
    terrainMaterial.uniforms.uBetaExt.value.set(value.x, value.y, value.z)
  )
scatterFolder
  .addBinding(params, 'betaIns', {
    label: 'inscattering',
    x: { min: 0, max: 0.2, step: 0.001 },
    y: { min: 0, max: 0.2, step: 0.001 },
    z: { min: 0, max: 0.2, step: 0.001 }
  })
  .on('change', ({ value }) =>
    terrainMaterial.uniforms.uBetaIns.value.set(value.x, value.y, value.z)
  )

const sunFolder = pane.addFolder({ title: 'Sun' })
sunFolder
  .addBinding(params, 'sunElevation', { min: 0, max: 90, step: 1 })
  .on('change', updateSunDir)
sunFolder.addBinding(params, 'sunAzimuth', { min: 0, max: 360, step: 1 }).on('change', updateSunDir)

onUnmounted(() => pane?.dispose())
</script>
<template>
  <TresMesh :material="terrainMaterial" :rotation-x="Math.PI * -0.5">
    <TresPlaneGeometry :args="[20, 20, 400, 400]" />
  </TresMesh>
  <TresMesh :material="skyMaterial">
    <TresSphereGeometry :args="[60, 32, 16]" />
  </TresMesh>
</template>
