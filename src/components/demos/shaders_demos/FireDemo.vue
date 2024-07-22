<script setup>
import { useLoop, useTexture } from '@tresjs/core'
import { Vector4, Color, Matrix4, Vector3 } from 'three'
import vertex from './shaders/fire/vertex.glsl'
import fragment from './shaders/fire/fragment.glsl'

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

const { onBeforeRender } = useLoop()

onBeforeRender(() => {
  fireShader.uniforms.time.value += 0.01
})
</script>
<template>
    <TresMesh>
        <TresBoxGeometry :args="[1, 1, 1]" />
        <TresShaderMaterial v-bind="fireShader"
         />
      </TresMesh>
</template>