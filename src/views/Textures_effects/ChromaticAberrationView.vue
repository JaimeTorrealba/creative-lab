<script setup>
import { TresCanvas } from '@tresjs/core'
import TheExperience from '@/components/demos/Textures_effects/ChromaticAberrationDemo.vue'

const gl = {
  clearColor: '#111',
}
</script>
<template>
  <TresCanvas v-bind="gl" window-size>
    <TresPerspectiveCamera :position="[0, 0, 5]" :look-at="[0, 0, 0]" />
    <Suspense>
      <TheExperience />
    </Suspense>
  </TresCanvas>
</template>
