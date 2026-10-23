<script setup>
import { toValue } from 'vue'
import { TresCanvas } from '@tresjs/core'
import { OrbitControls } from '@tresjs/cientos'
import { WebGPURenderer } from 'three/webgpu'
import GratingDiffraction from '@/components/demos/d-g/grating-diffraction/index.vue'

// WebGPURenderer falls back to WebGL 2 when WebGPU is unavailable
const createRenderer = (ctx) =>
  new WebGPURenderer({
    canvas: toValue(ctx.canvas),
    antialias: true
  })
</script>

<template>
  <TresCanvas window-size clear-color="#040409" :renderer="createRenderer">
    <TresPerspectiveCamera :position="[0, 0.3, 3.2]" :args="[40, undefined, 0.05, 50]" />
    <OrbitControls enable-damping :min-distance="1.2" :max-distance="8" />
    <Suspense>
      <GratingDiffraction />
    </Suspense>
  </TresCanvas>
</template>
