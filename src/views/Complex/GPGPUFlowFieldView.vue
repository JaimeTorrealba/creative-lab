<script setup>
import { TresCanvas } from '@tresjs/core'
import { OrbitControls } from '@tresjs/cientos'
import TheExperience from '@/components/demos/complex/GPGPUFlowFieldDemo.vue'
</script>
<template>
    <TresCanvas window-size alias clear-color="#111">
      <TresPerspectiveCamera :position="[0, 85, 85]"  />
      <OrbitControls />
      <Suspense>
        <TheExperience />
      </Suspense>
    </TresCanvas>
</template>
