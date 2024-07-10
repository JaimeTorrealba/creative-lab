<script setup>
import { watchEffect } from 'vue'
import { useLoop } from '@tresjs/core'
import { useWindowSize } from '@vueuse/core'
import { Vector2 } from 'three'
import fragment from './shaders/template/fragment.glsl'

const { width, height } = useWindowSize()

const shader = {
    //We don't touch the vertex shader
  vertexShader: `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;
  uniform float time;
  uniform vec2 uResolution;

    void main(){
      gl_Position =  vec4(position, 1.0);
      vUv = uv;
      vNormal = normal;
      vPosition = position;
    }
  `,
  fragmentShader: fragment,
  uniforms: {
    uTime: { value: 0 },
    uHover: { value: new Vector2(0.5, 0.5) },
    uResolution: {
      value: new Vector2(window.innerWidth, window.innerHeight)
    }
  },
  transparent: true,
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
        <TresPlaneGeometry :args="[4, 4]" />
        <TresShaderMaterial v-bind="shader" />
      </TresMesh>
</template>