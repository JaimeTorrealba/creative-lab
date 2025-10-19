<script setup>
import { reactive } from 'vue';
import { useTexture } from "@tresjs/cientos";
import vertex from "./shaders/Fake3DImage/vertex.glsl";
import fragment from "./shaders/Fake3DImage/fragment.glsl";
import { Vector2 } from "three";
import { watchOnce, useWindowSize } from "@vueuse/core";
import { Pane } from 'tweakpane';

const pane = new Pane();

const options = reactive({
  mouseEffect: 0.05,
});

pane.addBinding(options, 'mouseEffect', { min: 0, max: 0.1, step: 0.001 });

const { state: texture, isLoading } = useTexture(
  "/textures/gaea/texture.png"
);
const { state: depth, isLoading: isLoadingDepth } = useTexture(
  "/textures/gaea/height.png"
);

watchOnce(isLoading, (value) => {
  if (!value) {
    shader.uniforms.uTexture.value = texture.value;
    texture.value.wrapS = texture.value.wrapT = 1000;
  }
});
watchOnce(isLoadingDepth, (value) => {
  if (!value) {
    shader.uniforms.uDepth.value = depth.value;
    depth.value.wrapS = depth.value.wrapT = 1000;
  }
});

const shader = {
  vertexShader: vertex,
  fragmentShader: fragment,
  uniforms: {
    uTexture: { value: null },
    uDepth: { value: null },
    uMouse: { value: new Vector2(0, 0) },
  },
};

const { width, height } = useWindowSize();

const handleMove = (e) => {
  if (width.value < 768) return;
  shader.uniforms.uMouse.value = new Vector2(
    e.x / width.value * options.mouseEffect,
    e.y / height.value * options.mouseEffect
  );
};
</script>
<template>
  <TresMesh @pointermove="(event) => handleMove(event)">
    <TresPlaneGeometry :args="[2, 2]" />
    <TresShaderMaterial v-bind="shader" />
  </TresMesh>
</template>
