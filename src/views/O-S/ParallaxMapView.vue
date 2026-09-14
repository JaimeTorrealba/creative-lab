<script setup>
import { TresCanvas } from '@tresjs/core'
import TheExperience from '@/components/demos/o-s/parallax-map/index.vue'
import { OrbitControls } from '@tresjs/cientos'

const gl = {
  clearColor: '#333'
}
</script>
<template>
  <TresCanvas v-bind="gl" window-size>
    <TresPerspectiveCamera :position="[0, 4, 6.5]" :look-at="[0, 0, 0]" />
    <Suspense>
      <TheExperience />
    </Suspense>
    <OrbitControls />
    <!-- Only the plain plane reads scene lights; 0.6 here plus 2.5 on the directional light
         reproduces the 0.2 + 0.8 * diffuse the five shader planes hard-code. -->
    <TresAmbientLight :intensity="0.6" />
  </TresCanvas>
</template>
