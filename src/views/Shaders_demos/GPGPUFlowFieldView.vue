<script setup>
import { TresCanvas } from '@tresjs/core'
import { OrbitControls } from '@tresjs/cientos'
import TheExperience from '@/components/demos/shaders_demos/GPGPUFlowFieldDemo.vue'
</script>
<template>
    <TresCanvas window-size alias clear-color="#111">
      <TresPerspectiveCamera :position="[15, 0, 0]" :look-at="[0,0,0]" />
      <OrbitControls />
      <Suspense>
        <TheExperience />
      </Suspense>
    </TresCanvas>
</template>
