<script setup>
import { TresCanvas } from '@tresjs/core'
import { OrbitControls } from '@tresjs/cientos'
import TheExperience from '@/components/demos/shaders/CoffeeCupDemo.vue'

</script>
<template>
  <TresCanvas window-size antialias clear-color="#111">
    <TresPerspectiveCamera :position="[8, 10, 12]" :fov="45" :aspect="1" :near="0.1" :far="1000" />
    <OrbitControls />
    <Suspense>
       <TheExperience />
     </Suspense>
  </TresCanvas>
</template>