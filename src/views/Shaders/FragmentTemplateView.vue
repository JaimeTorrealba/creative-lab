<script setup>
import { TresCanvas } from "@tresjs/core";
import TheExperience from "@/components/demos/shaders/TemplateDemo.vue";
</script>
<template>
  <TresCanvas antialias clear-color="#111">
    <TresOrthographicCamera :args="[-1, 1, 1, -1, -1, , 1]" :bottom="-1" :position="[0, 0, 0]" />
    <Suspense>
      <TheExperience />
    </Suspense>
  </TresCanvas>
</template>
