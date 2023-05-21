<script setup>
import { shallowRef, watch } from 'vue'
import { useEventListener } from '@vueuse/core'
import { Sphere, OrbitControls, useTweakPane } from '@tresjs/cientos'
import { TresCanvas, useRenderLoop, extend, useTres } from '@tresjs/core'
import { DragControls } from 'three/addons/controls/DragControls.js';

const canvasRef = shallowRef()
const cameraRef = shallowRef()
const baseRef = shallowRef()

extend({ DragControls })
const { state } = useTres()

watch(state, () => {
  console.log(state)
})



const { pane } = useTweakPane()

// const o = reactive({
//   zoom: 0.1,
//   rotation: {
//     x: Math.PI * 2,
//     y: 0,
//     z: 0
//   }
// })

// pane.addInput(o.rotation, 'x', {
//   label: 'zoxom',
//   min: 0,
//   max: 16,
//   step: 0.01
// })


console.log(DragControls)
const { onLoop } = useRenderLoop()

onLoop(() => {
})
</script>
<template>
  <TresCanvas window-size clear-color="#000" class="over-hidden mouse-chg" ref="canvasRef">
    <TresPerspectiveCamera ref="cameraRef" :position="[0, 0, 15]"  />
    <!-- <OrbitControls ref="controls" make-default /> -->
    <TresDragControls v-if="state.renderer" :args="[baseRef, state.camera, state.renderer?.domElement]" />

    <TresMesh ref="baseRef" :scale="[3, 3, 3]">
      <TresPlaneGeometry :args="[10, 10]" />
      <TresMeshBasicMaterial color="red" />
    </TresMesh>
    <TresGridHelper :args="[30, 30]" :rotation="[Math.PI * 0.5, 0, 0]" :position="[0, 0, 0]" />
    <TresDirectionalLight :position="[0, 2, 4]" :intensity="1" />
    <TresAmbientLight />
  </TresCanvas>
</template>
<style scoped>
.mouse-chg {
  cursor: grab;
}
</style>
