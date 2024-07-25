<script setup>
import { TresCanvas } from '@tresjs/core'
import TheExperience from '@/components/demos/shaders_demos/WaveDemo.vue'
</script>
<template>
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
