<script setup>
import { toValue } from "vue";
import { TresCanvas } from "@tresjs/core";
import { OrbitControls } from "@tresjs/cientos";
import { WebGPURenderer } from "three/webgpu";
import TheExperience from "@/components/demos/basics/LeomonDemo.vue";

// Create renderer with WebGPU if available, otherwise fall back to WebGL
const createRenderer = (ctx) => {
  const renderer = new WebGPURenderer({
    canvas: toValue(ctx.canvas),
    alpha: true,
    antialias: true,
  });
  return renderer;
};
</script>
<template>
  <TresCanvas window-size clear-color="#111" :renderer="createRenderer">
    <TresPerspectiveCamera :position="[0, 5, 15]" :look-at="[0, 0, 0]" />
    <OrbitControls />
    <Suspense>
      <TheExperience />
    </Suspense>
    <TresMesh :position="[0, -1, 0]" :rotation="[-Math.PI / 2, 0, 0]">
      <TresPlaneGeometry :args="[10, 10]" />
      <TresMeshStandardMaterial color="white" />
    </TresMesh>
    <TresMesh>
      <TresSphereGeometry :args="[1, 32, 32]" />
      <TresMeshStandardMaterial color="white" />
    </TresMesh>
  </TresCanvas>
</template>
