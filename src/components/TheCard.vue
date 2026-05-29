<script setup>
import { ref, toRefs, onMounted, onBeforeUnmount, computed } from "vue";

const props = defineProps({
  data: {
    type: Object,
    required: true,
  },
});

const { data } = toRefs(props);

const mediaRef = ref(null);
const shouldLoad = ref(false);
const mediaSrc = ref(undefined);
let observer;

const isVideo = computed(() => props.data.meta.img?.endsWith('.mp4'));

onMounted(() => {
  if (!("IntersectionObserver" in window)) {
    shouldLoad.value = true;
    mediaSrc.value = props.data.meta.img;
    return;
  }

  observer = new IntersectionObserver(
    (entries) => {
      const isVisible = entries.some((entry) => entry.isIntersecting);
      if (isVisible) {
        shouldLoad.value = true;
        mediaSrc.value = props.data.meta.img;
        observer.disconnect();
      }
    },
    { threshold: 0.01 }
  );

  if (mediaRef.value) {
    observer.observe(mediaRef.value);
  }
});

onBeforeUnmount(() => {
  observer?.disconnect();
});


</script>
<template>
  <router-link :to="data.path">
    <div
      class="is-flex is-flex-direction-column is-clickable is-relative border_radius_top_card border_radius_bottom_card overflow"
    >
      <video
        v-if="isVideo"
        ref="mediaRef"
        class="img border_radius_top_card"
        :src="shouldLoad ? mediaSrc : undefined"
        autoplay
        loop
        muted
        playsinline
        width="300"
        height="200"
      />
      <img
        v-else
        ref="mediaRef"
        class="img border_radius_top_card"
        :src="shouldLoad ? mediaSrc : undefined"
        :alt="props.data.name"
        loading="lazy"
        decoding="async"
        width="300"
        height="200"
      />
      <div class="tag-wrapper">
        <div class="tags mb-0">
          <span v-for="tag in data.meta.tags" :key="tag" class="tag is-info is-light">{{ tag }}</span>
        </div>
      </div>
      <div
        class="has-text-centered has-background-light has-text-black-ter py-1 has-text-weight-medium border_radius_bottom_card"
      >
        {{ data.name }}
      </div>
    </div>
  </router-link>
</template>
<style scoped>
.img {
  width: 100%;
}

.border_radius_top_card {
  border-top-right-radius: 8px;
  border-top-left-radius: 8px;
}
.border_radius_bottom_card {
  border-bottom-right-radius: 8px;
  border-bottom-left-radius: 8px;
}

.tag-wrapper {
  position: absolute;
  bottom: 32px;
  left: 0;
  right: 0;
  padding: 0.5rem;
  display: flex;
}

.overflow:first-child {
  position: relative;
  overflow: hidden;
}
</style>
