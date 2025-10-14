<script setup>
import { TresCanvas } from '@tresjs/core'
import { OrbitControls } from '@tresjs/cientos'
import TheExperience from '@/components/demos/fun/CSS2DRendererDemo.vue'

</script>
<template>
  <TresCanvas window-size clear-color="#333">
    <TresPerspectiveCamera :position="[0, 0, 3]" />
    <OrbitControls />
    <Suspense>
      <TheExperience />
    </Suspense>
  </TresCanvas>
</template>