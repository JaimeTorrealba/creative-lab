<script setup>
import { TresCanvas } from '@tresjs/core'
import { OrbitControls } from '@tresjs/cientos'
import TheExperience from '@/components/demos/Textures_effects/ImageParticlesDemo.vue'

const gl = {
  clearColor: '#000',
  powerPreference: 'high-performance'
}
</script>
<template>
  <TresCanvas v-bind="gl" window-size>
    <TresPerspectiveCamera :position="[0, 0, 350]" :look-at="[0, 0, 0]" />
    <OrbitControls />
    <Suspense>
      <TheExperience />
    </Suspense>
  </TresCanvas>
</template>
