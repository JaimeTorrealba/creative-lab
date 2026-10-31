<script setup>
import { TresCanvas } from '@tresjs/core'
import { OrbitControls } from '@tresjs/cientos'
import Voxel from '@/components/demos/t-z/voxel/index.vue'
</script>
<template>
  <TresCanvas window-size clear-color="#eeeff2" shadows>
    <TresPerspectiveCamera :position="[0, 5, 20]" :fov="45" :look-at="[0, 0, 0]" />
    <OrbitControls
      auto-rotate
      enable-damping
      :enable-pan="false"
      :min-distance="20"
      :max-distance="30"
      :min-polar-angle="0.35 * Math.PI"
      :max-polar-angle="0.65 * Math.PI"
    />
    <Suspense>
      <Voxel />
    </Suspense>
  </TresCanvas>
</template>
