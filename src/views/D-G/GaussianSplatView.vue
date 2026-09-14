<script setup>
import { toValue } from 'vue'
import { TresCanvas } from '@tresjs/core'
import { KeyboardControls, Stats } from '@tresjs/cientos'
import { WebGPURenderer, NoToneMapping, LinearSRGBColorSpace } from 'three/webgpu'
import GaussianSplatDemo from '@/components/demos/d-g/GaussianSplat.vue'

// Splat colors decode to display-referred values, so the renderer must skip tone
// mapping and the linear->sRGB encode that would gamma-correct them a second time.
const createRenderer = (ctx) => {
  const renderer = new WebGPURenderer({
    canvas: toValue(ctx.canvas),
    antialias: true
  })
  renderer.toneMapping = NoToneMapping
  renderer.outputColorSpace = LinearSRGBColorSpace
  return renderer
}
</script>

<template>
  <TresCanvas
    window-size
    clear-color="#111"
    :tone-mapping="NoToneMapping"
    :output-color-space="LinearSRGBColorSpace"
    :renderer="createRenderer"
  >
    <TresPerspectiveCamera :position="[0, 1, 5]" :look-at="[0, 0, 0]" />
    <Stats />
    <KeyboardControls />
    <Suspense>
      <GaussianSplatDemo />
    </Suspense>
  </TresCanvas>
</template>
