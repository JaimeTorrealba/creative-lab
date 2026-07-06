<script setup>
import { TresCanvas } from '@tresjs/core'
import { OrbitControls } from '@tresjs/cientos'
import TheExperience from '@/components/demos/complex/effective-water/index.vue'
</script>
<template>
  <TresCanvas window-size antialias clear-color="#0b1420">
    <TresPerspectiveCamera :position="[14, 8, 14]" :fov="55" :look-at="[0, 0, 0]" />
    <OrbitControls />
    <Suspense>
      <TheExperience />
    </Suspense>
  </TresCanvas>
</template>
