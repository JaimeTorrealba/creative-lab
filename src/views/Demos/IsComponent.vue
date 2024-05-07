<script setup>
import { ref } from 'vue'
import { TresCanvas } from '@tresjs/core'
import { OrbitControls } from '@tresjs/cientos'
import { gsap } from 'gsap'
import CubeMesh from '../../components/internals/IsComponentDemo/CubeMesh.vue';
import SphereMesh from '../../components/internals/IsComponentDemo/SphereMesh.vue';
import TorusMesh from '../../components/internals/IsComponentDemo/TorusMesh.vue';

const current = ref('CubeMesh')

const handleComponents = (component) => {
  current.value = component
}

function onEnter(el, done) {
  gsap.from(el.material, { duration: 1, opacity: 0, onComplete: done })
}
function onLeave(el, done) {
  const tl = gsap.timeline({ onComplete: done })
  tl.to(el.material, { duration: 0.15, opacity: 0 })
}

const meshes = {
  CubeMesh,
  SphereMesh,
  TorusMesh
}

</script>
<template>
  <div class="floating-container">
    <ul>
      <li @click="handleComponents('CubeMesh')">Cube</li>
      <li @click="handleComponents('SphereMesh')">Sphere</li>
      <li @click="handleComponents('TorusMesh')">Torus</li>
    </ul>
  </div>
  <TresCanvas window-size clear-color="#111" ref="canvasRef">
    <TresPerspectiveCamera :position="[0, 0, 3]" :fov="45" :aspect="1" :near="0.1" :far="1000" />
    <OrbitControls />
    <Transition :css="false" @enter="onEnter" @leave="onLeave">
      <component :is="meshes[current]" />
    </Transition>
    <TresDirectionalLight :position="[0, 2, 4]" :intensity="2" />
    <TresAmbientLight />
  </TresCanvas>
</template>
<style lang="scss" scoped>
.floating-container {
  position: absolute;
  top: 0;
  left: 50%;
  z-index: 100;
  background-color: #f7f7f7;
  color: #333;
  padding: 10px;

  ul {
    list-style-type: none;
    padding: 0;

    li {
      cursor: pointer;
      padding: 5px;

      &:hover {
        background-color: #ddd;
      }
    }
  }
}
</style>