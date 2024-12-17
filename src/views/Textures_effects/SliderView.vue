<script setup>
import { TresCanvas } from '@tresjs/core'
import TheExperience from '@/components/demos/Textures_effects/SliderDemo.vue'
</script>
<template>
  <TresCanvas window-size clear-color="#111">
    <TresPerspectiveCamera :position="[0, 0, 5]" />
    <Suspense>
      <TheExperience />
    </Suspense>
    <TresDirectionalLight :position="[0, 2, 4]" :intensity="2" />
    <TresAmbientLight />
  </TresCanvas>
</template>
