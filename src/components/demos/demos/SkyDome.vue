<script setup>
import { shallowRef } from 'vue'
import { useTexture, useLoop } from '@tresjs/core'
import { OrbitControls } from '@tresjs/cientos'
import { BackSide } from 'three'


const skyDomeRef = shallowRef(null)
const texture = await useTexture(['/images/stars.jpg'])

const shader = {
    uniforms: {
        tex: { type: 't', value: texture }
    },
    vertexShader: `
     varying vec2 vUV;

void main() {
    vec4 pos = vec4(position, 1.0);
    gl_Position = projectionMatrix * modelViewMatrix * pos;
    vUV = uv;
    }
     `,
    fragmentShader: `
    uniform sampler2D tex;
varying vec2 vUV;

void main() {
  vec4 skyDome = texture2D(tex, vUV);
  gl_FragColor = vec4(skyDome.xyz, skyDome.w);
}
`
}

const { onBeforeRender } = useLoop()

onBeforeRender(() => {
    skyDomeRef.value.rotation.y += 0.0005
})
</script>
<template>

    <OrbitControls />
    <TresMesh ref="skyDomeRef" :scale="[-1, 1, 1]" :renderDepth="1000" eulerOrder="XZY">
        <TresSphereGeometry :args="[300, 60, 40]" />
        <TresShaderMaterial v-bind="shader" :side="BackSide" />
    </TresMesh>
    <TresMesh>
        <TresBoxGeometry :args="[1, 1, 1]" />
        <TresMeshBasicMaterial :color="0x00ff00" />
    </TresMesh>
    <TresMesh :rotation-x="-Math.PI * 0.5" :position-y="-1">
        <TresPlaneGeometry :args="[100, 100]" />
        <TresMeshBasicMaterial :color="0xe4e4e4" />
    </TresMesh>
    <TresAmbientLight />
</template>