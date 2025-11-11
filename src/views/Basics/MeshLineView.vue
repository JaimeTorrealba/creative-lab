<script setup>
import { TresCanvas } from '@tresjs/core'
import TheExperience from '@/components/demos/fun/MeshLineDemo.vue'

</script>
<template>
  <TresCanvas window-size clear-color="#333" >
    <TresPerspectiveCamera :position="[-1.5, 0, 1.5]" :look-at="[0, 0, 0]" />
    <Suspense>
      <TheExperience />
    </Suspense>
  </TresCanvas>
</template>