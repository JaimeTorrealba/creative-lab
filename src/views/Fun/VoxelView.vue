<script setup>
import { TresCanvas } from '@tresjs/core'
import { OrbitControls } from '@tresjs/cientos'
import TheExperience from '@/components/demos/fun/VoxelDemo.vue'


</script>
<template>
  <TresCanvas window-size clear-color="lightblue">
    <TresPerspectiveCamera :position="[5, 5, 15]" :look-at="[0,0,0]" />
    <OrbitControls />
    <Suspense>
      <TheExperience />
    </Suspense>
    <TresAmbientLight :intensity="2" />
    <TresDirectionalLight :position="[5, 5, 5]" :intensity="2" />
  </TresCanvas>
</template>