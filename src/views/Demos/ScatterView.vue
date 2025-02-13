<script setup>
import { TresCanvas } from '@tresjs/core'
import { OrbitControls } from '@tresjs/cientos';
import TheExperience from '@/components/demos/demos/ScatterDemo.vue'

</script>
<template>
  <TresCanvas window-size clear-color="#111">
    <TresPerspectiveCamera :position="[0, 15, 45]" :look-at="[0, 0, 0]" />
    <OrbitControls />
    <TresAmbientLight :intensity="2" />
    <TresDirectionalLight :intensity="2" :position="[0, 10, 0]" />
    <Suspense>
      <TheExperience />
    </Suspense>
  </TresCanvas>
</template>