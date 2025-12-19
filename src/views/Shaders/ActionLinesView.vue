<script setup>
import { TresCanvas } from "@tresjs/core";
import TheExperience from "@/components/demos/shaders/ActionLinesDemo.vue";
</script>
<template>
  <TresCanvas antialias clear-color="teal">
    <TresOrthographicCamera :args="[-1, 1, 1, -1, -1, , 1]" :bottom="-1" :position="[0, 0, 0]" />
    <Suspense>
      <TheExperience />
    </Suspense>
    <TresDirectionalLight :position="[1, 2, 3]" :intensity="0.5" />
    <TresAmbientLight :intensity="0.5" />
  </TresCanvas>
</template>
