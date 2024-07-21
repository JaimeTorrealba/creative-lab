<script setup>
import { TresCanvas } from '@tresjs/core'
import { OrbitControls, Stars } from '@tresjs/cientos'
import TheExperience from '@/components/demos/demos/FurDemo.vue'

// TODO: Fix this

</script>
<template>
  <TresCanvas window-size clear-color="#111">
    <TresPerspectiveCamera
      :position="[0, 3, 7.5]"
      :look-at="[0, 0, 0]"
    />
    <OrbitControls />
    <Stars />
    <Suspense>
      <TheExperience />
    </Suspense>
  </TresCanvas>
</template>
