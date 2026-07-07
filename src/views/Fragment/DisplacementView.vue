<script setup>
import { TresCanvas } from '@tresjs/core'
import TheExperience from '@/components/demos/fragment/displacement/index.vue'
</script>
<template>
  <TresCanvas window-size>
    <TresOrthographicCamera :position="[0, 0, 0]" :args="[-1, 1, 1, -1, -1, 1]" />
    <Suspense>
      <TheExperience />
    </Suspense>
  </TresCanvas>
</template>
