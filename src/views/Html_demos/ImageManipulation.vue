<script setup>
import { TresCanvas } from '@tresjs/core'
import { OrbitControls } from '@tresjs/cientos'

</script>
<template>
  <!-- <TresCanvas window-size clear-color="#111" ref="canvasRef">
    <TresPerspectiveCamera :position="[0, 0, 3]" :fov="45" :aspect="1" :near="0.1" :far="1000" />
    <OrbitControls />
    <TresDirectionalLight :position="[0, 2, 4]" :intensity="2" />
    <TresAmbientLight />
  </TresCanvas> -->
  <main class="html-page">
    <v-row class="row-container" align="center">
      <v-col class="image-container" cols="4">
        <img class="img" src="/images/imgToShader.jpg" alt="image" />
      </v-col>
      <v-col class="image-container" cols="4">
        <img class="img" src="/images/imgToShader.jpg" alt="image" />
      </v-col>
      <v-col class="image-container" cols="4">
        <img class="img" src="/images/imgToShader.jpg" alt="image" />
      </v-col>
      <v-col class="image-container" cols="4">
        <img class="img" src="/images/imgToShader.jpg" alt="image" />
      </v-col>
      <v-col class="image-container" cols="4">
        <img class="img" src="/images/imgToShader.jpg" alt="image" />
      </v-col>
      <v-col class="image-container" cols="4">
        <img class="img" src="/images/imgToShader.jpg" alt="image" />
      </v-col>
    </v-row>
  </main>
</template>
<style scoped>
.row-container {
  padding: 0.5rem;
}

.img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>