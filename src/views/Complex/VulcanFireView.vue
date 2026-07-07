<script setup>
import { TresCanvas } from '@tresjs/core'
import TheExperience from '@/components/demos/complex/vulcan-fire/index.vue'
import { OrbitControls } from '@tresjs/cientos'
</script>
<template>
  <TresCanvas window-size clear-color="#050505">
    <TresPerspectiveCamera :position="[0, 2, 6]" />
    <OrbitControls :target="[0, 1.2, 0]" />
    <Suspense>
      <TheExperience />
    </Suspense>
  </TresCanvas>
</template>
