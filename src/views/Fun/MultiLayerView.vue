<script setup>
import { TresCanvas } from '@tresjs/core'
import TheExperience from '@/components/demos/fun/MultiLayerDemo.vue'

// TODO: update to OrthographicCamera
</script>
<template>
  <TresCanvas window-size clear-color="#111">
    <TresPerspectiveCamera
      :position="[0, 0, 7.5]"
      :look-at="[0, 0, 0]"
    />
    <Suspense>
      <TheExperience />
    </Suspense>
    <TresAmbientLight :intensity="0.5" />
  </TresCanvas>
</template>
