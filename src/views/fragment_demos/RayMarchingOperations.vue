<script setup>
import { watchEffect } from 'vue'
import { TresCanvas, useRenderLoop } from '@tresjs/core'
import { useWindowSize } from '@vueuse/core'
import { Vector2 } from 'three'
import fragment from '@/components/shaders/ray_marching_operations/fragment.glsl'

const { width, height } = useWindowSize()

const shader = {
  vertexShader: `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;
  uniform float time;
  uniform vec2 uResolution;

    void main(){
      //gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
      gl_Position = modelViewMatrix * vec4(position, 1.0);
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
  shader.uniforms.uResolution.value = new Vector2(width.value, height.value)
})

const updateUniforms = (ev) => {
  const newUv = new Vector2( ev.uv.x * 16 - 8, ev.uv.y * 16 - 10)

   ev.object.material.uniforms.uHover.value = newUv
 }

const { onLoop } = useRenderLoop()

onLoop(({ elapsed }) => {
  shader.uniforms.uTime.value = elapsed
})

</script>
<template>
    <TresCanvas window-size clear-color="#111">
      <TresPerspectiveCamera :position="[0, 1, 1]" />
      <TresMesh @pointer-move="(ev) => updateUniforms(ev)">
        <TresPlaneGeometry :args="[4, 4]" />
        <TresShaderMaterial v-bind="shader" />
      </TresMesh>

      <TresGridHelper :args="[30, 30]" :position="[0, -2.5, 0]" />
      <TresDirectionalLight :position="[0, 2, 4]" :intensity="2" />
      <TresAmbientLight />
    </TresCanvas>
</template>
