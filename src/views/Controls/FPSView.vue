
<script setup>
import { TresCanvas } from '@tresjs/core'
import TheExperience from '@/components/demos/controls/FPSDemo.vue'
</script>
<template>
  <TresCanvas window-size clear-color="#f7f7f7" >
    <TresPerspectiveCamera :position="[0, 0, 3]" :args="[45, 1, 0.1, 1000]" />
    <Suspense>
      <TheExperience />
    </Suspense>
  </TresCanvas>
</template>