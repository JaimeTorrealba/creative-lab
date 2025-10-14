<script setup>
import { TresCanvas } from '@tresjs/core'
import TheExperience from '@/components/demos/fun/CSGDemo.vue'

</script>
<template>
  <TresCanvas window-size clear-color="#111">
    <TresPerspectiveCamera :position="[0, 1, 3]" :look-at="[0, 0, 0]" />
    <Suspense>
      <TheExperience />
    </Suspense>
  </TresCanvas>
</template>