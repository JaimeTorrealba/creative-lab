<script setup>
import { shallowRef } from 'vue'
import { useTexture, useLoop } from '@tresjs/core'
import { EquirectangularReflectionMapping, MeshPhysicalMaterial } from 'three'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader'
import CustomShaderMaterial from 'three-custom-shader-material/vanilla'
import vertex from './shaders/drop/vertex.glsl'


const { map: normalMap } = await useTexture({ map: '/textures/glassMorphismNormal.jpg' })
const hdrEquirect = await new RGBELoader().load('/textures/empty_warehouse_01_2k.hdr', () => {
  hdrEquirect.mapping = EquirectangularReflectionMapping
})

const dropRef = shallowRef()

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

const { onBeforeRender } = useLoop()

onBeforeRender(({delta}) => {
  if(dropRef.value){
    dropRef.value.material.uniforms.uTime.value += delta
  }
})
</script>
<template>
    <TresMesh :position="[-0, 0, 0]" :material="waterMaterial" ref="dropRef">
        <TresIcosahedronGeometry :args="[1, 10]" />
      </TresMesh>
</template>