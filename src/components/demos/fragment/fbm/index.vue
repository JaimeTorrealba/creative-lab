<script setup>
import { onUnmounted, reactive } from "vue";
import { useLoop } from "@tresjs/core";
import { Pane } from "tweakpane";
import fragment from "./fragment.glsl";

const shader = {
  uniforms: {
    uTime: { value: 0 },
    uOctaves: { value: 5 },
    // uLacunarity: { value: 2.0 },
    uGain: { value: 0.5 },
    uScale: { value: 1.0 },
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: fragment,
};

const pane = new Pane({ title: "FBM" });
const options = reactive({
  uOctaves: shader.uniforms.uOctaves.value,
  uGain: shader.uniforms.uGain.value,
  uScale: shader.uniforms.uScale.value,
});
pane
  .addBinding(options, "uOctaves", {
    label: "Octaves",
    min: 1,
    max: 10,
    step: 1,
  })
  .on("change", ({ value }) => {
    shader.uniforms.uOctaves.value = value;
  });
pane
  .addBinding(options, "uGain", {
    label: "Gain",
    min: 0,
    max: 1,
    step: 0.01,
  })
  .on("change", ({ value }) => {
    shader.uniforms.uGain.value = value;
  });
pane
  .addBinding(options, "uScale", {
    label: "Scale",
    min: 0,
    max: 10,
    step: 0.1,
  })
  .on("change", ({ value }) => {
    shader.uniforms.uScale.value = value;
  });

onUnmounted(() => pane.dispose());

const { onBeforeRender } = useLoop();
onBeforeRender(({ elapsed }) => {
  shader.uniforms.uTime.value = elapsed;
});
</script>
<template>
  <TresMesh>
    <TresPlaneGeometry :args="[2, 2]" />
    <TresShaderMaterial v-bind="shader" />
  </TresMesh>
</template>
