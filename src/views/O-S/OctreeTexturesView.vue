<script setup>
import { TresCanvas } from '@tresjs/core'
import { OrbitControls } from '@tresjs/cientos'
import TheExperience from '@/components/demos/o-s/octree-textures/index.vue'
</script>

<template>
  <TresCanvas window-size clear-color="#141418">
    <TresPerspectiveCamera :position="[0, 2.6, 3.6]" :fov="45" />
    <OrbitControls :min-distance="2" :max-distance="10" />
    <Suspense>
      <TheExperience />
    </Suspense>
  </TresCanvas>
</template>
