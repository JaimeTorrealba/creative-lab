<script setup>
import { TresCanvas } from "@tresjs/core";
import { OrbitControls } from "@tresjs/cientos";
import TheExperience from "@/components/demos/basics/FbosDemo.vue";
</script>
<template>
    <TresCanvas window-size clear-color="#333">
      <TresPerspectiveCamera :position="[0, 0, 25]" />
      <OrbitControls />
      <Suspense>
        <TheExperience />
      </Suspense>
    </TresCanvas>
</template>
