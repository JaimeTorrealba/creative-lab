<script setup>
import { TresCanvas } from '@tresjs/core'
import TheExperience from '@/components/demos/t-z/vertex-texture-water/index.vue'
</script>
<template>
  <TresCanvas window-size antialias clear-color="#bcd3e3">
    <TresPerspectiveCamera :position="[0, 3, 0]" :fov="55" :near="0.1" :far="12000" />
    <Suspense>
      <TheExperience />
    </Suspense>
  </TresCanvas>
</template>
