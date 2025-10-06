<script setup>
import { TresCanvas } from '@tresjs/core'
import TheExperience from '@/components/demos/Textures_effects/ParallaxMapDemo.vue'
import { OrbitControls } from '@tresjs/cientos'

const gl = {
  clearColor: '#333',
}
</script>
<template>
  <TresCanvas v-bind="gl" window-size>
    <TresPerspectiveCamera :position="[0, 3, 3]" :look-at="[0, 0, 0]" />
    <Suspense>
      <TheExperience />
    </Suspense>
    <OrbitControls />
    <TresAmbientLight :intensity="2.5" />
  </TresCanvas>
</template>
