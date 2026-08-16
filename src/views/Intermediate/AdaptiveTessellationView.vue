<script setup>
import { TresCanvas } from '@tresjs/core'
import { OrbitControls } from '@tresjs/cientos'
import TheExperience from '@/components/demos/intermediate/adaptive-tessellation/index.vue'

const gl = { clearColor: '#14171c' }
</script>

<template>
  <TresCanvas v-bind="gl" window-size>
    <TresPerspectiveCamera :position="[0, 2.6, 5.6]" :look-at="[0, 0, 0]" />
    <Suspense>
      <TheExperience />
    </Suspense>
    <OrbitControls :min-distance="2" :max-distance="18" />
  </TresCanvas>
</template>
