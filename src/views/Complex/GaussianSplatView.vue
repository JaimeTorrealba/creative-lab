<script setup>
import { TresCanvas } from '@tresjs/core'
import { KeyboardControls, Stats } from '@tresjs/cientos'
import GaussianSplatDemo from '@/components/demos/complex/GaussianSplat.vue'
</script>

<template>
  <TresCanvas window-size clear-color="#111">
    <TresPerspectiveCamera :position="[0, 1, 5]" :look-at="[0, 0, 0]" />
    <Stats />
    <KeyboardControls />
    <GaussianSplatDemo />
  </TresCanvas>
</template>
