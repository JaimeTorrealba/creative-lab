<script setup>
import { TresCanvas } from "@tresjs/core";
import { OrbitControls } from "@tresjs/cientos";
import TheExperience from "@/components/demos/shaders/DissolveTslDemo.vue";
import { toValue } from "vue";
import { WebGPURenderer } from "three/webgpu";

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
      <TresPerspectiveCamera :position="[0, 0, 5]" />
      <OrbitControls />
      <Suspense>
        <TheExperience />
      </Suspense>
      <TresDirectionalLight :position="[5, 5, 5]" :intensity="1" />
      <TresAmbientLight :intensity="0.2" />
    </TresCanvas>
    
</template>
