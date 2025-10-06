<script setup>
import { TresCanvas } from '@tresjs/core'
import { OrbitControls, Stats } from '@tresjs/cientos';
import TheExperience from '@/components/demos/basics/MirrorModifierDemo.vue'

</script>
<template>
  <TresCanvas window-size clear-color="#333" ref="canvasRef">
    <TresPerspectiveCamera :position="[0, 3, 7]"  :look-at="[0, 0, 0]" />
    <OrbitControls make-default />
    <Stats />
    <Suspense>
      <TheExperience />
    </Suspense>
    <TresDirectionalLight :intensity="5" :position="[-1, 1, -0.5]" />
    <TresAmbientLight />
  </TresCanvas>
</template>