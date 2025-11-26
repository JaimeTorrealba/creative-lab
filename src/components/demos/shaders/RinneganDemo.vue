<script setup>
import { watch } from 'vue'
import { useWindowSize } from '@vueuse/core'
import { useLoop } from '@tresjs/core'
import { Vector2 } from 'three'
import fragment from './shaders/rinnegan/fragment.glsl'

const { width, height } = useWindowSize()

const shader = {
  vertexShader: `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;

    void main(){
      gl_Position = vec4(position, 1.0);
      vUv = uv;
      vNormal = normal;
      vPosition = position;
    }
  `,
  fragmentShader: fragment,
  uniforms: {
    uTime: { value: 0 },
    uHover: { value: new Vector2(0.5, 0.5) },
    uResolution: { value: new Vector2(width.value, height.value) }
  },
  transparent: true,
}

watch([width, height], () => {
  shader.uniforms.uResolution.value.set(width.value, height.value)
})

const { onBeforeRender } = useLoop()
onBeforeRender(({ elapsed }) => {
  shader.uniforms.uTime.value = elapsed
})

const updateUniforms = (ev) => {
   ev.object.material.uniforms.uHover.value = ev.uv
 }
</script>
<template>
    <TresMesh @pointer-move="(ev) => updateUniforms(ev)">
        <TresPlaneGeometry :args="[4, 4]" />
        <TresShaderMaterial v-bind="shader" />
      </TresMesh>
</template>