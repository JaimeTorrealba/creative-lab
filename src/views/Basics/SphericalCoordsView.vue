<script setup>
import { TresCanvas } from '@tresjs/core'
import { OrbitControls } from '@tresjs/cientos'
import TheExperience from '@/components/demos/basics/SphericalCoordsDemo.vue'

</script>
<template>
  <TresCanvas window-size clear-color="#111" ref="canvasRef">
    <TresPerspectiveCamera :position="[0, 0, 5]" :args="[45, 1, 0.1, 1000]" />
    <OrbitControls />
    <Suspense>
      <TheExperience />
    </Suspense>
  </TresCanvas>
</template>