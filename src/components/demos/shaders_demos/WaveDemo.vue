<script setup>
import gsap from 'gsap'
import { Vector2 } from 'three'
import fragment from './shaders/wave/fragment.glsl'
import vertex from './shaders/wave/vertex.glsl'

const shader = {
  vertexShader: vertex,
  fragmentShader: fragment,
  uniforms: {
    uProgress: { value: 0 },
    uOrigin: { value: new Vector2(0.5, 0.5) }
  }
}

const showWave = (ev) => {
  shader.uniforms.uOrigin.value = ev.uv
  gsap.to(shader.uniforms.uProgress, {
    value: 1,
    duration: 0.6,
    ease: 'power4.in',
    onComplete: () => {
      gsap.set(shader.uniforms.uProgress, {
        value: 0
      })
    }
  })
}
</script>
<template>
      <TresMesh @click="(ev) => showWave(ev)">
        <TresPlaneGeometry :args="[4, 4]" />
        <TresShaderMaterial v-bind="shader" />
      </TresMesh>
</template>