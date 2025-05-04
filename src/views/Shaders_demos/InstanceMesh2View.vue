<script setup>
import { TresCanvas } from '@tresjs/core'
import { MapControls } from '@tresjs/cientos'
// import { useWindowSize } from '@vueuse/core'
import TheExperience from '@/components/demos/shaders_demos/InstanceMeshDemo2.vue'

// const { width, height } = useWindowSize()

</script>
<template>
  <TresCanvas window-size clear-color="#333">
    <TresPerspectiveCamera :position="[0, 5, -3]" :look-at="[0, 0, 0]" />
    <MapControls />
    <Suspense>
      <TheExperience />
    </Suspense>
  </TresCanvas>
</template>
