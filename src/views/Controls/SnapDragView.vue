
<script setup>
import { TresCanvas } from '@tresjs/core'
import TheExperience from '@/components/demos/controls/SnapDragDemo.vue'
</script>
<template>
  <TresCanvas window-size clear-color="#111" >
    <TresPerspectiveCamera :position="[0, 50, 50]" :args="[45, 1, 0.1, 1000]" :look-at="[0, 0, 0]" />
    <Suspense>
      <TheExperience />
    </Suspense>
  </TresCanvas>
</template>