<script setup>
import { TresCanvas } from '@tresjs/core'
import { OrbitControls, Stats } from '@tresjs/cientos';
import TheExperience from '@/components/demos/fun/MinecraftDemo.vue'

</script>
<template>
  <TresCanvas window-size clear-color="#80a0e0" ref="canvasRef">
    <TresPerspectiveCamera :position="[45, 45, 45]"  :look-at="[0, 0, 0]" />
    <OrbitControls />
    <Stats />
    <Suspense>
      <TheExperience />
    </Suspense>
    <TresDirectionalLight :intensity="100" :position="[-1, 1, -0.5]" />
    <TresAmbientLight />
  </TresCanvas>
</template>