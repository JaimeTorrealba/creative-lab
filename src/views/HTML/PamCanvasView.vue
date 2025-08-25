<script setup>
import { TresCanvas } from "@tresjs/core";
import { Image, Stars, OrbitControls } from "@tresjs/cientos";
</script>
<template>
  <section class="is-flex is-flex-direction-column is-justify-content-space-between h-screen">
    <div class="columns is-centered has-background-dark">
      <div class="column is-half p-4">
        <h1 class="title-4 text-center">Pam Canvas</h1>
        <p>
          Lorem, ipsum dolor sit amet consectetur adipisicing elit. Doloribus, quod. Rerum
          quis molestiae, reiciendis officia nihil, fugit nisi tenetur et a error magnam
          ipsam voluptatem ut atque totam! Omnis, facere.
        </p>
      </div>
    </div>
    <div class="columns">
      <div class="column fullscreen">
        <TresCanvas clear-color="#111">
          <TresPerspectiveCamera
            :position="[0, 0, 6]"
            :fov="45"
            :aspect="1"
            :near="0.1"
            :far="1000"
          />
          <OrbitControls
            :enableRotate="false"
            :enableZoom="false"
            :keyPanSpeed="10"
            :keys="{
              LEFT: 'ArrowRight',
            }"
            :dampingFactor="0.5"
          />
          <Stars />

          <Image
            v-for="num in 9"
            :key="num"
            :url="`https://picsum.photos/200/${num * 100}`"
            :radius="0.2"
            :transparent="true"
            :position="[num * Math.random() + num, num * Math.random() + num, 0]"
          />
        </TresCanvas>
      </div>
    </div>
    <div class="columns is-centered has-background-dark">
      <div class="column is-half px-4">
        <h1 class="title-4 text-center">Pam Canvas</h1>
        <p>
          Lorem, ipsum dolor sit amet consectetur adipisicing elit. Doloribus, quod. Rerum
          quis molestiae, reiciendis officia nihil, fugit nisi tenetur et a error magnam
          ipsam voluptatem ut atque totam! Omnis, facere.
        </p>
      </div>
    </div>
  </section>
</template>
<style scoped>
.fullscreen {
  height: 70vh;
}
.h-screen{
  height: 100vh;
}

</style>
