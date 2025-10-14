<script setup>
import { TresCanvas } from '@tresjs/core'
import { OrbitControls } from '@tresjs/cientos'
import TheExperience from '@/components/demos/shaders/AudioAnalyserDemo.vue'

</script>
<template>
  <TresCanvas window-size clear-color="#111">
    <TresPerspectiveCamera :position="[0, 3, 15]" :look-at="[0, 0, 0]" />
    <OrbitControls />
    <Suspense>
      <TheExperience />
    </Suspense>
  </TresCanvas>
</template>