<script setup>
import { shallowRef, watch, ref } from 'vue'
import { TresCanvas } from '@tresjs/core'
import { OrbitControls } from '@tresjs/cientos'
import { EdgeSplitModifier } from 'three/addons/modifiers/EdgeSplitModifier.js';
import { IcosahedronGeometry } from 'three';

const icoRef = shallowRef(null);
const modifier = new EdgeSplitModifier();
const isModified = ref(false);

const smoothGeometry = () => {
  const baseGeometry = icoRef.value.geometry;
  icoRef.value.geometry = modifier.modify(
    baseGeometry,
    Math.PI * 2,
    // params.tryKeepNormals
  );
  isModified.value = true;
}

watch(icoRef, (ico) => {
  if (!ico) return;
  //   smoothGeometry();
});

const changeGeo = () => {
  icoRef.value.geometry.dispose();
  if (isModified.value) {
    icoRef.value.geometry = new IcosahedronGeometry(1, 1);
    isModified.value = false;
  } else {
    console.log('jaime ~ changeGeo ~ isModified.value:', isModified.value);
    smoothGeometry();
  }
}
</script>
<template>
  <button @click="changeGeo" class="button">Click here</button>
  <TresCanvas window-size clear-color="#111" ref="canvasRef">
    <TresPerspectiveCamera :position="[0, 0, 3]" :fov="45" :aspect="1" :near="0.1" :far="1000" />
    <OrbitControls />
    <TresMesh ref="icoRef">
      <TresIcosahedronGeometry :args="[1, 1]" />
      <TresMeshStandardMaterial :color="0xe4e4e4" />
    </TresMesh>
    <TresDirectionalLight :position="[0, 2, 4]" :intensity="2" />
    <TresAmbientLight />
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