<script setup>
import { useLoop } from '@tresjs/core'
import { GLTFModel, useTexture } from '@tresjs/cientos'
import fragment from './shaders/CoffeeCup/fragment.glsl'
import vertex from './shaders/CoffeeCup/vertex.glsl'
import { DoubleSide, RepeatWrapping } from 'three';
import { watchOnce } from '@vueuse/core';

const { state: perlinTexture, isLoading } = useTexture('/perlin.png')

watchOnce(isLoading, (value) => {
  if (!value) {
    perlinTexture.wrapS = RepeatWrapping
    perlinTexture.wrapT = RepeatWrapping
    shader.uniforms.uPerlin.value = perlinTexture.value
  }
})


const shader = {
  uniforms: {
    uTime: { value: 0.0 },
    uPerlin: { value: null }
  },
  vertexShader: vertex,
  fragmentShader: fragment,
  side: DoubleSide,
  deepWrite: false
}

const { onBeforeRender } = useLoop()

onBeforeRender(({ elapsed }) => {
  shader.uniforms.uTime.value = elapsed
})
</script>
<template>
    <TresMesh :position-y="1.83">
        <TresPlaneGeometry :args="[1, 1, 16, 64]" :translate="[0, 0.5, 0]" :scale="[1.5, 6, 1.5]" />
        <TresShaderMaterial v-bind="shader" transparent />
      </TresMesh>
      <Suspense>
        <GLTFModel path="/models/bakedModel.glb" />
      </Suspense>
      <TresDirectionalLight :position="[0, 2, 4]" :intensity="2" />
      <TresAmbientLight />
</template>