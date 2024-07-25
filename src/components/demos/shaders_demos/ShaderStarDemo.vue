<script setup>
import { useLoop } from '@tresjs/core'
import Vertex from './shaders/star/vertex.glsl'
import Fragment from './shaders/star/fragment.glsl'

const shader = {
  vertexShader: Vertex,
  fragmentShader: Fragment,
  uniforms: {
    uTime: { value: 0 },
  },
}
const { onBeforeRender } = useLoop()

onBeforeRender(() => {
  shader.uniforms.uTime.value += 0.01
})
</script>
<template>
    <TresMesh :scale="2" :position="[0.5, 0.5, 0]" cast-shadow>
        <TresSphereGeometry :args="[1, 30, 30]" />
        <TresShaderMaterial v-bind="shader" />
      </TresMesh>
</template>