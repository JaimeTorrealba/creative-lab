<script setup>
import { TresCanvas } from '@tresjs/core'
import { OrbitControls } from '@tresjs/cientos'
import TheExperience from '@/components/demos/complex/dynamic-ambient-occlusion/index.vue'

const gl = { clearColor: '#0e1013' }
</script>

<template>
  <TresCanvas v-bind="gl" window-size>
    <TresPerspectiveCamera
      :position="[8, 5.5, 9]"
      :fov="40"
      :near="0.5"
      :far="80"
      :look-at="[0, 1.2, 0]"
    />
    <Suspense>
      <TheExperience />
    </Suspense>
    <OrbitControls :target="[0, 1.2, 0]" :min-distance="4" :max-distance="30" />
  </TresCanvas>
</template>
