<script setup>
import { TresCanvas } from '@tresjs/core'
import TheExperience from '@/components/demos/fragment/interior-plane/index.vue'
</script>

<template>
  <TresCanvas window-size clear-color="#111">
    <TresPerspectiveCamera :position="[0, 0, 2]" :fov="60" />
    <Suspense>
      <TheExperience />
    </Suspense>
  </TresCanvas>
</template>
