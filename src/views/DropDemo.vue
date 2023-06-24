<script setup>
import { shallowRef, watch } from 'vue'
import { OrbitControls } from '@tresjs/cientos'
import { useTexture, TresCanvas, useRenderLoop } from '@tresjs/core'
import { EquirectangularReflectionMapping, MeshPhysicalMaterial } from 'three'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader'
import CustomShaderMaterial from 'three-custom-shader-material/vanilla'
import vertex from '../components/shaders/drop/vertex.glsl'

const { map } = await useTexture({ map: '/textures/glassMorphismTexture.jpg' })
const { map: normalMap } = await useTexture({ map: '/textures/glassMorphismNormal.jpg' })
const planeRef = shallowRef(null)
const dropRef = shallowRef(null)

watch(dropRef, (value) => {
  console.log('jaime ~ value:', value)
})

const hdrEquirect = await new RGBELoader().load('/textures/empty_warehouse_01_2k.hdr', () => {
  hdrEquirect.mapping = EquirectangularReflectionMapping
})

const waterMaterial = new CustomShaderMaterial({
  baseMaterial: MeshPhysicalMaterial,
  transmission: 1,
  thickness: 0.5,
  roughness: 0,
  envMap: hdrEquirect,
  clearcoatNormalMap: normalMap,
  envMapIntensity: 1.5,
  vertexShader: vertex,
  uniforms: {
    uTime: { value: 0 },
  }
})

const { onLoop } = useRenderLoop()

onLoop(({delta}) => {
  if(dropRef.value){
    dropRef.value.material.uniforms.uTime.value += delta
  }
})

</script>
<template>
  <TresCanvas window-size clear-color="#F7F7F7" class="over-hidden" grid>
    <TresPerspectiveCamera :position="[0, 0, 3]" :fov="45" :aspect="1" :near="0.1" :far="1000" />
    <OrbitControls />
    <TresGridHelper :args="[30, 30]" :position="[0, -2.5, 0]" />
    <TresMesh :position="[-0, 0, 0]" :material="waterMaterial" ref="dropRef">
      <TresIcosahedronGeometry :args="[1, 10]" />
      <!-- <TresMeshPhysicalMaterial v-bind="options" /> -->
    </TresMesh>
    <TresMesh ref="planeRef" :position="[0, 0, -1]">
      <TresPlaneGeometry :args="[5, 5]" />
      <TresMeshBasicMaterial :map="map" />
    </TresMesh>
    <TresDirectionalLight :position="[0, 2, 4]" :intensity="2" cast-shadow />
    <TresAmbientLight />
  </TresCanvas>
</template>
