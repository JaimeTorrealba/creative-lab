<script setup>
import { ACESFilmicToneMapping } from 'three'
import { TresCanvas } from '@tresjs/core'
import TheExperience from '@/components/demos/t-z/underwater-hair/index.vue'
</script>

<template>
  <TresCanvas window-size clear-color="#04141f" :tone-mapping="ACESFilmicToneMapping">
    <TresPerspectiveCamera :position="[0, 0.8, 9]" :fov="45" />
    <Suspense>
      <TheExperience />
    </Suspense>
  </TresCanvas>
</template>
