<script setup>
import { TresCanvas } from '@tresjs/core'
import TheExperience from '@/components/demos/fragment/ray-marching-orbit/index.vue'
</script>
<template>
  <TresCanvas window-size clear-color="#111">
    <TresPerspectiveCamera :position="[0, 1, 0]" :look-at="[0, 1, 6]" />
    <Suspense>
      <TheExperience />
    </Suspense>
  </TresCanvas>
</template>
