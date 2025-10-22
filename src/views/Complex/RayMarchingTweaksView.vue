<script setup>
import { TresCanvas } from '@tresjs/core'
import TheExperience from '@/components/demos/complex/RMTweaksDemo.vue'
</script>
<template>
    <TresCanvas window-size clear-color="#111">
    <TresOrthographicCamera :position="[0, 0, 0]" :args="[-1, 1, 1, -1, -1, 1]" />
      <Suspense>
        <TheExperience />
      </Suspense>
    </TresCanvas>
</template>
