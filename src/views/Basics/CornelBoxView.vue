<script setup>
import { TresCanvas } from '@tresjs/core'
import { useWindowSize } from '@vueuse/core';

const { width, height } = useWindowSize();
</script>
<template>
  <TresCanvas window-size clear-color="#111">
    <TresPerspectiveCamera :position="[0, 7, 25]"  :args="[40, width / height, 0.1, 1000]" />

    <!-- Cornell Box inspired scene -->

    <!-- Left wall - red -->
    <TresMesh :position="[-10, 7.5, 0]" :rotation="[0, Math.PI * 0.5, 0]" :scale="[20, 15, 1]" :receiveShadow="true">
      <TresPlaneGeometry :args="[1, 1]" />
      <TresMeshPhysicalMaterial color="#ff0000" />
    </TresMesh>

    <!-- Right wall - green -->
    <TresMesh :position="[10, 7.5, 0]" :rotation="[0, -Math.PI * 0.5, 0]" :scale="[20, 15, 1]" :receiveShadow="true">
      <TresPlaneGeometry :args="[1, 1]" />
      <TresMeshPhysicalMaterial color="#00ff00" />
    </TresMesh>

    <!-- Floor (white) -->
    <TresMesh :rotation="[-Math.PI * 0.5, 0, 0]" :scale="[20, 20, 1]" :receiveShadow="true">
      <TresPlaneGeometry :args="[1, 1]" />
      <TresMeshPhysicalMaterial color="#ffffff" />
    </TresMesh>

    <!-- Back wall (white) -->
    <TresMesh :position="[0, 7.5, -10]" :rotation="[0, 0, -Math.PI * 0.5]" :scale="[15, 20, 1]" :receiveShadow="true">
      <TresPlaneGeometry :args="[1, 1]" />
      <TresMeshPhysicalMaterial color="#ffffff" />
    </TresMesh>

    <!-- Ceiling (white) -->
    <TresMesh :position="[0, 15, 0]" :rotation="[Math.PI * 0.5, 0, 0]" :scale="[20, 20, 1]" :receiveShadow="true">
      <TresPlaneGeometry :args="[1, 1]" />
      <TresMeshPhysicalMaterial color="#ffffff" />
    </TresMesh>

    <!-- Tall box (white) -->
    <TresMesh :position="[-3, 3.5, -2]" :rotation="[0, Math.PI * 0.25, 0]" :castShadow="true" :receiveShadow="true">
      <TresBoxGeometry :args="[5, 7, 5]" />
      <TresMeshPhysicalMaterial color="#ffffff" />
    </TresMesh>

    <!-- Short box (white) -->
    <TresMesh :position="[4, 2, 4]" :rotation="[0, -Math.PI * 0.1, 0]" :castShadow="true" :receiveShadow="true">
      <TresBoxGeometry :args="[4, 4, 4]" />
      <TresMeshPhysicalMaterial color="#ffffff" />
    </TresMesh>

    <!-- Light source geometry (cylinder) -->
    <TresMesh :position="[0, 15, 0]">
      <TresCylinderGeometry :args="[2.5, 2.5, 1, 64]" />
      <TresMeshBasicMaterial />
    </TresMesh>

    <!-- Point light -->
    <TresPointLight
      color="#ffffff"
      :intensity="100"
      :position="[0, 13, 0]"
      :distance="100"
      :castShadow="true"
      :shadow-bias="-0.0025"
      :shadow-mapSize-width="1024"
      :shadow-mapSize-height="1024"
    />

    <!-- Ambient light -->
    <TresAmbientLight color="#0c0c0c" />
  </TresCanvas>
</template>