<script setup>
import { watch } from "vue";
import { useLoop } from "@tresjs/core";
import { useWindowSize, watchOnce } from "@vueuse/core";
import { useTexture } from "@tresjs/cientos";
import { Vector2 } from "three";
import vertex from "./shaders/displacement/vertex.glsl";
import fragment from "./shaders/displacement/fragment.glsl";
import { Pane } from 'tweakpane';

const pane = new Pane();

const { width, height } = useWindowSize();

const { state: texture, isLoading } = useTexture('/images/stars.jpg')

watchOnce(isLoading, (value) => {
    if (!value) {
        shader.uniforms.u_texture.value = texture.value;
    }
})

const shader = {
  uniforms: {
    u_resolution: { value: new Vector2(width.value, height.value) },
    u_time: { value: 0 },
    u_texture: { value: null },
    u_mouse: { value: new Vector2(0.5, 0.9) },
    uMouseInfluence: { value: 0.1 },
  },
  vertexShader: vertex,
  fragmentShader: fragment,
};

pane.addBinding(shader.uniforms.uMouseInfluence, 'value', { min: 0, max: 1, step: 0.01, label: 'Mouse X' });


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
  <TresMesh @pointermove="(event) => handleMove(event)">
    <TresPlaneGeometry :args="[width, height, 100, 100]" />
    <TresShaderMaterial v-bind="shader" />
  </TresMesh>
</template>
