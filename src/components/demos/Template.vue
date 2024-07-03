<script setup>
import { OrbitControls } from '@tresjs/cientos'

</script>
<template>
    <TresPerspectiveCamera :position="[0, 0, 7]" :fov="45" :aspect="1" :near="0.1" :far="1000" />
    <OrbitControls />
    <TresMesh >
      <TresBoxGeometry :args="[1, 1, 1]" />
      <TresMeshBasicMaterial :color="0x00ff00" />
    </TresMesh>
    <TresAmbientLight />
</template>