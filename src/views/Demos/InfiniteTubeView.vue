<script setup>
import { TresCanvas } from '@tresjs/core'
import { useWindowSize } from '@vueuse/core'
import TheExperience from '@/components/demos/demos/InfiniteTubeDemo.vue'

const { width, height } = useWindowSize()
</script>
<template>
  <TresCanvas window-size clear-color="#ff4444" antialias>
    <TresFog :args="[0x222222, 0.6, 2.8]" />
    <TresPerspectiveCamera :args="[8, width / height, 0.1, 1000]" :position="[0, 0, 0.35]" />
    <Suspense>
      <TheExperience />
    </Suspense>
  </TresCanvas>
</template>
