<script setup>
import { TresCanvas } from "@tresjs/core";
import TheExperience from "@/components/demos/shaders/DestroyGeometriesDemo.vue";
</script>
<template>
  <Suspense>
    <TresCanvas window-size clear-color="#111">
      <TresPerspectiveCamera :position="[0, 0, 15]" />
      <TresGridHelper :args="[30, 30]" :position="[0, -2.5, 0]" />
      <Suspense>
        <TheExperience />
      </Suspense>
      <TresDirectionalLight :position="[0, 2, 4]" :intensity="2" />
      <TresAmbientLight />
    </TresCanvas>
  </Suspense>
</template>
