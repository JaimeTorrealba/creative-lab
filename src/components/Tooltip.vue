<template>
  <div class="relative inline-block">
    <!-- Trigger slot -->
    <div class="trigger">
      <slot />
    </div>

    <!-- Tooltip -->
    <transition>
      <div
        v-if="show"
        ref="tooltipRef"
        class="tooltip-styles notification is-info is-light"
      >
        {{ text }}
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { onClickOutside } from '@vueuse/core';

const props = defineProps({
  text: { type: String, required: true },
  show: { type: Boolean, default: false },
  anchor: { type: String, default: "top" },
  clickOutside: { type: Boolean, default: false },
});

const emit = defineEmits(["close"]);
const tooltipRef = ref(null);

// Generate unique anchor ID for each tooltip instance
const anchorId = `--trigger-${Math.random().toString(36).substr(2, 9)}`;

const onClose = () => {
  emit("close");
};

onClickOutside(tooltipRef, onClose);


</script>
<style scoped>
.trigger {
  anchor-name: v-bind(anchorId);
}
.tooltip-styles {
  position: absolute;
  text-align: center;
  padding: 8px 12px;
  min-width: 25vw;
  z-index: 9999;
  text-wrap: v-bind("clickOutside ? 'wrap' : 'nowrap'");
  position-anchor: v-bind(anchorId);
  position-area: v-bind(anchor);
}

.v-enter-active,
.v-leave-active {
  transition: opacity 0.25s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}
</style>
