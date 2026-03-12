<script setup>
import { toValue } from "vue";
import { WebGPURenderer } from "three/webgpu";
import { TresCanvas } from '@tresjs/core'
import { useWindowSize } from '@vueuse/core';
import TheExperience from '@/components/demos/basics/GlobalIllumination.vue'

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
  </TresCanvas>
</template>