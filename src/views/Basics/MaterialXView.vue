<script setup>
import { toValue } from "vue";
import { TresCanvas } from "@tresjs/core";
import { OrbitControls } from "@tresjs/cientos";
import { WebGPURenderer } from "three/webgpu";
import TheExperience from "@/components/demos/basics/MaterialX_Demo.vue";

// Create renderer with WebGPU if available, otherwise fall back to WebGL
const createRenderer = (ctx) => {
  const renderer = new WebGPURenderer({
    canvas: toValue(ctx.canvas),
    alpha: true,
    antialias: true,
  })
  return renderer;
};
</script>
<template>
  <TresCanvas window-size clear-color="#333" :renderer="createRenderer">
    <TresPerspectiveCamera :position="[0, 0, 5]" :look-at="[0, 0, 0]" />
    <OrbitControls />
    <Suspense>
      <TheExperience />
    </Suspense>
  </TresCanvas>
</template>
