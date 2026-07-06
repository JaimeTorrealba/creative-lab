<script setup>
import { TresCanvas } from '@tresjs/core'
import { OrbitControls } from '@tresjs/cientos'
import TheExperience from '@/components/demos/complex/virtual-botany/index.vue'
</script>
<template>
  <TresCanvas window-size antialias clear-color="#aecbdd">
    <TresPerspectiveCamera :position="[0, 8, 22]" :fov="60" :far="200" :look-at="[0, 0, 0]" />
    <OrbitControls :max-polar-angle="Math.PI * 0.48" :max-distance="60" />
    <Suspense>
      <TheExperience />
    </Suspense>
  </TresCanvas>
</template>
