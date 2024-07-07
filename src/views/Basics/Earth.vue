<script setup>
import { TresCanvas } from '@tresjs/core'
import TheExperience from '@/components/demos/basics/EarthDemo.vue'

</script>
<template>
  <TresCanvas window-size clear-color="#000" id="mouse-chg" ref="canvas">
    <TresPerspectiveCamera :position="[0, 0, 3]" :args="[45, 1, 0.1, 1000]" />
    <Suspense>
      <TheExperience />
    </Suspense>
  </TresCanvas>
</template>
<style scoped>
#mouse-chg {
  cursor: grab;
}
</style>
