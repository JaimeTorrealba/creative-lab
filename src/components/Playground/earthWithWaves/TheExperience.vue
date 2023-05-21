<script setup>
import { shallowRef } from 'vue'
import {
  Sphere,
  Stars,
  useGLTF,
  OrbitControls
} from '@tresjs/cientos'
import { useTexture, TresCanvas, useRenderLoop } from '@tresjs/core'
import { Vector3, Vector2, MathUtils } from 'three'
import earthFrag from './shaders/earthFrag.glsl'
import earthVex from './shaders/earthVex.glsl'

const planeRef = shallowRef(null)
const cloudRef = shallowRef(null)
const markersRef = shallowRef(null)
const markerRef = shallowRef(null)
const canvas = shallowRef(null)

const {
  map: earthMap,
  alphaMap: cloudsAlphaMap
} = await useTexture({
  map: '/textures/8k_earth_daymap.jpg',
  alphaMap: '/textures/8k_earth_clouds.jpg'
})

const { scene: model } = await useGLTF('/models/Map_Marker.glb')

const villarrica = {
  lat: -39.28,
  lng: -71.98
}

const latLngToVec3 = (radius, { lat, lng }) => {
  return new Vector3().setFromSphericalCoords(
    radius,
    MathUtils.degToRad(90 - lat),
    MathUtils.degToRad(90 + lng)
  )
}

const earthShader = {
  vertexShader: earthVex,
  fragmentShader: earthFrag,
  uniforms: {
    uTexture: { value: earthMap },
    uTime: { value: 0 },
    uOrigin: { value: latLngToVec3(1.1, villarrica) }
  },
}


const { onLoop } = useRenderLoop()
onLoop(({ elapsed }) => {
  earthShader.uniforms.uTime.value += 0.01
  if (cloudRef.value) {
    cloudRef.value.value.rotation.y = elapsed * 0.01
  }
  if (markerRef.value) {
    markerRef.value.rotation.y = elapsed
  }
})
</script>
<template>
  <TresCanvas window-size clear-color="#000" class="over-hidden mouse-chg" ref="canvas">
    <TresPerspectiveCamera :position="[0, -1, 2.5]" />
    <!-- <PamCameraMouse :factor="0.05" /> -->
    <OrbitControls />
    <Sphere  ref="planeRef" :args="[1, 60, 60]">
      <TresShaderMaterial v-bind="earthShader" />
      <!-- <TresMeshStandardMaterial :map="earthMap" /> -->
    </Sphere >
    <Sphere ref="cloudRef" :args="[1.01, 30, 30]">
      <TresMeshStandardMaterial :transparent="true" :alphaMap="cloudsAlphaMap" color="#fff" />
    </Sphere>
    <!-- MARKERS -->
    <TresGroup ref="markersRef" name="markers">
      <primitive
        ref="markerRef"
        :object="model"
        :rotation="[2.3, 0, 0]"
        :position="latLngToVec3(1.05, villarrica)"
        :scale="0.05"
      />
    </TresGroup>

    <Stars :alpha-map="alphaMap" />
    <TresDirectionalLight :position="[0, 2, 4]" :intensity="1" />
    <TresAmbientLight />
  </TresCanvas>
</template>
<style scoped>
.mouse-chg {
  cursor: grab;
}
</style>
