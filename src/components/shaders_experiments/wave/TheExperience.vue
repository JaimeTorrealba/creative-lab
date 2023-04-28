<script setup>
import gsap from 'gsap'
import { TresCanvas, useRenderLoop } from '@tresjs/core'
import { Vector2 } from 'three'



const shader = {
  vertexShader: `
  uniform float uTime;
  uniform float uProgress;
  varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
    }
  `,
  fragmentShader: `
  uniform float uProgress;
  uniform float uTime;
  uniform vec2 uOrigin;
  varying vec2 vUv;
    void main() {
      vec2 origin = vec2(0.5);
      float dist = distance(vUv, uOrigin);
      float wave = fract(dist - uProgress);
      wave *= 1. - smoothstep(1.,2.,dist);
      wave *= 1. - step(uProgress, dist);
      gl_FragColor = vec4(vec3(wave), 1.0);
    }`,
  uniforms: {
    uTime: { value: 0 },
    uProgress: { value: 0 },
    uOrigin: { value: new Vector2(0.5, 0.5) }
  },
  transparent:true
}

const showWave = ev => {
    shader.uniforms.uOrigin.value = ev.uv
    gsap.to(shader.uniforms.uProgress, {
    value: 1,
    duration: 0.6,
    ease: 'power4.in',
    onComplete: () => {
      gsap.set(shader.uniforms.uProgress, {
        value: 0,
      })
    }
  })
}


const { onLoop } = useRenderLoop()
onLoop(() => {
  shader.uniforms.uTime.value += 0.01
})

</script>
<template>
  <Suspense>
    <TresCanvas window-size clear-color="#111">
      <TresPerspectiveCamera
        :position="[0, 0, 5]"
        :fov="45"
        :aspect="1"
        :near="0.1"
        :far="1000"
        :look-at="[0, 0, 0]"
      />
      <TresMesh @click="(ev) => showWave(ev)">
        <TresPlaneGeometry :args="[4,4]" />
        <TresShaderMaterial v-bind="shader" />
      </TresMesh>

      <TresGridHelper :args="[30, 30]" :position="[0, -2.5, 0]" />
      <TresDirectionalLight :position="[0, 2, 4]" :intensity="2" />
      <TresAmbientLight />
    </TresCanvas>
  </Suspense>
</template>
