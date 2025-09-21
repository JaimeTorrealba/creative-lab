<script setup>
import { TresCanvas } from '@tresjs/core'
import TheExperience from '@/components/demos/complex/FireDemo.vue'
import { OrbitControls } from '@tresjs/cientos'
</script>
<template>
  <TresCanvas window-size clear-color="#111">
    <TresPerspectiveCamera :position="[0, 0, 3]"  />
    <OrbitControls />
    <Suspense>
      <TheExperience />
    </Suspense>
  </TresCanvas>
</template>
