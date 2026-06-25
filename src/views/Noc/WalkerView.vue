<script setup>
import { TresCanvas } from "@tresjs/core";
import { MapControls } from "@tresjs/cientos";
import TheExperience from "@/components/demos/noc/WalkerDemo.vue";
</script>
<template>
    <TresCanvas window-size clear-color="#e7e7e7">
      <TresPerspectiveCamera :position="[0, 50, 0]" />
      <MapControls :enableRotate="false" />
      <Suspense>
        <TheExperience />
      </Suspense>
    </TresCanvas>
</template>
