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
        class="tooltip-styles notification is-info is-light pr-6"
      >
      <button v-show="clickOutside" @click="onClose" class="delete"></button>
        {{ text }}
      </div>
    </transition>
  </div>
</template>

<script setup>
defineProps({
  text: { type: String, required: true },
  show: { type: Boolean, default: false },
  anchor: { type: String, default: "top" },
  clickOutside: { type: Boolean, default: false },
});

const emit = defineEmits(["close"]);

const onClose = () => {
    console.log("sss");
  emit("close");
};


</script>
<style scoped>
.trigger {
  anchor-name: --trigger;
}
.tooltip-styles {
  position: absolute;
  text-align: center;
  padding: 8px 12px;
  z-index: 9999;
  text-wrap: v-bind("clickOutside ? 'wrap' : 'nowrap'");
  position-anchor: --trigger;
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
