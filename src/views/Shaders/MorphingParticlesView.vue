<script setup>
import { TresCanvas } from "@tresjs/core";
import { OrbitControls } from "@tresjs/cientos";
import { ACESFilmicToneMapping } from 'three'
import TheExperience from "@/components/demos/shaders/MorphingParticlesDemo.vue";
</script>
<template>
  <TresCanvas window-size :clear-color="0x333333" :antialias="true" :tone-mapping="ACESFilmicToneMapping">
    <TresPerspectiveCamera :position="[0,0,12]" />
    <TheExperience />
    <OrbitControls  />
  </TresCanvas>
</template>
