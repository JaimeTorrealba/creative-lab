<script setup>
import { TresCanvas } from '@tresjs/core'
import { OrbitControls } from '@tresjs/cientos'
import TheExperience from '@/components/demos/d-g/divine-fire/index.vue'
</script>
<template>
  <TresCanvas window-size clear-color="#0b0806">
    <TresPerspectiveCamera :position="[0, 3.2, 6.5]" />
    <OrbitControls :target="[0, 0.7, 0]" />
    <Suspense>
      <TheExperience />
    </Suspense>
  </TresCanvas>
</template>
