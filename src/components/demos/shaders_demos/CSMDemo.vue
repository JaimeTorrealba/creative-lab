<script setup>
import { shallowRef } from "vue";
import { useLoop } from "@tresjs/core";
import { useTexture, Environment, CustomShaderMaterial } from "@tresjs/cientos";
import { EquirectangularReflectionMapping, MeshPhysicalMaterial } from "three";
import { HDRLoader } from "three/examples/jsm/loaders/HDRLoader";
import vertex from "./shaders/drop/vertex.glsl";

const { state: normalMap } = useTexture("/textures/glassMorphismNormal.jpg");

const hdrEquirect = await new HDRLoader().load(
  "/textures/empty_warehouse_01_2k.hdr",
  () => {
    hdrEquirect.mapping = EquirectangularReflectionMapping;
  }
);

const dropRef = shallowRef();

const waterMaterial = {
  baseMaterial: MeshPhysicalMaterial,
  transmission: 1,
  thickness: 0.5,
  roughness: 0,
  envMap: hdrEquirect,
  clearcoatNormalMap: normalMap,
  envMapIntensity: 1.5,
  vertexShader: vertex,
  uniforms: {
    uTime: { value: 0 },
  },
};

const { onBeforeRender } = useLoop();

onBeforeRender(({ delta }) => {
  if (dropRef.value) {
    dropRef.value.material.uniforms.uTime.value += delta;
  }
});
</script>
<template>
  <Environment files="/textures/empty_warehouse_01_2k.hdr" :background="true" />
  <TresMesh ref="dropRef" :position="[-0, 0, 0]" >
    <TresIcosahedronGeometry :args="[1, 10]" />
    <CustomShaderMaterial v-bind="waterMaterial" />
  </TresMesh>
</template>
