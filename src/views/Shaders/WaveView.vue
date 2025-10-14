<script setup>
import { TresCanvas } from '@tresjs/core'
import TheExperience from '@/components/demos/shaders/WaveDemo.vue'
</script>
<template>
  <h1 class="has-text-centered floating-text" >Click on the plane </h1>
    <TresCanvas window-size clear-color="#111">
      <TresPerspectiveCamera :position="[0, 0, 5]" />
      <Suspense>
        <TheExperience />
      </Suspense>
      <TresGridHelper :args="[30, 30]" :position="[0, -2.5, 0]" />
      <TresDirectionalLight :position="[0, 2, 4]" :intensity="2" />
      <TresAmbientLight />
    </TresCanvas>
</template>
<style scoped>
.floating-text {
  position: absolute;
  top: 1rem;
  width: 100%;
  z-index: 10;
  font-size: 2.5rem;
}
</style>
