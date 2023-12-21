<script setup>
import { shallowRef } from 'vue'
import { TresCanvas, useTexture, useRenderLoop } from '@tresjs/core'
import { OrbitControls, Reflector, Stars, MeshWobbleMaterial } from '@tresjs/cientos'
import vertex from "@/components/shaders/waterReflector/vertex.glsl"
import fragment from "@/components/shaders/waterReflector/fragment.glsl"
import { RepeatWrapping } from 'three'

const { map } = await useTexture({
  map: '/textures/waterdudv.jpg',
})
map.wrapS = map.wrapT = RepeatWrapping

const mirrorRef = shallowRef()
const customShader = {
  uniforms: {
    color: { value: null },
    tDiffuse: { value: null },
    textureMatrix: { value: null },
    tDudv: { value: map },
    time: { value: 0 }
  },
  vertexShader: vertex,
  fragmentShader: fragment,
}


const { onLoop } = useRenderLoop()
onLoop(({ elapsed }) => {
  if (mirrorRef.value) {
    mirrorRef.value.reflectorRef.material.uniforms.time.value = elapsed
  }
})
</script>
<template>
  <TresCanvas window-size clear-color="#111" ref="canvasRef">
    <TresPerspectiveCamera :position="[0, 5, 10]" :fov="45" :aspect="1" :near="0.1" :far="1000" :look-at="[0, 0, 0]" />
    <OrbitControls />
    <Stars />
    <TresMesh :position="[4, 0, 0]">
      <TresBoxGeometry :args="[1, 1, 1]" />
      <TresMeshStandardMaterial :color="0x00ff" />
    </TresMesh>
    <TresMesh :position="[-4, 0, 0]">
      <TresSphereGeometry :args="[1, 16]" />
      <TresMeshStandardMaterial :color="0xff0000" />
    </TresMesh>
    <TresMesh>
      <TresTorusGeometry />
      <MeshWobbleMaterial color="orange" :speed="1" :factor="2" />
    </TresMesh>
    <Reflector ref="mirrorRef" :shader="customShader" :rotation="[-Math.PI * 0.5, 0, 0]" :position="[0, -2, 0]"
      color="#222">
      <TresCircleGeometry :args="[10, 16]" />
    </Reflector>
    <TresDirectionalLight :position="[0, 2, 4]" :intensity="2" />
    <TresAmbientLight />
  </TresCanvas>
</template>