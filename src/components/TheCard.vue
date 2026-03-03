<script setup>
import { ref, toRefs, onMounted, onBeforeUnmount } from "vue";

const props = defineProps({
  data: {
    type: Object,
    required: true,
  },
});

const { data } = toRefs(props);

const imageRef = ref(null);
const shouldLoadImage = ref(false);
let imageObserver;

onMounted(() => {
  if (!("IntersectionObserver" in window)) {
    shouldLoadImage.value = true;
    return;
  }

  imageObserver = new IntersectionObserver(
    (entries) => {
      const isVisible = entries.some((entry) => entry.isIntersecting);
      if (isVisible) {
        shouldLoadImage.value = true;
        imageObserver.disconnect();
      }
    },
    { threshold: 0.01 }
  );

  if (imageRef.value) {
    imageObserver.observe(imageRef.value);
  }
});

onBeforeUnmount(() => {
  imageObserver?.disconnect();
});

const mapTagType = (tag) => {
  switch (tag) {
    case "Basics":
      return "is-white";
    case "Demos":
      return "is-success";
    case "Controls":
      return "is-info";
    case "HTML":
      return "is-info is-light";
    case "Textures_effects":
      return "is-link is-light";
    case "Shaders":
      return "is-success is-light";
    default:
      break;
  }
};

const mapTagName = (tag) => {
  return tag.replaceAll("_", " ").replaceAll(/\b\w/g, (char) => char.toUpperCase());
};

</script>
<template>
  <router-link :to="data.path">
    <div
      class="is-flex is-flex-direction-column is-clickable is-relative border_radius_top_card border_radius_bottom_card overflow"
      :style="{ '--my-content': `'${data.meta.description}'` }"
    >
      <img
      ref="imageRef"
      class="img border_radius_top_card"
      :src="shouldLoadImage ? props.data.meta.img : undefined"
      :alt="props.data.name"
      loading="lazy"
      decoding="async"
      width="300"
      height="200"
      />
      <div class="tag-wrapper">
        <div class="tags mb-0">
          <span class="tag" :class="mapTagType(data.meta.section)">{{ mapTagName(data.meta.section) }}</span>
          <span v-if="data.meta.webGPU" class="tag is-warning is-light">WebGPU</span>
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
  &:before {
    content: var(--my-content);
    position: absolute;
    top: 0;
    padding: 0.5rem;
    color: black;
    left: 0;
    z-index: 1;
    height: 100%;
    width: 100%;
    border-radius: 4px;
    transform: translate(0, 100%);
    transform-origin: center center;
    transition: 0.3s;
  }
  &:hover:before {
    background: rgba(222, 222, 222, 0.75);
    transform: translate(0);
  }
}
</style>
