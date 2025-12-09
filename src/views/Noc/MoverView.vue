<script setup>
import { TresCanvas } from "@tresjs/core";
import { OrbitControls } from "@tresjs/cientos";
import TheExperience from "@/components/demos/noc/MoverDemo.vue";
import { computed } from "vue";
import { useWindowSize } from "@vueuse/core";

const { width, height } = useWindowSize();

// Orthographic bounds centered around origin
const left = computed(() => -width.value / 2);
const right = computed(() => width.value / 2);
const top = computed(() => height.value / 2);
const bottom = computed(() => -height.value / 2);
</script>
<template>
  <TresCanvas window-size clear-color="#333">
    <TresOrthographicCamera :args="[left, right, top, bottom, 0.1, 2000]" :position="[0, 0, 600]" />
    <OrbitControls />
    <Suspense>
      <TheExperience />
    </Suspense>
    <TresAmbientLight :intensity="0.5" />
    <TresDirectionalLight :intensity="4" :position="[0, 700, 700]" />
  </TresCanvas>
</template>
