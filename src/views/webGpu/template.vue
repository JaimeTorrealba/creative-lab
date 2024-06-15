<script setup>
import { TresCanvas } from '@tresjs/core'
import { OrbitControls } from '@tresjs/cientos'
import Template from '@/components/demos/webgpu/template.vue'

</script>
<template>
  <TresCanvas>
    <Suspense>

      <Template />
    </Suspense>
  </TresCanvas>
</template>