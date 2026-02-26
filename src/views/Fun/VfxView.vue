<script setup>
import { TresCanvas } from "@tresjs/core";
import { OrbitControls } from "@tresjs/cientos";
import TheExperience from "@/components/demos/fun/VfxDemo.vue";
import { VFXParticles } from 'tres-vfx'
</script>
<template>
    <TresCanvas window-size clear-color="#111">
      <TresPerspectiveCamera :position="[0, 0, 15]" />
      <OrbitControls />
      <VFXParticles debug />
      <Suspense>
        <TheExperience />
      </Suspense>
    </TresCanvas>
</template>
