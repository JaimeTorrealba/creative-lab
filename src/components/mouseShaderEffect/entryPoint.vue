<script setup>
import { watchEffect, onMounted } from 'vue'
import { Box } from '@tresjs/cientos'
import { TresCanvas, useTres } from '@tresjs/core'
import { useMouse, useWindowSize } from '@vueuse/core'
import { Vector2, Raycaster } from 'three'

const { x, y } = useMouse()
const { width, height } = useWindowSize()
const raycaster = new Raycaster()
let camera = null
let scene = null

onMounted(() => {
  camera = useTres().state.camera
  scene = useTres().state.scene
})

watchEffect(() => {
  x.value = (x.value / width.value) * 2 - 1
  y.value = -(y.value / height.value) * 2 + 1

  if (camera && scene) {
    raycaster.setFromCamera(new Vector2(x.value, y.value), camera)
    const intersects = raycaster.intersectObjects(scene.children)
    if (intersects.length > 0) {
      let obj = intersects[0].object
      obj.material.uniforms.hover.value = intersects[0].uv
    }
  }
})

const shader = {
  uniforms: {
    hover: { value: new Vector2(0.5, 0.5) },
  },
  vertexShader: `
  varying vec2 vUv;
  varying vec2 vHover;
  uniform vec2 hover;
  
    void main(){
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      vUv = uv;
      vHover = hover;
    }
  `,
  fragmentShader: `
  varying vec2 vUv;
  varying vec2 vHover;

    void main(){
      float strength = distance(vUv, vHover) * 10. ;
      gl_FragColor = vec4(vUv.x, vUv.y, vUv.x * vUv.y, strength-0.5);
    }
  `
}
</script>
<template>
  <TresCanvas window-size clear-color="#333" class="over-hidden">
    <TresPerspectiveCamera :args="[45, 1, 0.1, 1000]" :position="[0, 0, 1]" />
    <TresMesh>
      <TresPlaneGeometry :args="[2, 1]" />
      <TresShaderMaterial v-bind="shader" :transparent="true" />
    </TresMesh>
    <Box :args="[0.75, 0.75, 0.75]" color="orange" :position="[0,0,-3]" />
    <Box :args="[0.75, 0.75, 0.75]" color="blue" :position="[2,1,-3]" />
    <Box :args="[0.75, 0.75, 0.75]" color="red" :position="[-2,-1,-3]" />
  </TresCanvas>
</template>
