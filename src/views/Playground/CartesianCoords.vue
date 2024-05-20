<script setup>
import { shallowRef, reactive } from 'vue'
import { TresCanvas } from '@tresjs/core'
import { useTweakPane } from '@tresjs/cientos';

const cubeRef = shallowRef()

const options = reactive({
  x: 0,
  y: 0,
  z: 0,
  scaleX: 1,
  scaleY: 1,
  scaleZ: 1,
  rotationX: 0,
  rotationY: 0,
  rotationZ: 0,
})
const { pane } = useTweakPane()

pane.addBinding(options, 'x', {
  label: 'Pos X',
  min: -5,
  max: 5,
  step: 1,
})
pane.addBinding(options, 'y', {
  label: 'Pos Y',
  min: -5,
  max: 5,
  step: 1,
})
pane.addBinding(options, 'z', {
  label: 'Pos Z',
  min: -5,
  max: 5,
  step: 1,
})

pane.addBinding(options, 'scaleX', {
  label: 'Scale X',
  min: -5,
  max: 5,
  step: 1,
})
pane.addBinding(options, 'scaleY', {
  label: 'Scale Y',
  min: -5,
  max: 5,
  step: 1,
})
pane.addBinding(options, 'scaleZ', {
  label: 'Scale Z',
  min: -5,
  max: 5,
  step: 1,
})

pane.addBinding(options, 'rotationX', {
  label: 'Rotation X',
  min: -5,
  max: 5,
  step: 1,
})
pane.addBinding(options, 'rotationY', {
  label: 'Rotation Y',
  min: -5,
  max: 5,
  step: 1,
})
pane.addBinding(options, 'rotationZ', {
  label: 'Rotation Z',
  min: -5,
  max: 5,
  step: 1,
})
</script>
<template>
  <TresCanvas window-size clear-color="#000" ref="canvasRef">
    <TresPerspectiveCamera :position="[0, 0, 10]" :fov="45" :aspect="1" :near="0.1" :far="1000" />
    <TresMesh ref="cubeRef" :position="[options.x, options.y, options.z]" :rotation="[options.rotationX, options.rotationY, options.rotationZ]" :scale="[options.scaleX, options.scaleY, options.scaleZ]">
      <TresBoxGeometry :args="[1, 1, 1]" />
      <TresMeshStandardMaterial :color="0x00ff00" />
    </TresMesh>
    <!-- <TresAxesHelper :size="5" /> -->
    <TresGridHelper :args="[30, 30]" :position="[0, 0, 0]" :rotation-x="Math.PI *0.5" />
    <TresDirectionalLight :position="[0, 2, 4]" :intensity="2" />
    <TresAmbientLight />
  </TresCanvas>
</template>