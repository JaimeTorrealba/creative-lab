<script setup>
import { TresCanvas } from '@tresjs/core'
import TheExperience from '@/components/demos/frag_shader/TemplateDemo.vue'
</script>
<template>
  <TresCanvas window-size clear-color="#111">
    <TresPerspectiveCamera :position="[0, 0, 5]" />
    <Suspense>
      <TheExperience />
    </Suspense>
  </TresCanvas>
</template>
