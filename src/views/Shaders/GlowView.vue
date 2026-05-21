<script setup>
import { TresCanvas } from "@tresjs/core";
import { OrbitControls } from "@tresjs/cientos";
import TheExperience from "@/components/demos/shaders/glow/index.vue";
</script>
<template>
  <Suspense>
    <TresCanvas window-size clear-color="#333">
      <TresPerspectiveCamera :position="[0, 0, 15]" />
      <OrbitControls />
      <Suspense>
        <TheExperience />
      </Suspense>
    </TresCanvas>
  </Suspense>
</template>
