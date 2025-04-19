<script setup>
import { useTexture, useLoop } from '@tresjs/core'
import { Ocean } from '@tresjs/cientos'
import vertex from './shaders/Caustics/vertex.glsl'
import fragment from './shaders/Caustics/fragment.glsl'
import { Color } from 'three'


const texture = await useTexture(['/textures/floor_textures/Ground_Wet_002_basecolor.jpg'])

const shader = {
  uniforms: {
    uTime: { value: 0 },
    uTexture: { value: texture },
    uColor: { value: new Color(0xffffff) },
  },
  vertexShader: vertex,
  fragmentShader: fragment,
}
const { onBeforeRender } = useLoop()

onBeforeRender(({elapsed}) => {
  shader.uniforms.uTime.value = elapsed
})
</script>
<template>
    <Ocean />
  <TresMesh :rotation="[-Math.PI / 2, 0, 0]" :position="[0, -50, 0]">
    <TresPlaneGeometry
      :args="[1000, 1000]"
    />
    <TresShaderMaterial v-bind="shader" />
  </TresMesh>
  <TresDirectionalLight :position="[0, 2, 4]" :intensity="2" />
</template>
