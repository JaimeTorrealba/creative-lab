<script setup>
import { TresCanvas } from '@tresjs/core'
import { OrbitControls } from '@tresjs/cientos'
import TheExperience from '@/components/demos/shaders/CausticsDemo.vue'

</script>
<template>
  <TresCanvas window-size clear-color="#333">
    <TresPerspectiveCamera :position="[0, 7, 7]" :look-at="[0,0,0]"  />
    <OrbitControls />
    <Suspense>
      <TheExperience />
    </Suspense>
  </TresCanvas>
</template>
