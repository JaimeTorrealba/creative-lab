<script setup>
import { TresCanvas } from '@tresjs/core'
import { OrbitControls, MouseParallax } from '@tresjs/cientos'
import {
  BasicShadowMap,
  SRGBColorSpace,
  NoToneMapping,
} from 'three'
import TheExperience from '@/components/demos/shaders/ParticlesRingDemo.vue'

const gl = {
  clearColor: '#111',
  shadows: true,
  alpha: false,
  shadowMapType: BasicShadowMap,
  outputColorSpace: SRGBColorSpace,
  toneMapping: NoToneMapping,
}


</script>
<template>
  <TresCanvas v-bind="gl">
    <TresPerspectiveCamera :position="[0, 0, 7.5]" />
    <MouseParallax />
    <OrbitControls />
    <Suspense>
      <TheExperience />
    </Suspense>
  </TresCanvas>
</template>