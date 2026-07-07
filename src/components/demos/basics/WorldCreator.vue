<script setup>
import { useTextures, Precipitation, Sky } from '@tresjs/cientos'

const { textures } = useTextures([
  '/textures/world-creator/height.jpg',
  '/textures/world-creator/color.jpg',
  '/textures/world-creator/normal.jpg',
  '/textures/world-creator/ao.jpg'
])
</script>
<template>
  <TresFog color="#626A71" :near="0.1" :far="100" />
  <Precipitation :area="[2.5, 2.5, 2.5]" :count="500" :size="0.005" />
  <Sky />
  <TresMesh :rotation-x="Math.PI * -0.5">
    <TresPlaneGeometry :args="[3, 3, 500, 500]" />
    <TresMeshStandardMaterial
      v-if="textures[0] && textures[1]"
      :displacementMap="textures[0]"
      :map="textures[1]"
      :normalMap="textures[2]"
      :aoMap="textures[3]"
    />
  </TresMesh>
  <TresDirectionalLight :position="[0, 2, 4]" :intensity="1.75" />
  <TresAmbientLight :intensity="0.75" />
</template>
