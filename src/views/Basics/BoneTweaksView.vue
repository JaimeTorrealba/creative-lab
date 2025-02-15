<script setup>
import { TresCanvas } from '@tresjs/core'
import { OrbitControls } from '@tresjs/cientos'
import TheExperience from '@/components/demos/basics/BoneTweaksDemo.vue'

// TODO: Fix this

</script>
<template>
  <TresCanvas window-size clear-color="#333">
    <TresPerspectiveCamera
      :position="[0, 1, 2.5]"
      :look-at="[0, 0, 0]"
    />
    <OrbitControls />
    <Suspense>
      <TheExperience />
    </Suspense>
  </TresCanvas>
</template>
