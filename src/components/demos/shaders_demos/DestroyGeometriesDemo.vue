<script setup>
import { shallowRef, watch } from "vue";
import { SphereGeometry, BufferAttribute } from "three";
import { TessellateModifier } from "three/addons/modifiers/TessellateModifier.js";
import fragment from "@/components/shaders/destroyGeos/fragment.glsl";
import vertex from "@/components/shaders/destroyGeos/vertex.glsl";
import { Pane } from "tweakpane";

const sphereRef = shallowRef();
const tessellatedSphereRef = shallowRef();
const sphereGeo = new SphereGeometry(1, 20, 20).toNonIndexed();

watch(sphereRef, (value) => {
  value.geometry.dispose();
  value.geometry = sphereGeo;
  const lenSphere = value.geometry.attributes.position.count;

  let sphereRandoms = new Float32Array(lenSphere * 3);
  for (let i = 0; i < lenSphere; i += 3) {
    let r = Math.random();
    sphereRandoms[i] = r;
    sphereRandoms[i + 1] = r;
    sphereRandoms[i + 2] = r;
  }
  value.geometry.setAttribute("aRandom", new BufferAttribute(sphereRandoms, 1));
});
watch(tessellatedSphereRef, (value) => {
  value.geometry.dispose();
  const tessellateModifier = new TessellateModifier(0.1, 24);
  const tesselatedGeometry = tessellateModifier.modify(sphereGeo);
  value.geometry = tesselatedGeometry;
  const lenSphere = value.geometry.attributes.position.count;

  let sphereRandoms = new Float32Array(lenSphere * 3);
  for (let i = 0; i < lenSphere; i += 3) {
    let r = Math.random();
    sphereRandoms[i] = r;
    sphereRandoms[i + 1] = r;
    sphereRandoms[i + 2] = r;
  }
  value.geometry.setAttribute("aRandom", new BufferAttribute(sphereRandoms, 1));
});

const sphereShader = {
  vertexShader: vertex,
  fragmentShader: fragment,
  uniforms: {
    uProgress: { value: 0 },
  },
  transparent: true,
};

const tessellatedSphereShader = {
  vertexShader: vertex,
  fragmentShader: fragment,
  uniforms: {
    uProgress: { value: 0 },
  },
  transparent: true,
};

const pane = new Pane();

pane.addBinding(sphereShader.uniforms.uProgress, "value", {
  min: 0,
  max: 1,
  step: 0.01,
  label: "Sphere progress",
});

pane.addBinding(tessellatedSphereShader.uniforms.uProgress, "value", {
  min: 0,
  max: 1,
  step: 0.01,
  label: "Tessellated Sphere progress",
});


</script>
<template>
  <TresMesh ref="sphereRef" :position="[2, 0, 0]">
    <TresIcosahedronGeometry />
    <TresShaderMaterial v-bind="sphereShader" />
  </TresMesh>
  <TresMesh ref="tessellatedSphereRef" :position="[-2, 0, 0]">
    <TresIcosahedronGeometry />
    <TresShaderMaterial v-bind="tessellatedSphereShader" />
  </TresMesh>
</template>
