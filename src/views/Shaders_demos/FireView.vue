<script setup>
import { TresCanvas } from '@tresjs/core'
import TheExperience from '@/components/demos/shaders_demos/FireDemo.vue'

</script>
<template>
  <TresCanvas window-size clear-color="#111">
    <TresPerspectiveCamera :position="[0, 0, 3]"  />
    <Suspense>
      <TheExperience />
    </Suspense>
  </TresCanvas>
</template>
