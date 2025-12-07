<script setup>
import { useTres } from "@tresjs/core";
import { useTexture } from "@tresjs/cientos";
import { Pane } from "tweakpane";
import vertex from "./shaders/Volumetric/vertex.glsl";
import fragment from "./shaders/Volumetric/fragment.glsl";
import { shallowRef, watch } from "vue";

const { state: texture, isLoading } = useTexture("/images/stars.jpg");
const { camera } = useTres();
const pane = new Pane();
const icoRef = shallowRef();

const radius = 1.0;

watch(
  icoRef,
  (sphere) => {
    shader.uniforms.sphereCenter.value = sphere.position;
    shader.uniforms.sphereRadius.value = radius;
  },
);

const shader = {
  uniforms: {
    time: { value: 0 },
    camPos: { value: camera.value.position },
    sigma_a: { value: 0.1 }, // absorption coefficient
    sphereRadius: { value: 1.0 }, // sphere radius
    sphereCenter: { value: [0, 0, 0] }, // sphere center in world space
  },
  vertexShader: vertex,
  fragmentShader: fragment,
  transparent: true,
};

pane.addBinding(shader.uniforms.sigma_a, "value", {
  min: 0.01,
  max: 5,
  step: 0.01,
  label: "Absorption Coefficient",
});
</script>
<template>
  <TresMesh ref="icoRef">
    <TresIcosahedronGeometry :args="[radius, 32]" />
    <TresShaderMaterial v-bind="shader" />
  </TresMesh>
  <TresMesh :position-z="-5" v-if="!isLoading">
    <TresPlaneGeometry :args="[10, 10]" />
    <TresMeshBasicMaterial color="#f7f7f7" side="DoubleSide" :map="texture" />
  </TresMesh>
</template>
