<script setup>
import { toValue } from "vue";
import { TresCanvas } from "@tresjs/core";
import { OrbitControls } from "@tresjs/cientos";
import { WebGPURenderer } from "three/webgpu";
import TheExperience from "@/components/demos/intermediate/volume-smoke/index.vue";

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
  <TresCanvas window-size clear-color="#000" :renderer="createRenderer">
    <TresPerspectiveCamera :position="[-8, 1, -6]" :args="[60, undefined, 0.1, 100]" />
    <OrbitControls :max-distance="40" :min-distance="2" />
    <Suspense>
      <TheExperience />
    </Suspense>
  </TresCanvas>
</template>

