<script setup>
import { TresCanvas } from '@tresjs/core'
import { OrbitControls } from '@tresjs/cientos'
import { ACESFilmicToneMapping } from 'three'
import TheExperience from '@/components/demos/d-g/dreamy-particles/index.vue'
import { CAMERA_DISTANCE, CAMERA_FOV } from '@/components/demos/d-g/dreamy-particles/constants'
</script>
<template>
  <TresCanvas window-size clear-color="#000" :tone-mapping="ACESFilmicToneMapping">
    <TresPerspectiveCamera :position="[0, 0, CAMERA_DISTANCE]" :fov="CAMERA_FOV" :near="0.1" />
    <OrbitControls enable-damping :enable-zoom="false" :enable-pan="false" />
    <Suspense>
      <TheExperience />
    </Suspense>
  </TresCanvas>
</template>
