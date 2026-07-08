<script setup>
import { TresCanvas } from '@tresjs/core'
import { OrbitControls } from '@tresjs/cientos'
import TheExperience from '@/components/demos/basics/N8aoRoom.vue'
</script>
<template>
  <TresCanvas window-size clear-color="#111">
    <TresPerspectiveCamera :position="[0, 1.5, 6]" :args="[45, 1, 0.1, 1000]" />
    <OrbitControls make-default />
    <Suspense>
      <TheExperience />
    </Suspense>
  </TresCanvas>
</template>
