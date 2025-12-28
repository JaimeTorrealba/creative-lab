<script setup>
import { TresCanvas } from "@tresjs/core";
import { OrbitControls } from "@tresjs/cientos";
import TheExperience from "@/components/demos/shaders/HoverOnFacesDemo.vue";
</script>
<template>
    <TresCanvas window-size clear-color="#333">
      <TresPerspectiveCamera :position="[0, 0, 5]" />
      <OrbitControls />
      <Suspense>
        <TheExperience />
      </Suspense>
    </TresCanvas>
</template>
