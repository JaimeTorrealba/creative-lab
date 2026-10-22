<script setup>
import { reactive, ref, onMounted, onUnmounted } from 'vue'
import { requestRTDevice, renderComputeToImage } from '@/utils/renderComputeToImage'
import { IMAGES } from './images'

const srcById = reactive({})
const samplesDoneById = reactive({})
const failedIds = reactive(new Set())
const isSupported = ref(true)
let device = null
let isUnmounted = false

const setSrcById = (id, url) => {
  if (srcById[id]) URL.revokeObjectURL(srcById[id])
  srcById[id] = url
}

const showPreviewById = (id, { url, samplesDone }) => {
  if (isUnmounted) {
    URL.revokeObjectURL(url)
    return
  }
  setSrcById(id, url)
  samplesDoneById[id] = samplesDone
}

const renderImageById = async ({ id, image }) => {
  const url = await renderComputeToImage({
    device,
    image,
    shouldStop: () => isUnmounted,
    onPreview: (preview) => showPreviewById(id, preview)
  })
  if (!url) return
  if (isUnmounted) {
    URL.revokeObjectURL(url)
    return
  }
  setSrcById(id, url)
  delete samplesDoneById[id]
}

const renderAllImages = async () => {
  for (const entry of IMAGES) {
    if (isUnmounted) return
    try {
      await renderImageById(entry)
    } catch (error) {
      if (isUnmounted) return
      console.error(error)
      failedIds.add(entry.id)
    }
  }
}

onMounted(async () => {
  device = await requestRTDevice()
  if (!device) {
    isSupported.value = false
    return
  }
  await renderAllImages()
})

onUnmounted(() => {
  isUnmounted = true
  Object.values(srcById).forEach((url) => URL.revokeObjectURL(url))
  device?.destroy()
})
</script>

<template>
  <section class="section rt-gallery">
    <h1 class="title has-text-light has-text-centered">Ray Tracing in One Weekend</h1>
    <p v-if="!isSupported" class="has-text-danger has-text-centered">
      WebGPU is not supported in this browser.
    </p>
    <div class="columns is-multiline">
      <div
        v-for="{ id, title, link, description, image } in IMAGES"
        :key="id"
        class="column is-half-tablet is-one-third-desktop"
      >
        <figure
          class="rt-figure"
          :style="{ aspectRatio: `${image.image_width} / ${image.image_height}` }"
        >
          <img v-if="srcById[id]" :src="srcById[id]" :alt="title" />
          <span v-else-if="failedIds.has(id)" class="has-text-danger">Render failed</span>
          <span v-else-if="isSupported" class="has-text-grey">Rendering…</span>
          <span v-if="samplesDoneById[id]" class="rt-badge">
            {{ samplesDoneById[id] }} / {{ image.samples_per_pixel }} samples
          </span>
        </figure>
        <h2 class="subtitle is-6 has-text-light mt-3 mb-1">Image {{ id }}: {{ title }}</h2>
        <a :href="link" target="_blank" class="is-size-7">Book section ↗</a>
        <p class="is-size-7 has-text-grey-light mt-1">{{ description }}</p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.rt-gallery {
  min-height: 100vh;
  background: #111;
  padding-top: 5rem;
}
.rt-figure {
  position: relative;
  display: grid;
  place-items: center;
  width: 100%;
  background: #1c1c1c;
}
.rt-figure img {
  width: 100%;
  height: 100%;
  image-rendering: pixelated;
}
.rt-badge {
  position: absolute;
  right: 0.25rem;
  bottom: 0.25rem;
  padding: 0 0.4rem;
  font-size: 0.7rem;
  color: #eee;
  background: rgb(0 0 0 / 60%);
}
</style>
