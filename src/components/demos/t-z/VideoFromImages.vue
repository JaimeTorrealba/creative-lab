<script setup>
import { ref, shallowRef, watch } from 'vue'
import { useLoop } from '@tresjs/core'
import { ScrollControls } from '@tresjs/cientos'
import { TextureLoader, SRGBColorSpace } from 'three'
import { useWindowSize } from '@vueuse/core'

const images = Array.from(
  { length: 300 },
  (_, i) => `/images/video_sequence/${String(i + 1).padStart(4, '0')}.jpg`
)

const progress = ref(0)
const meshRef = shallowRef()
const materialRef = shallowRef()
const loadedCount = ref(0)
const isLoading = ref(true)

const { width, height } = useWindowSize()

const loader = new TextureLoader()
const textures = images.map((path) => {
  const t = loader.load(path, () => {
    loadedCount.value++
    if (loadedCount.value === images.length) isLoading.value = false
  })
  t.colorSpace = SRGBColorSpace
  return t
})

const VIEW_H = 2 * 2.5 * Math.tan((75 / 2) * (Math.PI / 180))

function fitToViewport() {
  if (!meshRef.value) return
  meshRef.value.scale.set(VIEW_H * (width.value / height.value), VIEW_H, 1)
}

watch(meshRef, (mesh) => {
  if (mesh) fitToViewport()
})
watch([width, height], fitToViewport)

const { onBeforeRender } = useLoop()
onBeforeRender(() => {
  if (!textures.length || !materialRef.value) return
  const index = Math.min(textures.length - 1, Math.floor(progress.value * textures.length))
  materialRef.value.map = textures[index]
  materialRef.value.needsUpdate = true
})

defineExpose({ isLoading, loadedCount, total: images.length })
</script>

<template>
  <ScrollControls :distance="0" v-model="progress" />
  <TresMesh ref="meshRef">
    <TresPlaneGeometry :args="[1, 1]" />
    <TresMeshBasicMaterial ref="materialRef" />
  </TresMesh>
</template>
