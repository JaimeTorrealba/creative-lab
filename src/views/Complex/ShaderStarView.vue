<script setup lang="ts">
import { TresCanvas } from '@tresjs/core'
import { MouseParallax, Stars } from '@tresjs/cientos'
import { BasicShadowMap, NoToneMapping } from 'three'
import TheExperience from '@/components/demos/shaders_demos/ShaderStarDemo.vue'

const gl = {
  clearColor: '#111',
  shadows: false,
  alpha: false,
  shadowMapType: BasicShadowMap,
  toneMapping: NoToneMapping,
}
</script>

<template>
  <TresCanvas v-bind="gl">
    <TresPerspectiveCamera :position="[0, 0, 5]" :fov="75" :near="0.1" :far="1000" />
    <MouseParallax :factor="1" />
    <Stars />
    <Suspense>
      <TheExperience />
    </Suspense>
    <TresAmbientLight :intensity="1" />
  </TresCanvas>
</template>
