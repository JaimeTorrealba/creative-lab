<script setup>
import { TresCanvas } from '@tresjs/core'
import { OrbitControls } from '@tresjs/cientos'
import TheExperience from '@/components/demos/complex/waving-grass/index.vue'
</script>
<template>
  <TresCanvas window-size antialias clear-color="#aecbdd">
    <TresPerspectiveCamera :position="[0, 6, 16]" :fov="60" :far="300" :look-at="[0, 0, 0]" />
    <OrbitControls :max-polar-angle="Math.PI * 0.48" :max-distance="80" />
    <Suspense>
      <TheExperience />
    </Suspense>
  </TresCanvas>
</template>
