<script setup>
import { TresCanvas } from '@tresjs/core'
import { OrbitControls } from '@tresjs/cientos'
import TheExperience from '@/components/demos/basics/WorldCreator.vue'
import { ACESFilmicToneMapping } from 'three'

const gl = {
  antialias: true,
  toneMapping: ACESFilmicToneMapping,
  toneMappingExposure: 1,
  clearColor: '#111',
  physicallyCorrectLights: true
}
</script>
<template>
  <TresCanvas window-size v-bind="gl">
    <TresPerspectiveCamera :position="[-1.2, 0.13, 1.3]" :fov="75" />
    <OrbitControls />
    <Suspense>
      <TheExperience />
    </Suspense>
  </TresCanvas>
</template>
