<script setup>
import { TresCanvas } from "@tresjs/core";
import TheExperience from "@/components/demos/basics/ControlsCurve.vue";
</script>
<template>
    <TresCanvas window-size clear-color="#111">
      <TresPerspectiveCamera :position="[0, 5, 15]" />
      <Suspense>
        <TheExperience />
      </Suspense>
      <TresGridHelper />
    </TresCanvas>
</template>
