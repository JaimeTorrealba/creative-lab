<script setup>
import { TresCanvas } from '@tresjs/core'
import { OrbitControls, Stars } from '@tresjs/cientos'
import TheExperience from '@/components/demos/shaders_demos/WaterReflectorDemo.vue'
</script>
<template>
  <TresCanvas window-size clear-color="#111" ref="canvasRef">
    <TresPerspectiveCamera :position="[0, 5, 10]" :fov="45" :aspect="1" :near="0.1" :far="1000" :look-at="[0, 0, 0]" />
    <OrbitControls />
    <Stars />
    <Suspense>
      <TheExperience />
    </Suspense>
    <TresDirectionalLight :position="[0, 2, 4]" :intensity="2" />
    <TresAmbientLight />
  </TresCanvas>
</template>