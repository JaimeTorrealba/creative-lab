<script setup>
import { TresCanvas } from '@tresjs/core'
import { OrbitControls } from '@tresjs/cientos'
import TheExperience from '@/components/demos/basics/LabeledGeometryDemo.vue'

</script>
<template>
  <TresCanvas shadows window-size clear-color="#111" ref="canvasRef">
    <TresPerspectiveCamera :position="[-15, 10, 10]" :args="[45, 1, 0.1, 1000]" />
    <OrbitControls />
    <TresHemisphereLight :args="[0xffffff, 0x444444, 1]" />
    <Suspense>
      <TheExperience />
    </Suspense>
  </TresCanvas>
</template>