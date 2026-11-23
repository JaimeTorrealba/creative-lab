<script setup>
import { TresCanvas } from '@tresjs/core'
import InvertSplit from '@/components/demos/h-n/invert-split/index.vue'

const isHtmlInCanvasSupported = 'requestPaint' in HTMLCanvasElement.prototype
</script>

<template>
  <TresCanvas v-if="isHtmlInCanvasSupported" window-size clear-color="#fff">
    <TresPerspectiveCamera :position="[0, 0, 1]" />
    <Suspense>
      <InvertSplit />
    </Suspense>
  </TresCanvas>
  <div v-else class="unsupported-notice">
    <p>This demo needs the experimental HTML-in-Canvas API.</p>
    <p>Open it in Chrome Canary and enable the "HTML-in-Canvas" flag in chrome://flags.</p>
  </div>
</template>

<style scoped>
.unsupported-notice {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 100vh;
  background: #000;
  color: #fff;
  font-family: system-ui, sans-serif;
  text-align: center;
}
</style>
