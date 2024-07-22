<script setup>
import { useLoop, useTexture } from '@tresjs/core'
import { GLTFModel } from '@tresjs/cientos'
import fragment from './shaders/CoffeeCup/fragment.glsl'
import vertex from './shaders/CoffeeCup/vertex.glsl'
import { DoubleSide, RepeatWrapping } from 'three';

const { map: perlinTexture } = await useTexture({ map: '/perlin.png' })
perlinTexture.wrapS = RepeatWrapping
perlinTexture.wrapT = RepeatWrapping

const shader = {
  uniforms: {
    uTime: { value: 0.0 },
    uPerlin: { value: perlinTexture }
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