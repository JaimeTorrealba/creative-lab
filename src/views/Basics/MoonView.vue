<script setup>
import { TresCanvas } from "@tresjs/core";
import TheExperience from "@/components/demos/basics/MoonDemo.vue";
import { ACESFilmicToneMapping, SRGBColorSpace } from "three";

const gl = {
  clearColor: "#111",
  shadows: false,
  alpha: false,
  outputColorSpace: SRGBColorSpace,
  toneMapping: ACESFilmicToneMapping,
  toneMappingExposure: 1.0,
  antialias: true,
};


</script>
<template>
    <TresCanvas window-size v-bind="gl">
      <TresPerspectiveCamera :position="[0, 0, 5]" />
      <Suspense>
        <TheExperience />
      </Suspense>
    </TresCanvas>
</template>
