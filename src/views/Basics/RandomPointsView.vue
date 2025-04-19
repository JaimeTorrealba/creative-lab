<script setup>
import { TresCanvas } from '@tresjs/core'
import { OrbitControls } from '@tresjs/cientos'
import TheExperience from '@/components/demos/basics/RandomPointsDemo.vue'

</script>
<template>
  <TresCanvas window-size clear-color="#111">
    <TresPerspectiveCamera :position="[0, 5, 0]" :look-at="[0,0,0]"/>
    <OrbitControls />
    <Suspense>
      <TheExperience />
    </Suspense>
    <TresDirectionalLight :position="[0, 2, 4]" :intensity="2" />
    <TresAmbientLight />
  </TresCanvas>
</template>