<script setup>
import { TresCanvas } from "@tresjs/core";
import { OrbitControls } from "@tresjs/cientos";
import TheExperience from "@/components/demos/shaders_demos/VolumetricSmokeDemo.vue";

</script>
<template>
  <TresCanvas window-size clear-color="#0561a0">
    <TresPerspectiveCamera :position="[-90, -30, -30]" />
    <OrbitControls />
    <Suspense>
      <TheExperience />
    </Suspense>
  </TresCanvas>
</template>
