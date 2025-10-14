<script setup>
import { TresCanvas } from '@tresjs/core'
import { OrbitControls } from '@tresjs/cientos'
import TheExperience from '@/components/demos/fun/GlassDemo.vue'

</script>
<template>
  <TresCanvas window-size clear-color="#F7F7F7" >
    <TresPerspectiveCamera :position="[0, 0, 3]" />
    <OrbitControls />
    <Suspense>
      <TheExperience />
    </Suspense>
  </TresCanvas>
</template>