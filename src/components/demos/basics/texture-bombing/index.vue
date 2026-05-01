<script setup>
import { reactive, onMounted, onUnmounted, watch } from "vue";
import { useTexture } from "@tresjs/cientos";
import { Pane } from "tweakpane";
import { RepeatWrapping } from "three";
import fragmentShader from "./fragment.glsl";

// ── swap this path once you have the texture ──
const { state, isLoading } = useTexture(["/textures/matcap example.png"]);

watch(isLoading, (_isLoading) => {
  if (!_isLoading) {
    state.value.wrapS = RepeatWrapping;
    state.value.wrapT = RepeatWrapping;
    uniforms.uTexture.value = state.value;
  }
});

const uniforms = reactive({
  uTexture: { value: state.value },
  uCells: { value: 6.0 },
  uScale: { value: 0.6 },
  uDensity: { value: 0.6 },
  uRotation: { value: 1.0 },
});

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

let pane;
onMounted(() => {
  pane = new Pane({ title: "Texture Bombing" });
  pane.addBinding(uniforms.uCells, "value", {
    label: "cells",
    min: 1,
    max: 20,
    step: 0.5,
  });
  pane.addBinding(uniforms.uScale, "value", {
    label: "stamp size",
    min: 0.1,
    max: 1.0,
    step: 0.01,
  });
  pane.addBinding(uniforms.uDensity, "value", {
    label: "density",
    min: 0,
    max: 1.0,
    step: 0.01,
  });
  pane.addBinding(uniforms.uRotation, "value", {
    label: "rotation",
    min: 0,
    max: 1.0,
    step: 0.01,
  });
});

onUnmounted(() => pane?.dispose());
</script>

<template>
  <TresMesh :rotation="[-Math.PI / 2, 0, 0]">
    <TresBoxGeometry :args="[2, 2, 2]" />
    <TresShaderMaterial
      :vertex-shader="vertexShader"
      :fragment-shader="fragmentShader"
      :uniforms="uniforms"
      transparent
    />
  </TresMesh>
  <TresAmbientLight :intensity="1" />
</template>
