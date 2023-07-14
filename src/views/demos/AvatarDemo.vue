<script setup>
import { TresCanvas } from '@tresjs/core'
import { OrbitControls, GLTFModel } from '@tresjs/cientos'


</script>
<template>
  <TresCanvas window-size clear-color="#000" ref="canvasRef">
    <TresPerspectiveCamera :position="[0, 3, 3]" :fov="45" :aspect="1" :near="0.1" :far="1000" />
    <OrbitControls />
    <Suspense>
      <GLTFModel path="/models/jaimeAvatar.glb" draco />
    </Suspense>
    <TresDirectionalLight :position="[0, 2, 4]" :intensity="2" />
    <TresAmbientLight :intensity="4" />
    <TresAxesHelper :size="1" />
  </TresCanvas>
</template>