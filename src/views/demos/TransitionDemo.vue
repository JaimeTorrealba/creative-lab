<script setup>
import { ref } from 'vue'
import { TresCanvas } from '@tresjs/core'
import { CameraControls } from '@tresjs/cientos'
import { gsap } from 'gsap'

const isVisible = ref(true)

function onEnter(el, done) {
  gsap.from(el.material, { duration: 1, opacity: 0, onComplete: done })
}
function onLeave(el, done) {
  const tl = gsap.timeline({ onComplete: done })
  tl.to(el.rotation, { duration: 1, x: 4 }).to(el.position, { duration: 1, x: 4 }, "<").to(el.material, { duration: 1, opacity: 0 }, "<")
}

const showFunc = () => {
  isVisible.value = !isVisible.value
}
</script>
<template>
  <button @click="showFunc" class="button">Click here</button>
  <TresCanvas clear-color="#82DBC5" window-size>
    <TresPerspectiveCamera :position="[3, 3, 3]" :look-at="[0, 0, 0]" />
    <CameraControls />
    <Transition :css="false" @enter="onEnter" @leave="onLeave">
      <TresMesh v-if="isVisible">
        <TresTorusGeometry :args="[1, 0.5, 16, 32]" />
        <TresMeshBasicMaterial color="orange" transparent  />
      </TresMesh>
    </Transition>
    <TresAmbientLight :intensity="1" />
  </TresCanvas>
</template>
<style scoped>
.button {
  z-index: 9999999;
  position: fixed;
  top: 5%;
  left: 50%;
}
</style>
