<script setup>
import { watch } from "vue";
import { useLoop } from "@tresjs/core";
import { useWindowSize } from "@vueuse/core";
import { useTexture } from "@tresjs/core";
import { Vector2 } from "three";
import vertex from "./shaders/displacement/vertex.glsl";
import fragment from "./shaders/displacement/fragment.glsl";

const { width, height } = useWindowSize();

const { map } = await useTexture({
  map: "/images/stars.jpg",
});

const shader = {
  uniforms: {
    u_resolution: { value: new Vector2(width.value, height.value) },
    u_time: { value: 0 },
    u_texture: { value: map },
    u_mouse: { value: new Vector2(0.5, 0.9) },
  },
  vertexShader: vertex,
  fragmentShader: fragment,
};

//resize
watch(width, () => {
  shader.uniforms.u_resolution.value = new Vector2(width.value, height.value);
});

const handleMove = (e) => {
  if (width.value < 768) return;
  shader.uniforms.u_mouse.value = new Vector2(e.x / width.value, (e.y / height.value) * -1 + 1);
};

const { onBeforeRender } = useLoop();

onBeforeRender(({ elapsed }) => {
  shader.uniforms.u_time.value = elapsed * 0.1;
});
</script>
<template>
  <TresMesh @pointer-move="(event) => handleMove(event)">
    <TresPlaneGeometry :args="[width, height, 100, 100]" />
    <TresShaderMaterial v-bind="shader" />
  </TresMesh>
</template>
