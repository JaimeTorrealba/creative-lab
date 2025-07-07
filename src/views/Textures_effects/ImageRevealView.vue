<script setup>
import { TresCanvas } from '@tresjs/core'
import TheExperience from '@/components/demos/Textures_effects/ImageRevealDemo.vue'

</script>
<template>
  <TresCanvas clear-color="#111" window-size>
    <TresPerspectiveCamera :position="[0, 0, 2]" :look-at="[0, 0, 0]" />
    <Suspense>
      <TheExperience />
    </Suspense>
  </TresCanvas>
</template>
