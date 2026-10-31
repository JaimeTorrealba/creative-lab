<script setup>
import { TresCanvas } from '@tresjs/core'
import { OrbitControls } from '@tresjs/cientos'
import TheExperience from '@/components/demos/d-g/grid-deformation/index.vue'
import { CAMERA_DISTANCE, CAMERA_FOV } from '@/components/demos/d-g/grid-deformation/constants'
</script>
<template>
  <TresCanvas window-size clear-color="#181818">
    <TresPerspectiveCamera :position="[0, 0, CAMERA_DISTANCE]" :fov="CAMERA_FOV" />
    <OrbitControls />
    <Suspense>
      <TheExperience />
    </Suspense>
  </TresCanvas>
</template>
