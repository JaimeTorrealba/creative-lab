<script setup>
import { TresCanvas } from "@tresjs/core";
import TheExperience from '@/components/demos/demos/MultiCameraDemo.vue'
</script>
<template>
  <TresCanvas window-size clear-color="#333" class="over-hidden">
    <Suspense>
      <TheExperience />
    </Suspense>
    <TresSpotLight :color="0xf7f7f7" :intensity="1" :position="[0, 0, 5]" />
    <TresAmbientLight :color="0xf7f7f7" :intensity="0.3" />
    <TresDirectionalLight :color="0xf7f7f7" :intensity="0.5" />
    <TresHemisphereLight />
  </TresCanvas>
</template>
<style>
.tp-dfwv {
  z-index: 999;
}
</style>
