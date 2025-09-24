<script setup>
import { OrbitControls } from '@tresjs/cientos'
import TheExperience from '@/components/demos/shaders_demos/CSMDemo.vue'
</script>
<template>
  <TresCanvas window-size clear-color="#333" >
    <TresPerspectiveCamera :position="[0, 0, 5]" />
    <OrbitControls />
    <TresGridHelper :args="[30, 30]" :position="[0, -2.5, 0]" />
    <Suspense>
      <TheExperience />
    </Suspense>
    <TresDirectionalLight :position="[0, 2, 4]" :intensity="1" cast-shadow />
    <TresAmbientLight />
  </TresCanvas>
</template>
