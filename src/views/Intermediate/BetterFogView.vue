<script setup>
import { TresCanvas } from '@tresjs/core'
import { OrbitControls } from '@tresjs/cientos'
import TheExperience from '@/components/demos/intermediate/better-fog/index.vue'
</script>
<template>
  <TresCanvas window-size clear-color="#8099b3">
    <TresPerspectiveCamera :position="[10, 4, 12]" />
    <OrbitControls :max-distance="45" />
    <Suspense>
      <TheExperience />
    </Suspense>
  </TresCanvas>
</template>
