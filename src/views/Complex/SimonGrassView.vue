<script setup>
import { TresCanvas } from "@tresjs/core";
import { OrbitControls } from "@tresjs/cientos";
import TheExperience from "@/components/demos/complex/SimonGrassDemo.vue";
</script>
<template>
  <TresCanvas window-size antialias clear-color="#e4e4e4">
    <TresPerspectiveCamera
      :position="[10, 5, 5]"
      :fov="60"
      :far="10000.0"
      :look-at="[0, 0, 0]"
    />
    <OrbitControls />
    <Suspense>
      <TheExperience />
    </Suspense>
    <TresGridHelper :size="5" :position="[0, 0, 0]" color="#000000" :opacity="0.2" />
  </TresCanvas>
</template>
