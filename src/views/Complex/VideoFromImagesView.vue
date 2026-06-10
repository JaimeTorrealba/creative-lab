<script setup>
import { TresCanvas } from '@tresjs/core'
import VideoFromImagesDemo from '@/components/demos/complex/VideoFromImagesDemo.vue'
</script>

<template>
  <TresCanvas window-size clear-color="#000">
    <TresPerspectiveCamera :position="[0, 0, 2.5]" />
    <VideoFromImagesDemo />
  </TresCanvas>
</template>
