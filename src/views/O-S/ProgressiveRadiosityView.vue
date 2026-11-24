<script setup>
import { TresCanvas } from '@tresjs/core'
import { OrbitControls } from '@tresjs/cientos'
import TheExperience from '@/components/demos/o-s/progressive-radiosity/index.vue'

const gl = { clearColor: '#0b0b0d', antialias: true }
</script>

<template>
  <TresCanvas v-bind="gl" window-size>
    <TresPerspectiveCamera :position="[0, 1, 4.4]" :fov="40" :near="0.05" :far="30" />
    <Suspense>
      <TheExperience />
    </Suspense>
    <OrbitControls :target="[0, 1, 0]" :min-distance="1.5" :max-distance="9" />
  </TresCanvas>
</template>
