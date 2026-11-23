<script setup>
import { MathUtils, Vector2 } from 'three'
import { useLoop, useTres } from '@tresjs/core'
import { useEventListener, useWindowSize } from '@vueuse/core'
import { h, render, watch, onUnmounted } from 'vue'
import HeroPage from './HeroPage.vue'
import { createHtmlCanvasTexture, isHtmlInCanvasAvailable } from './createHtmlCanvasTexture'
import vertex from './vertex.glsl'
import fragment from './fragment.glsl'

const FOLLOW_SPEED = 14
const HANDLE_RADIUS = 22
const TILT_DEGREES = 10
// Snaps the anti-aliased DOM pixels to pure black or white
const ONE_BIT = true

const createPageElement = () => {
  const pageElement = document.createElement('div')
  Object.assign(pageElement.style, { width: '100vw', height: '100vh' })
  render(h(HeroPage), pageElement)
  return pageElement
}

const { renderer } = useTres()
if (!isHtmlInCanvasAvailable(renderer.getContext())) {
  console.warn('InvertSplit: no texElementSubImage2D / texElementImage2D on this WebGL context')
}

const pageElement = createPageElement()
const { texture: pageTexture, disposeHtmlCanvasTexture } = createHtmlCanvasTexture(
  renderer,
  pageElement
)

const { width, height } = useWindowSize()
const pointerTarget = new Vector2(width.value / 2, height.value / 2)

const uniforms = {
  uPage: { value: pageTexture },
  uResolution: { value: new Vector2(width.value, height.value) },
  uHandle: { value: pointerTarget.clone() },
  uHandleRadius: { value: HANDLE_RADIUS },
  uOneBit: { value: ONE_BIT ? 1 : 0 },
  uTiltSlope: { value: Math.tan(MathUtils.degToRad(TILT_DEGREES)) }
}

watch([width, height], ([newWidth, newHeight]) => {
  uniforms.uResolution.value.set(newWidth, newHeight)
})

useEventListener(window, 'pointermove', ({ clientX, clientY }) => {
  pointerTarget.set(clientX, clientY)
})

const { onBeforeRender } = useLoop()
onBeforeRender(({ delta }) => {
  const followFactor = 1 - Math.exp(-delta * FOLLOW_SPEED)
  uniforms.uHandle.value.lerp(pointerTarget, followFactor)
})

onUnmounted(() => {
  disposeHtmlCanvasTexture()
  render(null, pageElement)
})
</script>

<template>
  <TresMesh :frustum-culled="false" :render-order="-1">
    <TresPlaneGeometry :args="[2, 2]" />
    <TresShaderMaterial
      :vertex-shader="vertex"
      :fragment-shader="fragment"
      :uniforms="uniforms"
      :depth-test="false"
      :depth-write="false"
    />
  </TresMesh>
</template>
