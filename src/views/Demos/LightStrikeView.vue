<script setup>
import { TresCanvas } from '@tresjs/core'
import { OrbitControls, Stars } from '@tresjs/cientos'
import TheExperience from '@/components/demos/demos/LightStrikeDemo.vue'

</script>
<template>
  <TresCanvas window-size anti-alias clear-color="#111" >
    <TresPerspectiveCamera :position="[0, 3.75, 20]" :look-at="[0,0,0]" />
    <OrbitControls make-default />
    <Stars />
    <Suspense>
      <TheExperience />
    </Suspense>
  </TresCanvas>
</template>