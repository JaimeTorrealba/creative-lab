<script setup>
import { useLoader } from '@tresjs/core';
import { Environment } from '@tresjs/cientos';
import { watchOnce } from '@vueuse/core';
import { MaterialXLoader } from 'three/addons/loaders/MaterialXLoader.js';

const { state: material, isLoading } = useLoader(
  MaterialXLoader,
  '/materials/Car_Paint.mtlx',
)

watchOnce(isLoading, (value) => {
  if (!value) {
    console.log('jaime ~ material:', material.value);
  }
});
</script>
<template>
    <Suspense>
        <Environment preset="city" background />
    </Suspense>
    <TresMesh :material="material.materials.Car_Paint" v-if="!isLoading">
        <TresIcosahedronGeometry :args="[1, 16]" />
    </TresMesh>
</template>