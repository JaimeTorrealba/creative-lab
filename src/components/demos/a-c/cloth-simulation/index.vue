<script setup>
import { Physics, RigidBody } from '@tresjs/rapier'
import ClothSheet from './ClothSheet.vue'
import { BALL_RADIUS, GROUND_Y } from './constants'
</script>

<template>
  <Physics>
    <RigidBody type="fixed" collider="ball">
      <TresMesh cast-shadow receive-shadow>
        <TresSphereGeometry :args="[BALL_RADIUS, 48, 48]" />
        <TresMeshStandardMaterial color="#e8e8e8" :roughness="0.4" />
      </TresMesh>
    </RigidBody>
    <RigidBody type="fixed" :position="[0, GROUND_Y - 0.1, 0]">
      <TresMesh receive-shadow>
        <TresBoxGeometry :args="[12, 0.2, 12]" />
        <TresMeshStandardMaterial color="#2a2a2e" />
      </TresMesh>
    </RigidBody>
    <ClothSheet />
  </Physics>
  <TresAmbientLight :intensity="0.6" />
  <TresDirectionalLight
    :position="[4, 8, 3]"
    :intensity="2"
    cast-shadow
    :shadow-mapSize-width="2048"
    :shadow-mapSize-height="2048"
  />
</template>
