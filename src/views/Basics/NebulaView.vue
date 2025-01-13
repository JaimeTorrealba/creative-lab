<script setup>
import { TresCanvas } from '@tresjs/core'
import { OrbitControls } from '@tresjs/cientos'
import TheExperience from '@/components/demos/basics/NebulaDemo.vue'

</script>
<template>
  <TresCanvas window-size clear-color="#333" ref="canvasRef">
    <TresPerspectiveCamera :position="[0, 0, 2.5]" />
    <OrbitControls />
    <Suspense>
      <TheExperience />
    </Suspense>
  </TresCanvas>
</template>
