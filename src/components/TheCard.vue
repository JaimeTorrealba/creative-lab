<script setup>
defineProps({
  data: {
    type: Object,
    required: true,
  },
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
    case "Shaders_demos":
      return "is-success is-light";
    default:
      break;
  }
};

</script>
<template>
  <router-link :to="data.path">
    <div
      class="is-flex is-flex-direction-column is-clickable is-relative border_radius_top_card border_radius_bottom_card "
      :style="{ '--my-content': `'${data.meta.description}'` }"
    >
      <img
      class="img border_radius_top_card "
      :src="data.meta.img"
      :alt="data.name"
      width="300"
      />
      <div class="tag-wrapper">
        <span class="tag" :class="mapTagType(data.meta.section)">{{ data.meta.section }}</span>
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
