<script setup>
import { TresCanvas } from '@tresjs/core'
import { OrbitControls } from '@tresjs/cientos'
import ClothSimulation from '@/components/demos/a-c/cloth-simulation/index.vue'
</script>

<template>
  <TresCanvas window-size clear-color="#111" shadows>
    <TresPerspectiveCamera :position="[0, 3, 6]" />
    <OrbitControls />
    <Suspense>
      <ClothSimulation />
    </Suspense>
  </TresCanvas>
</template>
