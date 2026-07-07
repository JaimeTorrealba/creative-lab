<script setup>
import { toValue } from 'vue'
import { TresCanvas } from '@tresjs/core'
import { OrbitControls } from '@tresjs/cientos'
import { WebGPURenderer } from 'three/webgpu'
import { ACESFilmicToneMapping } from 'three'
import TheExperience from '@/components/demos/intermediate/FireSprites.vue'

const createRenderer = (ctx) => {
  const renderer = new WebGPURenderer({
    canvas: toValue(ctx.canvas),
    alpha: true,
    antialias: true
  })
  renderer.toneMapping = ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.2
  return renderer
}
</script>
<template>
  <TresCanvas window-size clear-color="#111" :renderer="createRenderer">
    <TresPerspectiveCamera :position="[15, 3, 0]" />
    <OrbitControls />
    <Suspense>
      <TheExperience />
    </Suspense>
  </TresCanvas>
</template>
