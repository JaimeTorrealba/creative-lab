<script setup>
import { TresCanvas } from "@tresjs/core";
import { OrbitControls, Sky } from "@tresjs/cientos";
import TheExperience from "@/components/demos/shaders/FireworksDemo.vue";
</script>
<template>
    <TresCanvas window-size clear-color="#111">
      <TresPerspectiveCamera :position="[0, 0, 15]" />
      <OrbitControls />
      <Sky :elevation="-2"  />
      <Suspense>
        <TheExperience />
      </Suspense>
    </TresCanvas>
</template>
