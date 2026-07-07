<script setup>
import { watchEffect } from 'vue'
import { useLoop } from '@tresjs/core'
import { useWindowSize } from '@vueuse/core'
import { Vector2 } from 'three'
import fragment from './fragment.glsl'

const { width, height } = useWindowSize()

const shader = {
  fragmentShader: fragment,
  uniforms: {
    uTime: { value: 0 },
    uHover: { value: new Vector2(0.5, 0.5) },
    uResolution: {
      value: new Vector2(window.innerWidth, window.innerHeight)
    }
  },
  transparent: true
}

watchEffect(() => {
  // Resize Observer
  shader.uniforms.uResolution.value = new Vector2(width.value, height.value)
})

const updateUniforms = (ev) => {
  // Mouse Observer
  ev.object.material.uniforms.uHover.value = ev.uv
}

const { onBeforeRender } = useLoop()

onBeforeRender(({ elapsed }) => {
  shader.uniforms.uTime.value = elapsed
})
</script>
<template>
  <TresMesh @pointer-move="(ev) => updateUniforms(ev)">
    <TresPlaneGeometry :args="[2, 2]" />
    <TresShaderMaterial v-bind="shader" />
  </TresMesh>
</template>
