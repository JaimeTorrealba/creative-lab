
<script setup>
import { TresCanvas } from '@tresjs/core'
import OnFirstPersonControls from '../../components/external/OnFirstPersonControls.vue'

</script>
<template>
  <TresCanvas window-size clear-color="#f7f7f7" ref="canvasRef">
    <TresPerspectiveCamera :position="[0, 0, 3]" :fov="45" :aspect="1" :near="0.1" :far="1000" />
    <OnFirstPersonControls />
    <!-- <Suspense>
      <Weapon />
    </Suspense> -->
    <TresGridHelper :args="[100,100]" :position-y="-2" />
    <TresDirectionalLight :position="[0, 2, 4]" :intensity="2" />
    <TresAmbientLight />
  </TresCanvas>
</template>