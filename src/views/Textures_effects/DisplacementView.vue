<script setup>
import { TresCanvas } from '@tresjs/core'
import TheExperience from '@/components/demos/Textures_effects/DisplacementDemo.vue'

</script>
<template>
  <TresCanvas window-size>
<TresOrthographicCamera :position="[0,0,0]" :args="[-1, 1, 1, -1, -1, 1]" />
    <Suspense>
      <TheExperience />
    </Suspense>
  </TresCanvas>
</template>
