<script setup>
import { TresCanvas } from "@tresjs/core";
import TheExperience from "@/components/demos/shaders/SlicedModelDemo.vue";
import { OrbitControls, Environment } from "@tresjs/cientos";
import { useWindowSize } from "@vueuse/core";
import { PCFSoftShadowMap, ACESFilmicToneMapping } from "three";

const { width, height } = useWindowSize();

const gl = {
    shadowMap: true,
    shadowMapType: PCFSoftShadowMap,
    toneMapping: ACESFilmicToneMapping,
    toneMappingExposure: 1
}
</script>
<template>
  <TresCanvas shadows window-size clear-color="#111" v-bind="gl">
    <TresPerspectiveCamera
      :args="[35, width / height, 0.1, 100]"
      :position="[-10, 10, 24]"
    />
    <Environment preset="umbrellas" background :blur="0.5" />
    <OrbitControls />
    <Suspense>
      <TheExperience />
    </Suspense>
  </TresCanvas>
</template>
