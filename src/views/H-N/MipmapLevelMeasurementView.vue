<script setup>
import { toValue } from 'vue'
import { TresCanvas } from '@tresjs/core'
import { OrbitControls } from '@tresjs/cientos'
import { WebGPURenderer } from 'three/webgpu'
import MipmapLevelMeasurement from '@/components/demos/h-n/mipmap-level-measurement/index.vue'

// Pixel counting relies on fragment-shader atomics, so the WebGL 2 fallback can't measure
const createRenderer = (ctx) =>
  new WebGPURenderer({
    canvas: toValue(ctx.canvas),
    antialias: true
  })
</script>

<template>
  <TresCanvas window-size clear-color="#1b2129" :renderer="createRenderer">
    <TresPerspectiveCamera :position="[34, 26, 34]" :args="[45, undefined, 0.5, 300]" />
    <OrbitControls enable-damping :min-distance="2" :max-distance="120" />
    <Suspense>
      <MipmapLevelMeasurement />
    </Suspense>
  </TresCanvas>
</template>
