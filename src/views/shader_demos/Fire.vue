<script setup>
import { TresCanvas, useRenderLoop, useTexture } from '@tresjs/core'
import { Vector4, Color, Matrix4, Vector3 } from 'three'
import vertex from '@/components/shaders/fire/vertex.glsl'
import fragment from '@/components/shaders/fire/fragment.glsl'

const { map: fireTex } = await useTexture({
  map: '/textures/Fire.png'
})

const fireShader = {
  defines: {
    ITERATIONS: '20',
    OCTIVES: '3'
  },
  uniforms: {
    fireTex: { type: 't', value: fireTex },
    color: { type: 'c', value: new Color(0xeeeeee) },
    time: { type: 'f', value: 0.0 },
    seed: { type: 'f', value: Math.random() * 19.19 },
    invModelMatrix: { type: 'm4', value: new Matrix4() },
    scale: { type: 'v3', value: new Vector3(1, 1, 1) },
    noiseScale: { type: 'v4', value: new Vector4(1, 2, 1, 0.3) },
    magnitude: { type: 'f', value: 1.3 },
    lacunarity: { type: 'f', value: 2.0 },
    gain: { type: 'f', value: 1.0 }
  },
  vertexShader: vertex,
  fragmentShader: fragment,
  transparent: true,
  depthWrite: false,
  depthTest: false
}

const { onLoop } = useRenderLoop()

onLoop(() => {
  fireShader.uniforms.time.value += 0.01
})
</script>
<template>
  <TresCanvas window-size clear-color="#000" ref="canvas">
    <TresPerspectiveCamera :position="[0, 0, 3]" :fov="45" :aspect="1" :near="0.1" :far="1000" />
    <TresMesh>
      <TresBoxGeometry :args="[1, 1, 1]" />
      <TresShaderMaterial v-bind="fireShader"
       />
    </TresMesh>
    <TresDirectionalLight :position="[0, 2, 4]" :intensity="2" />
    <TresAmbientLight />
  </TresCanvas>
</template>
