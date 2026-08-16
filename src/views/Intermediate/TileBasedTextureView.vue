<script setup>
import { TresCanvas } from '@tresjs/core'
import { OrbitControls } from '@tresjs/cientos'
import TheExperience from '@/components/demos/intermediate/tile-based-texture/index.vue'

const gl = { clearColor: '#333' }
</script>

<template>
  <TresCanvas v-bind="gl" window-size>
    <TresPerspectiveCamera :position="[0, 7, 11]" :look-at="[0, 0, 0]" />
    <Suspense>
      <TheExperience />
    </Suspense>
    <OrbitControls />
  </TresCanvas>
</template>
