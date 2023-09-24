<script setup>
import { ref, shallowRef, watch } from 'vue'
import { TresCanvas } from '@tresjs/core'
import { CameraControls } from '@tresjs/cientos'
import { gsap } from 'gsap'

const isVisible = ref(true)
const cubeRef = shallowRef()

watch(cubeRef, value => {
  console.log('jaime ~ value:', value);
  gsap.from(value.material, { duration: 1, opacity: 0})
})

function onEnter(el, done) {
  console.log('jaime ~ onEnter ~ el:', el);
  console.log('jaime ~ onEnter ~ el:', isVisible.value);
  console.log('jaime ~ onEnter ~ el:', cubeRef.value);
  // gsap.from(el, { duration: 1, opacity: 0, onComplete: done })
}

const showButton = () => {
  //isVisible.value = !isVisible.value
}
</script>
<template>
  <TresCanvas window-size clear-color="#111" ref="canvasRef" @click="showButton">
    <TresPerspectiveCamera :position="[0, 0, 3]" :fov="45" :aspect="1" :near="0.1" :far="1000" />
    <CameraControls />
   <Transition :css="false"
    @enter="onEnter">
      <TresMesh ref="cubeRef" v-if="isVisible">
        <TresBoxGeometry :args="[1, 1, 1]" />
        <TresMeshStandardMaterial :color="0x00ff00" :transparent="true" />
      </TresMesh>
    </Transition>
    <TresDirectionalLight :position="[0, 2, 4]" :intensity="2" />
    <TresAmbientLight />
  </TresCanvas>
</template>
