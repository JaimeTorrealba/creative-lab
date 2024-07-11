<script setup>
import { shallowRef, ref, watch } from 'vue';
import { TresCanvas } from '@tresjs/core'
import { Environment, vLog } from '@tresjs/cientos'
import { gsap } from 'gsap'
import { useElementSize } from '@vueuse/core'

const sphereRef = shallowRef()
const torusRef = shallowRef()
const icoRef = shallowRef()
const coneRef = shallowRef()
const cameraRef = shallowRef()
const wrapperRef = ref()
const { width, height } = useElementSize(wrapperRef)
const torusDuration = 0.35
const icoDuration = 0.5

watch(width, value => {
  cameraRef.value.aspect = value / height.value
  cameraRef.value.updateProjectionMatrix()
})

const grow = () => {
  gsap.to(sphereRef.value.scale, { x: 1, y: 1, z: 1, duration: 0.4 })
  gsap.to(sphereRef.value.position, { x: -1.25, y: -1, z: 0, duration: 0.4 })
  //torus
  gsap.to(torusRef.value.scale, { x: 0.9, y: 0.9, z: 0.9, duration: torusDuration })
  gsap.to(torusRef.value.position, { x: 0.75, y: 1.45, z: 0, duration: torusDuration })
  gsap.to(torusRef.value.rotation, { x: -0.75, y: -0.25, duration: torusDuration })
  //ico
  gsap.to(icoRef.value.scale, { x: 0.75, y: 0.75, z: 0.75, duration: icoDuration })
  gsap.to(icoRef.value.position, { x: 3.25, y: 0.75, z: 0, duration: icoDuration })
  gsap.to(icoRef.value.rotation, { y: 4, duration: icoDuration })
  //cone
  gsap.to(coneRef.value.scale, { x: 0.85, y: 0.85, z: 0.85, duration: icoDuration })
  gsap.to(coneRef.value.position, { x: -3, y: 1.25, z: 0, duration: icoDuration })
  gsap.to(coneRef.value.rotation, { z: 1.2, duration: icoDuration })
}
const shrink = () => {
  gsap.to(sphereRef.value.scale, { x: 0, y: 0, z: 0, duration: 0.4 })
  gsap.to(sphereRef.value.position, { x: 0, y: 0, z: 0, duration: 0.4 })
  //torus
  gsap.to(torusRef.value.scale, { x: 0, y: 0, z: 0, duration: torusDuration })
  gsap.to(torusRef.value.position, { x: 0, y: 0, z: 0, duration: torusDuration })
  gsap.to(torusRef.value.rotation, { x: 0, duration: torusDuration })
  //ico
  gsap.to(icoRef.value.scale, { x: 0, y: 0, z: 0, duration: icoDuration })
  gsap.to(icoRef.value.position, { x: 3, y: 0, z: 0, duration: icoDuration })
  gsap.to(icoRef.value.rotation, { y: 0, duration: icoDuration })
  //cone
  gsap.to(coneRef.value.scale, { x: 0.0, y: 0.0, z: 0.0, duration: icoDuration })
  gsap.to(coneRef.value.position, { x: -3, y: 0, z: 0, duration: icoDuration })
  gsap.to(coneRef.value.rotation, { z: 0, duration: icoDuration })
}

</script>
<template>
  <div class="fullScreen">
    <div class="wrapper" ref="wrapperRef" @mouseenter="grow" @mouseleave="shrink">
      <button class="button"><span class="button-text">Play</span></button>
      <TresCanvas alpha ref="canvasRef" class="canvas">
        <TresPerspectiveCamera ref="cameraRef" :position="[0, 0, 5]" />
        <Environment preset="city" />
        <TresMesh ref="sphereRef" :scale="0">
          <TresSphereGeometry :args="[1, 32]" />
          <TresMeshStandardMaterial :color="0xff004b" :roughness="0" :metalness="1" :envMapIntensity="0.05" v-log />
        </TresMesh>
        <TresMesh ref="torusRef" :scale="0">
          <TresTorusGeometry :args="[0.75, 0.35]" />
          <TresMeshStandardMaterial :color="0x9EC2F4" :roughness="0" :metalness="1" :envMapIntensity="0.5" />
        </TresMesh>
        <TresMesh ref="icoRef" :position="[3, 0, 0]" :scale="0">
          <TresIcosahedronGeometry :args="[1, 0]" />
          <TresMeshStandardMaterial :color="0x9EC2F4" :roughness="0" :metalness="1" :envMapIntensity="0.5" />
        </TresMesh>
        <TresMesh ref="coneRef" :position="[-3, 0, 0]" :scale="0">
          <TresConeGeometry :args="[0.55, 1.5]" />
          <TresMeshStandardMaterial :color="0xff004b" :roughness="0" :metalness="1" :envMapIntensity="0.5" />
        </TresMesh>
        <TresDirectionalLight :position="[-3, 2, 0]" :intensity="4" />
        <TresAmbientLight :intensity="4" />
      </TresCanvas>
    </div>
  </div>
</template>
<style lang="scss" scoped>
.wrapper {
  position: relative;
  padding: 1rem;
  height: 140px;
  width: 245px;

  .button {
    background-color: #9EC2F4;
    padding: 1rem 4rem;
    border-radius: 1rem;
    transition: all 0.4s ease-in-out;
  }
}

.button-text {
  position: relative;
  z-index: 9999 !important;
}

.wrapper:hover {
  cursor: pointer;
  .button {
    background-color: #ff004b;
    transform: scale(1.1);
    cursor: pointer;
    // background-image: linear-gradient(76deg, #9ec2f4 28%, #ff004b 100%);
  }
}

.fullScreen {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  background-color: #E2F2FF;
  display: grid;
  place-items: center;
}

.canvas {
  position: absolute !important;
  width: 100% !important;
  left: -5% !important;
}
</style>