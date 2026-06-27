<script setup>
import { TresCanvas } from '@tresjs/core'
import TheExperience from '@/components/demos/noc/GameOfLifeDemo.vue'
import { computed } from 'vue'
import { useWindowSize } from '@vueuse/core'

const { width, height } = useWindowSize()
const left   = computed(() => -width.value  / 2)
const right  = computed(() =>  width.value  / 2)
const top    = computed(() =>  height.value / 2)
const bottom = computed(() => -height.value / 2)
</script>

<template>
  <TresCanvas window-size clear-color="#111827">
    <TresOrthographicCamera :args="[left, right, top, bottom, 0.1, 2000]" :position="[0, 0, 600]" />
    <Suspense>
      <TheExperience />
    </Suspense>
  </TresCanvas>
</template>
