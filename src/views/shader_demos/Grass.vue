<script setup>
import { TresCanvas, useRenderLoop } from '@tresjs/core'
import vertex from '@/components/shaders/grass/vertex.glsl'
import fragment from '@/components/shaders/grass/fragment.glsl'

const grassShader = {
  uniforms: {
    uTime: { type: 'f', value: 0.0 },
  },
  vertexShader: vertex,
  fragmentShader: fragment,
  transparent: true,
  depthWrite: false,
  depthTest: false
}

const { onLoop } = useRenderLoop()

onLoop(() => {
  grassShader.uniforms.uTime.value += 0.01
})
</script>
<template>
  <TresCanvas window-size clear-color="#333" ref="canvasRef">
    <TresPerspectiveCamera :position="[0, 0, 3]" :fov="45" :aspect="1" :near="0.1" :far="1000" />
    <TresMesh>
      <TresBoxGeometry :args="[1, 1, 1]" />
      <TresShaderMaterial v-bind="grassShader"
       />
    </TresMesh>
    <TresDirectionalLight :position="[0, 2, 4]" :intensity="2" />
    <TresAmbientLight />
  </TresCanvas>
</template>