<script setup>
import { TresCanvas } from "@tresjs/core";
import { OrbitControls } from "@tresjs/cientos";
import TheExperience from "@/components/demos/shaders/SlashDemo.vue";
</script>
<template>
    <TresCanvas window-size clear-color="#333">
      <TresPerspectiveCamera :position="[-7.5, 5, 0]" />
      <OrbitControls />
      <Suspense>
        <TheExperience />
      </Suspense>
      <TresAmbientLight :intensity="0.5" />
      <TresDirectionalLight :intensity="4" :position="[0, 7, 7]" />
      <TresGridHelper :size="50" :divisions="50" />
    </TresCanvas>
</template>
