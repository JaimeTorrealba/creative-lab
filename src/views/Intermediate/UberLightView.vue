<script setup>
import { TresCanvas } from '@tresjs/core'
import { OrbitControls } from '@tresjs/cientos'
import TheExperience from '@/components/demos/intermediate/uber-light/index.vue'
</script>
<template>
  <TresCanvas window-size clear-color="#111">
    <TresPerspectiveCamera :position="[4, 3, 7]" :look-at="[0, 1, 0]" />
    <OrbitControls />
    <Suspense>
      <TheExperience />
    </Suspense>
  </TresCanvas>
</template>
