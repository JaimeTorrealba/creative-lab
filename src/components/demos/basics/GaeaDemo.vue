<script setup>
import { CameraControls, useTextures } from "@tresjs/cientos";

const { textures } = useTextures([
  "/textures/gaea/height.png",
  "/textures/gaea/texture.png"
]);
</script>
<template>
  <TresFog color="#626A71" :near="0.1" :far="100" />
  <CameraControls />
  <!-- <Precipitation :area="[2.5, 2.5, 2.5]" :count="500" :size="0.01" /> -->
  <TresMesh :rotation-x="Math.PI * -0.5">
    <TresPlaneGeometry :args="[2.5, 2.5, 100, 100]" />
    <TresMeshStandardMaterial v-if="textures[0] && textures[1]" :displacementMap="textures[0]" :map="textures[1]" />
  </TresMesh>
  <TresDirectionalLight :position="[0, 2, 4]" :intensity="0.15" />
  <TresAmbientLight :intensity="0.5" />
</template>
