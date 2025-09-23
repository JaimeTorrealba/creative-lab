<script setup>
import { shallowRef, computed } from "vue";
import { useLoop } from "@tresjs/core";
import { OrbitControls, TransformControls, useGLTF } from "@tresjs/cientos";
import { watchOnce } from "@vueuse/core";
import { useBasicCollision } from "../../../utils/useBasicCollision";

const greenBox = shallowRef(null);
const redSphere = shallowRef(null);
const blueBox = shallowRef(null);
const check = shallowRef(null);

const { state: _model, isLoading } = useGLTF("/models/PixelArt Medieval Sword.glb");

const modelNode = computed(() => _model.value?.scene);
watchOnce(isLoading, (loading) => {
  if (!loading) {
    check.value = useBasicCollision([greenBox, blueBox, redSphere, modelNode.value]);
  }
});

const { onBeforeRender } = useLoop();

onBeforeRender(() => {
  if (!check.value || !greenBox.value) return;
  const result = check.value.check();
  if (result.length) {
    console.log("jaime ~ onBeforeRender ~ result:", result[0].name);
    console.log("jaime ~ onBeforeRender ~ result:", result[1].name);
  }
});
</script>
<template>
  <OrbitControls make-default />
  <TransformControls :object="greenBox" />
  <TresMesh ref="greenBox" name="greenBox" :position-x="-1.5">
    <TresBoxGeometry :args="[1, 1, 1]" />
    <TresMeshBasicMaterial :color="0x00ff00" />
  </TresMesh>
  <TresMesh ref="redSphere" :position-y="10">
    <TresSphereGeometry :args="[5, 16]" />
    <TresMeshBasicMaterial :color="0xff0000" />
  </TresMesh>
  <TresMesh ref="blueBox" name="blueBox" :position="[2, -5, 0]">
    <TresBoxGeometry :args="[2, 2, 2]" />
    <TresMeshBasicMaterial :color="0x00ff" />
  </TresMesh>
  <primitive v-if="!isLoading" :position-x="3" :object="modelNode" />
  <TresAmbientLight />
</template>
