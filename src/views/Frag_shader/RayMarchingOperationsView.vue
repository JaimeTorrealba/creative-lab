<script setup>
import { TresCanvas } from '@tresjs/core'
import TheExperience from '@/components/demos/frag_shader/RMOperationsDemo.vue'
</script>
<template>
    <TresCanvas window-size clear-color="#111">
      <TresPerspectiveCamera :position="[0, 1, 1]" />
      <Suspense>
        <TheExperience />
      </Suspense>
    </TresCanvas>
</template>
