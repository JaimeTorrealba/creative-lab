<script setup>
import { OrbitControls } from '@tresjs/cientos'
import { useTexture, TresCanvas } from '@tresjs/core'
import TheExperience from '@/components/demos/shaders_demos/CSMDemo.vue'

const { map } = await useTexture({ map: '/textures/glassMorphismTexture.jpg' })
</script>
<template>
  <TresCanvas window-size clear-color="#F7F7F7" >
    <TresPerspectiveCamera :position="[0, 0, 3]" />
    <OrbitControls />
    <TresGridHelper :args="[30, 30]" :position="[0, -2.5, 0]" />
    <Suspense>
      <TheExperience />
    </Suspense>
    <TresMesh ref="planeRef" :position="[0, 0, -1]">
      <TresPlaneGeometry :args="[5, 5]" />
      <TresMeshBasicMaterial :map="map" />
    </TresMesh>
    <TresDirectionalLight :position="[0, 2, 4]" :intensity="2" cast-shadow />
    <TresAmbientLight />
  </TresCanvas>
</template>
