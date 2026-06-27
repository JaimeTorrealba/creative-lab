<script setup>
import { TresCanvas } from "@tresjs/core";
import { OrbitControls } from "@tresjs/cientos";
import TheExperience from "@/components/demos/basics/LightProbes.vue";
</script>
<template>
    <TresCanvas window-size clear-color="#111">
      <TresPerspectiveCamera :position="[0, 7.5, 30]" />
      <OrbitControls :target="[0, 7.5, 0]" />
      <Suspense>
        <TheExperience />
      </Suspense>
    </TresCanvas>
</template>
