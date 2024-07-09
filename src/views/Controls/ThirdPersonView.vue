<script setup>
import { TresCanvas} from '@tresjs/core'
import { useWindowSize } from '@vueuse/core'
import TheExperience from '@/components/demos/controls/ThirdPersonDemo.vue'

const { width, height } = useWindowSize()
</script>
<template>
  <TresCanvas window-size clear-color="#111">
    <TresPerspectiveCamera :position="[0, 5, 5]" :args="[45, width / height, 0.1, 1000]" />
    <Suspense>
      <TheExperience />
    </Suspense>
  </TresCanvas>
</template>