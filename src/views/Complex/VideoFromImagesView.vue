<script setup>
import { ref, computed } from 'vue'
import { TresCanvas } from '@tresjs/core'
import VideoFromImagesDemo from '@/components/demos/complex/VideoFromImages.vue'

const demoRef = ref()
const isLoading = computed(() => demoRef.value?.isLoading ?? true)
const progress = computed(() => {
  if (!demoRef.value) return 0
  return Math.round((demoRef.value.loadedCount / demoRef.value.total) * 100)
})
</script>

<template>
  <TresCanvas window-size clear-color="#000">
    <TresPerspectiveCamera :position="[0, 0, 2.5]" />
    <VideoFromImagesDemo ref="demoRef" />
  </TresCanvas>
  <Teleport to="body">
    <div v-if="isLoading" class="vfi-loading-screen">{{ progress }}%</div>
  </Teleport>
</template>

<style scoped>
.vfi-loading-screen {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #000;
  color: #fff;
  font-size: 3rem;
  font-family: sans-serif;
  z-index: 100;
  pointer-events: none;
}
</style>
