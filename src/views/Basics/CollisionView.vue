<script setup>
import { TresCanvas } from '@tresjs/core'
import TheExperience from '@/components/demos/basics/Collision.vue'
</script>
<template>
  <TresCanvas window-size clear-color="#111" ref="canvasRef">
    <TresPerspectiveCamera :position="[0, 0, 20]" />
    <Suspense>
      <TheExperience />
    </Suspense>
  </TresCanvas>
</template>
