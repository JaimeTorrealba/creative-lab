<script setup>
import { TresCanvas } from '@tresjs/core'
import { MapControls } from '@tresjs/cientos'
import { useWindowSize } from '@vueuse/core'
import TheExperience from '@/components/demos/shaders_demos/InstanceMeshDemo.vue'

const { width, height } = useWindowSize()

</script>
<template>
  <TresCanvas window-size clear-color="#333">
    <TresOrthographicCamera :args="[width / - 2, width / 2, height / 2, height / - 2, 1, 1000]" :position="[0, 2, 7.0]" :zoom="32" :look-at="[0,0,0]" />
    <MapControls />
    <Suspense>
      <TheExperience />
    </Suspense>
  </TresCanvas>
</template>
