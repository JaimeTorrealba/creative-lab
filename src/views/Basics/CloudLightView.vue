<script setup>
import { TresCanvas } from '@tresjs/core'
import { OrbitControls } from '@tresjs/cientos'
import TheExperience from '@/components/demos/basics/CloudLightDemo.vue'

// CloudLight


</script>
<template>
  <TresCanvas shadows window-size clear-color="#111" ref="canvasRef">
    <TresPerspectiveCamera :position="[-15, 10, 10]" :args="[45, 1, 0.1, 1000]" />
    <OrbitControls />
    <Suspense>
      <TheExperience />
    </Suspense>
  </TresCanvas>
</template>