<script setup>
import { toValue } from "vue";
import { WebGPURenderer } from "three/webgpu";
import { TresCanvas } from '@tresjs/core'
import { useWindowSize } from '@vueuse/core';
import TheExperience from '@/components/demos/basics/CornelBoxDemo.vue'

const { width, height } = useWindowSize();

const createRenderer = (ctx) => {
  const renderer = new WebGPURenderer({
    canvas: toValue(ctx.canvas),
    alpha: true,
    antialias: false,
  })
  return renderer;
};
</script>
<template>
  <TresCanvas window-size clear-color="#111" :renderer="createRenderer">
    <TresPerspectiveCamera :position="[0, 7, 25]"  :args="[40, width / height, 0.1, 1000]" />

    <Suspense>
      <TheExperience />
    </Suspense>

    <!-- Light source geometry (cylinder) -->
    <TresMesh :position="[0, 15, 0]">
      <TresCylinderGeometry :args="[2.5, 2.5, 1, 64]" />
      <TresMeshBasicMaterial />
    </TresMesh>

    <!-- Point light -->
    <TresPointLight
      color="#ffffff"
      :intensity="100"
      :position="[0, 13, 0]"
      :distance="100"
      :castShadow="true"
      :shadow-bias="-0.0025"
      :shadow-mapSize-width="1024"
      :shadow-mapSize-height="1024"
    />

    <!-- Ambient light -->
    <TresAmbientLight color="#0c0c0c" />
  </TresCanvas>
</template>