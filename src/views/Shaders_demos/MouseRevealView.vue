<script setup>
import { TresCanvas } from '@tresjs/core'
import { BasicShadowMap } from 'three'
import TheExperience from '@/components/demos/shaders_demos/MouseRevealDemo.vue'
</script>
<template>
  <TresCanvas
    window-size
    receive-shadow
    :shadows="true"
    clear-color="#333"
    :shadowMapType="BasicShadowMap"
  >
    <TresPerspectiveCamera :args="[45, 1, 0.1, 1000]" :position="[0, 0, 1]" />
    <Suspense>
      <TheExperience />
    </Suspense>
  </TresCanvas>
</template>
