<script setup>
import { TresCanvas } from '@tresjs/core'
import { OrbitControls } from '@tresjs/cientos'
import TheExperience from '@/components/demos/complex/atmospheric-scattering/index.vue'
</script>
<template>
  <TresCanvas window-size antialias clear-color="#000005">
    <TresPerspectiveCamera :position="[0, 0.6, 3.4]" :fov="50" :near="0.1" :far="200" />
    <OrbitControls :min-distance="1.3" :max-distance="20" enable-damping />
    <Suspense>
      <TheExperience />
    </Suspense>
  </TresCanvas>
</template>
