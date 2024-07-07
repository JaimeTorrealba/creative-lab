<script setup>

import { TresCanvas } from '@tresjs/core'
import { CameraControls } from '@tresjs/cientos'
import TheExperience from '@/components/demos/basics/SixSidesDemo.vue'

</script>
<template>
  <TresCanvas window-size clear-color="#111">
    <TresPerspectiveCamera :position="[0, 0, 3]" :args="[45, 1, 0.1, 1000]" />
    <CameraControls />
    <Suspense>
      <TheExperience />
    </Suspense>
  </TresCanvas>
</template>
