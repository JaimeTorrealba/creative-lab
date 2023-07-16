<script setup>
import { shallowRef, reactive } from 'vue'
import { TresCanvas } from '@tresjs/core'
import { useTweakPane } from '@tresjs/cientos';

const cubeRef = shallowRef()

const options = reactive({
  x: 0,
  y: 0,
  z: 0
})
const { pane } = useTweakPane()

pane.addInput(options, 'x', {
  label: 'Eje X',
  min: -5,
  max: 5,
  step: 1,
})
pane.addInput(options, 'y', {
  label: 'Eje Y',
  min: -5,
  max: 5,
  step: 1,
})
pane.addInput(options, 'z', {
  label: 'Eje Z',
  min: -5,
  max: 5,
  step: 1,
})
</script>
<template>
  <TresCanvas window-size clear-color="#000" ref="canvasRef">
    <TresPerspectiveCamera :position="[0, 0, 10]" :fov="45" :aspect="1" :near="0.1" :far="1000" />
    <TresMesh ref="cubeRef" :position="[options.x, options.y, options.z]">
      <TresBoxGeometry :args="[1, 1, 1]" />
      <TresMeshStandardMaterial :color="0x00ff00" />
    </TresMesh>
    <!-- <TresAxesHelper :size="5" /> -->
    <TresGridHelper :args="[30, 30]" :position="[0, 0, 0]" :rotation-x="Math.PI *0.5" />
    <TresDirectionalLight :position="[0, 2, 4]" :intensity="2" />
    <TresAmbientLight />
  </TresCanvas>
</template>