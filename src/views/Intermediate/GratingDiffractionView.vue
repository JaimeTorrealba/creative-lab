<script setup>
import { TresCanvas } from "@tresjs/core";
import { OrbitControls } from "@tresjs/cientos";
import TheExperience from "@/components/demos/intermediate/grating-diffraction/index.vue";
</script>
<template>
    <TresCanvas window-size clear-color="#333">
      <TresPerspectiveCamera :position="[0, 0.8, 3.5]" />
      <OrbitControls />
      <Suspense>
        <TheExperience />
      </Suspense>
    </TresCanvas>
</template>
