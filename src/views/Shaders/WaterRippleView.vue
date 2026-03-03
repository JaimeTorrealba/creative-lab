<script setup>
import { TresCanvas } from "@tresjs/core";
import { OrbitControls, Stars } from "@tresjs/cientos";
import TheExperience from "@/components/demos/shaders/WaterRippleDemo.vue";
</script>
<template>
  <TresCanvas window-size clear-color="#111">
    <TresPerspectiveCamera :position="[0, 0, 15]" />
    <OrbitControls />
    <Suspense>
      <TheExperience />
    </Suspense>
    <TresDirectionalLight :position="[0, 2, 4]" :intensity="2" />
    <TresAmbientLight />
    <Stars />
  </TresCanvas>
</template>
