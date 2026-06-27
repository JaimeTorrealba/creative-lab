<script setup>
import { shallowRef } from "vue";
import DragControls from "../../internals/DragControls.vue";

const cubeRef = shallowRef();

const handleDrag = (e) => {
  const position = e.objects[0].position;
  position.y = 2.5;
  if (position.x > 25 || position.x < -25) {
    position.x = position.x > 25 ? 22.5 : -22.5;
  } else if (position.z > 25 || position.z < -25) {
    position.z = position.z > 25 ? 22.5 : -22.5;
  } else {
    position.x = Math.round(position.x / 5) * 5 + 2.5;
    position.z = Math.round(position.z / 5) * 5 + 2.5;
  }
};
</script>
<template>
  <TresMesh name="ground" :rotation-x="-Math.PI * 0.5">
    <TresPlaneGeometry :args="[50, 50, 32]" />
    <TresMeshStandardMaterial :color="0x00ff44" />
  </TresMesh>
  <TresMesh ref="cubeRef" :position="[2.5, 2.5, 2.5]">
    <TresBoxGeometry :args="[5, 5, 5]" />
    <TresMeshStandardMaterial />
  </TresMesh>
  <DragControls :objects="[cubeRef]" @drag="(e) => handleDrag(e)" />
  <TresGridHelper :args="[50, 10]" />
  <TresAmbientLight :intensity="0.5" />
  <TresDirectionalLight :position="[50, 50, 0]" :intensity="1" />
</template>
