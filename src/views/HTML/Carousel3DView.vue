<script setup>
import { ref } from "vue";
import { TresCanvas } from "@tresjs/core";
import { EffectComposerPmndrs, VignettePmndrs } from "@tresjs/post-processing";
import { SRGBColorSpace } from "three";
import CustomCarousel from "@/components/internals/CustomCarousel.vue";

const canvasConfig = {
  cleaColor: "#111",
  antiAlias: true,
  colorSpace: SRGBColorSpace,
};

const URL_STUB = 'https://upload.wikimedia.org/wikipedia/commons/'

const URLS = [
  'f/f0/Cyanistes_caeruleus_Oulu_20150516.JPG',
  '3/36/Cyanistes_caeruleus_Oulu_20130323.JPG',
  '2/2e/Cyanistes_caeruleus_Oulu_20170507_02.jpg',
].map(url => URL_STUB + url)

const activeCS = ref(0)
</script>
<template>
  <h1 class="text-center" >Carousel 3D {{ activeCS }} </h1>
  <div class="text-center mb-4 z-index-10">
    <v-btn color="primary" variant="text" @click="activeCS = (activeCS + 1) % URLS.length">Next</v-btn>
    <v-btn color="primary" variant="text" @click="activeCS = (activeCS - 1 + URLS.length) % URLS.length">Prev</v-btn>
  </div>
  <TresCanvas window-size id="canvasID" v-bind="canvasConfig" >
    <TresPerspectiveCamera :position="[0, 4, 18]" :look-at="[0, 0, 0]" />
    <TresAmbientLight :intensity="1" />
    <TresDirectionalLight :position="[0, 5, 0]" :intensity="2" />
    <TresFog color="#000" :near="1" :far="15" />
    <EffectComposerPmndrs>
      <VignettePmndrs :darkness="1" :offset="0.5" />
    </EffectComposerPmndrs>
    <Suspense>
      <CustomCarousel v-model="activeCS" :items="URLS" />
    </Suspense>
  </TresCanvas>
</template>
<style scoped>
.z-index-10 {
  position: relative;
  z-index: 10;
}
</style>