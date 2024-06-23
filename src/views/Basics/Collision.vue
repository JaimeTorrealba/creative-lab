<script setup>
import { TresCanvas } from '@tresjs/core'
import Collision from '../../components/demos/basics/Collision.vue'

</script>
<template>
  <TresCanvas window-size clear-color="#111" ref="canvasRef">
    <TresPerspectiveCamera :position="[0, 0, 10]" />
    <Collision />
  </TresCanvas>
</template>