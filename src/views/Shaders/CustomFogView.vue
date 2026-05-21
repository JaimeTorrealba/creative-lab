<script setup>
import { TresCanvas } from "@tresjs/core";
import { OrbitControls } from "@tresjs/cientos";
import TheExperience from "@/components/demos/shaders/custom-fog/index.vue";
</script>
<template>
    <TresCanvas window-size clear-color="#111">
      <TresPerspectiveCamera :position="[0, 45, 120]" />
      <OrbitControls />
      <Suspense>
        <TheExperience />
      </Suspense>
    </TresCanvas>
</template>
