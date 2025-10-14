<script setup>
import { TresCanvas } from '@tresjs/core'
import TheExperience from '@/components/demos/fun/InfiniteBeamDemo.vue'

const gl = {
  clearColor: '#000',
  shadows: false,
  alpha: true
}
</script>
<template>
    <TresCanvas window-size v-bind="gl">
      <TresPerspectiveCamera :position="[10, 0, 30]" />
      <Suspense>
        <TheExperience />
      </Suspense>
    </TresCanvas>
</template>
