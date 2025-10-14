<script setup>
import { TresCanvas } from '@tresjs/core'
import { Stats } from '@tresjs/cientos'
import TheExperience from '@/components/demos/fun/TwoScenesDemo.vue'
 
</script>
<template>
  <TresCanvas window-size antialias shadowMap-enabled :clear-color="0xa8def0" ref="canvasRef">
    <TresPerspectiveCamera :position="[-16, 8, 16]" :fov="45" :aspect="1" :near="0.1"
      :far="500" />
      <Stats />
      <Suspense>
        <TheExperience />
      </Suspense>

    <TresAmbientLight />
  </TresCanvas>
</template>