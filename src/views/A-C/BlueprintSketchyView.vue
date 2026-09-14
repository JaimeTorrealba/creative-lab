<script setup>
import { TresCanvas } from '@tresjs/core'
import { OrbitControls } from '@tresjs/cientos'
import TheExperience from '@/components/demos/a-c/blueprint-sketchy/index.vue'

const gl = { clearColor: '#0d2f63' }
</script>

<template>
  <TresCanvas v-bind="gl" window-size>
    <TresPerspectiveCamera
      :position="[-8, 6, 16]"
      :fov="35"
      :near="0.5"
      :far="60"
      :look-at="[0, 0, 0]"
    />
    <Suspense>
      <TheExperience />
    </Suspense>
    <OrbitControls :min-distance="7" :max-distance="40" />
  </TresCanvas>
</template>
