<script setup>
import { TresCanvas } from "@tresjs/core";
import { OrbitControls } from "@tresjs/cientos";
import TheExperience from "@/components/demos/shaders/VolumetricDemo.vue";
</script>
<template>
    <TresCanvas window-size clear-color="#111">
      <TresPerspectiveCamera :position="[0, 0, 10]" />
      <OrbitControls />
      <Suspense>
        <TheExperience />
      </Suspense>
    </TresCanvas>
</template>
