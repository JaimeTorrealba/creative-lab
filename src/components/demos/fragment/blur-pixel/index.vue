<script setup>
import { watch, onMounted, onUnmounted } from 'vue'
import { useWindowSize } from '@vueuse/core'
import { useTexture } from '@tresjs/cientos'
import gsap from 'gsap'
import { Vector2 } from 'three'
import { Pane } from 'tweakpane'
import vertex from './vertex.glsl'
import fragment from './fragment.glsl'

const { width, height } = useWindowSize()

const { state: map, isLoading } = useTexture('/images/photo_slider2.jpg')

watch(isLoading, (value) => {
  if (!value) {
    shader.uniforms.uTexture.value = map.value
    gsap.to(shader.uniforms.uMouseEnter, {
      value: 0,
      duration: 1.2,
      ease: 'power2.out',
      delay: 0.2,
    })
  }
})

const params = { strength: 0.01, radius: 25 }

const shader = {
  uniforms: {
    uResolution: { value: new Vector2(width.value, height.value) },
    uTime: { value: 0 },
    uTexture: { value: null },
    uMouseEnter: { value: 1 },
    uMouseOverPos: { value: new Vector2(0.5, 0.9) },
    uStrength: { value: params.strength },
    uRadius: { value: params.radius },
  },
  vertexShader: vertex,
  fragmentShader: fragment,
}

watch(width, () => {
  shader.uniforms.uResolution.value = new Vector2(width.value, height.value)
})

const handleMove = (e) => {
  if (width.value < 768) return
  shader.uniforms.uMouseOverPos.value = new Vector2(e.x / width.value, e.y / height.value)
}

const blurTexture = () => {
  gsap.to(shader.uniforms.uMouseEnter, {
    value: 1,
    duration: 0.5,
    ease: 'power2.out',
  })
}

const revealTexture = () => {
  gsap.to(shader.uniforms.uMouseEnter, {
    value: 0,
    duration: 0.5,
    ease: 'power2.out',
  })
}

let pane

onMounted(() => {
  pane = new Pane()
  pane.addBinding(params, 'strength', { min: 0.001, max: 0.05, step: 0.001 })
    .on('change', ({ value }) => { shader.uniforms.uStrength.value = value })
  pane.addBinding(params, 'radius', { min: 5, max: 60, step: 1 })
    .on('change', ({ value }) => { shader.uniforms.uRadius.value = value })
})

onUnmounted(() => pane?.dispose())
</script>

<template>
  <TresMesh
    @pointermove="(e) => handleMove(e)"
    @pointerenter="blurTexture"
    @pointerleave="revealTexture"
  >
    <TresPlaneGeometry :args="[width, height, 100, 100]" />
    <TresShaderMaterial v-bind="shader" />
  </TresMesh>
</template>
