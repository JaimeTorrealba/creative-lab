<script setup>
import { DragControls } from "three/examples/jsm/controls/DragControls";
import { onUnmounted, ref, watchEffect } from "vue";
import { useTres } from "@tresjs/core";
import { useEventListener } from "@vueuse/core";

// THIS IS TEMPORAL SINCE CIENTOS DOES NOT EXPORT IT YET

defineProps({
  mode: {
    type: String,
    default: "translate",
  },
  enabled: {
    type: Boolean,
    default: true,
  },
});
const emit = defineEmits(["dragstart", "drag", "dragend", "hoveron", "hoveroff"]);
const { camera, renderer, extend } = useTres();
const controlsRef = ref(null);
extend({ DragControls });
watchEffect(() => {
  if (controlsRef.value) {
    addEventListeners();
  }
});
function addEventListeners() {
  useEventListener(controlsRef.value, "dragstart", () =>
    emit("dragstart", controlsRef.value)
  );
  useEventListener(controlsRef.value, "drag", () => emit("drag", controlsRef.value));
  useEventListener(controlsRef.value, "dragend", () =>
    emit("dragend", controlsRef.value)
  );
  useEventListener(controlsRef.value, "hoveron", () =>
    emit("hoveron", controlsRef.value)
  );
  useEventListener(controlsRef.value, "hoveroff", () =>
    emit("hoveroff", controlsRef.value)
  );
}
onUnmounted(() => {
  if (controlsRef.value) {
    controlsRef.value.dispose();
  }
});
defineExpose({ value: controlsRef });
</script>

<template>
  <TresDragControls
    v-if="(camera || activeCamera) && (domElement || renderer)"
    ref="controlsRef"
    :objects="objects"
    :camera="camera || activeCamera"
    :mode="mode"
    :enabled="enabled"
    :args="[objects, camera || activeCamera, domElement || renderer.domElement]"
  />
</template>
