<script setup>
import { TresCanvas } from "@tresjs/core";
import { OrbitControls, Environment, Sky } from "@tresjs/cientos";
import TheExperience from "@/components/demos/fun/CheapWaterDemo.vue";
</script>
<template>
    <TresCanvas window-size clear-color="#111">
      <TresPerspectiveCamera :position="[0, 5, 25]" />
      <OrbitControls />
      <Suspense>
        <TheExperience />
      </Suspense>
      <TresAmbientLight :intensity="10.5" />
      <TresDirectionalLight :position="[15, 0, 15]" :intensity="1" />
      <Sky />
      <Suspense>
        <Environment preset="city" />
      </Suspense>
    </TresCanvas>
</template>
