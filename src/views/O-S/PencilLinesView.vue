<script setup>
import { TresCanvas } from '@tresjs/core'
import { OrbitControls } from '@tresjs/cientos'
import { CineonToneMapping } from 'three'
import TheExperience from '@/components/demos/o-s/pencil-lines/index.vue'
</script>

<template>
  <TresCanvas
    window-size
    shadows
    clear-color="#dddddd"
    :tone-mapping="CineonToneMapping"
    :tone-mapping-exposure="1.75"
  >
    <TresPerspectiveCamera :position="[0, 2, 5]" :fov="75" :near="0.1" :far="1000" />
    <OrbitControls />
    <Suspense>
      <TheExperience />
    </Suspense>
  </TresCanvas>
</template>
