<script setup>
import { TresCanvas } from "@tresjs/core";
import TheExperience from "@/components/demos/basics/CameraFollowPathDemo.vue";
import { ACESFilmicToneMapping, SRGBColorSpace } from "three";
import { EffectComposerPmndrs, VignettePmndrs, DepthOfFieldPmndrs } from '@tresjs/post-processing'

const gl = {
  antialias: true,
  alpha: false,
  shadows: true,
  clearColor: "#111",
  outputColorSpace: SRGBColorSpace,
  toneMapping: ACESFilmicToneMapping,
  toneMappingExposure: 1.0,
};
</script>
<template>
  <TresCanvas window-size v-bind="gl">
    <TresPerspectiveCamera :fov="75" :near="0.1" :far="1000" :look-at="[-23, 1.2, -15]" />
    <Suspense>
      <TheExperience />
    </Suspense>
    <EffectComposerPmndrs>
      <VignettePmndrs :darkness="0.9" :offset="0.2" />
      <DepthOfFieldPmndrs :focus-range="50" :bokehScale="5" />
    </EffectComposerPmndrs>
    <TresDirectionalLight cast-shadow :position="[-3, 10, -3]" />
    <TresAmbientLight :intensity="0.5" />
    <TresFog color="#626A71" :near="0.1" :far="75" />
  </TresCanvas>
</template>
