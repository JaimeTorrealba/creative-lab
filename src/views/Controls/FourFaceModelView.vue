
<script setup>
import { TresCanvas } from '@tresjs/core'
import TheExperience from '@/components/demos/controls/FourFaceModelDemo.vue'
</script>
<template>
  <TresCanvas window-size clear-color="#333" >
    <TresPerspectiveCamera :position="[0, 0, 15]"  />
    <Suspense>
      <TheExperience />
    </Suspense>
  </TresCanvas>
</template>