<script setup>
import { TresCanvas } from "@tresjs/core";
import TheExperience from "@/components/demos/shaders/VoronoidDemo.vue";

const gl = {
  clearColor: "#111",
};
</script>
<template>
  <TresCanvas v-bind="gl" window-size>
    <TresOrthographicCamera :position="[0,0,0]" :args="[-1, 1, 1, -1, -1, 1]" />
    <Suspense>
      <TheExperience />
    </Suspense>
  </TresCanvas>
</template>