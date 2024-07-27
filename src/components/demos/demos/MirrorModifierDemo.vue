<script setup>
import { shallowRef } from 'vue'
import MirrorModifier from '@/components/internals/MirrorModifierComponent.vue'
import { TransformControls } from '@tresjs/cientos'

const cubeRef = shallowRef(null)

</script>
<template>
  <TresMesh ref="cubeRef" 
  :position="[0,0,0]"
  :rotation="[0,0,0]"
  >
    <TresBoxGeometry />
    <TresMeshStandardMaterial :color="0x00ff00" />
  </TresMesh>
  <TransformControls :object="cubeRef" />
  <MirrorModifier :object="cubeRef" />
</template>