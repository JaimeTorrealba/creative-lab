<script setup>
import { useLoop } from "@tresjs/core";
import { useFBO } from "@tresjs/cientos";
import { shallowRef } from "vue";

// Incomplete
const fboTarget = useFBO({ width: 512, height: 512 });
const torusRef = shallowRef(null);

const { onBeforeRender } = useLoop();

onBeforeRender(() => {
  if (torusRef.value) {
    torusRef.value.map((obj) => {
      obj.rotation.x += 0.01;
      obj.rotation.y += 0.01;
    });
  }
});
</script>
<template>
  <TresMesh ref="mirrorRef">
    <TresCircleGeometry :args="[8, 64, 1]" />

    <TresMeshBasicMaterial :color="0xffffff" :map="fboTarget?.texture ?? null" />
  </TresMesh>
  <TresMesh
    ref="torusRef"
    v-for="i in 5"
    :key="i"
    :position="[
      (Math.random() - 0.5) * 15,
      (Math.random() - 0.5) * 15,
      Math.random() * 15 + 2,
    ]"
  >
    <TresTorusGeometry :args="[1, 0.5, 16, 100]" />
    <TresMeshNormalMaterial />
  </TresMesh>
</template>
