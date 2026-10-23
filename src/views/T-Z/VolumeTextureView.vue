<script setup>
import { toValue } from 'vue'
import { TresCanvas } from '@tresjs/core'
import { OrbitControls } from '@tresjs/cientos'
import { WebGPURenderer } from 'three/webgpu'
import VolumeTexture from '@/components/demos/t-z/volume-texture/index.vue'

// WebGPURenderer falls back to WebGL 2 when WebGPU is unavailable
const createRenderer = (ctx) =>
  new WebGPURenderer({
    canvas: toValue(ctx.canvas),
    alpha: true,
    antialias: true
  })
</script>

<template>
  <TresCanvas window-size clear-color="#111" :renderer="createRenderer">
    <TresPerspectiveCamera :position="[1, 0.3, -0.9]" :args="[45, undefined, 0.01, 100]" />
    <OrbitControls :min-distance="0.3" :max-distance="6" />
    <Suspense>
      <VolumeTexture />
    </Suspense>
  </TresCanvas>
</template>
