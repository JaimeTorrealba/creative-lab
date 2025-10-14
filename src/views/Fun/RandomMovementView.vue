<script setup>
import { TresCanvas } from '@tresjs/core'
import { OrbitControls } from '@tresjs/cientos'
import TheExperience from '@/components/demos/fun/RandomMovementDemo.vue'
</script>
<template>
  <TresCanvas window-size clear-color="#333" ref="canvasRef">
    <TresPerspectiveCamera :position="[0, 8, 12]" :look-at="[0, 0, 0]"
      ref="cameraRef" />
    <OrbitControls />
    <Suspense>
      <TheExperience />
    </Suspense>
    <TresGridHelper :size="100" :divisions="100" :position="[0, -2, 0]" />
    <TresDirectionalLight :position="[0, 2, 4]" :intensity="20" />
    <TresAmbientLight />
  </TresCanvas>
</template>
