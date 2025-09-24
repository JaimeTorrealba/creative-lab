<script setup>
import { shallowRef } from "vue";
import { useLoop } from "@tresjs/core";
import { Reflector, MeshWobbleMaterial, useTexture } from "@tresjs/cientos";
import vertex from "./shaders/waterReflector/vertex.glsl";
import fragment from "./shaders/waterReflector/fragment.glsl";
import { RepeatWrapping } from "three";
import { watchOnce } from "@vueuse/core";

const { state:texture, isLoading } = useTexture("/textures/waterdudv.jpg");

watchOnce(isLoading, (value) => {
  if (!value) {
    texture.value.wrapS = texture.value.wrapT = RepeatWrapping;
    // customShader.uniforms.tDudv.value = texture.value;
  }
});

const mirrorRef = shallowRef();
// const customShader = {
//   uniforms: {
//     color: { value: null },
//     tDiffuse: { value: null },
//     textureMatrix: { value: null },
//     tDudv: { value: null },
//     time: { value: 0 },
//   },
//   vertexShader: vertex,
//   fragmentShader: fragment,
// };

const { onBeforeRender } = useLoop();
onBeforeRender(({ elapsed }) => {
  if (mirrorRef.value) {
    // customShader.uniforms.time.value = elapsed;
  }
});
</script>
<template>
  <TresMesh :position="[4, 0, 0]">
    <TresBoxGeometry :args="[1, 1, 1]" />
    <TresMeshStandardMaterial :color="0x00ff" />
  </TresMesh>
  <TresMesh :position="[-4, 0, 0]">
    <TresSphereGeometry :args="[1, 16]" />
    <TresMeshStandardMaterial :color="0xff0000" />
  </TresMesh>
  <TresMesh>
    <TresTorusGeometry />
    <MeshWobbleMaterial color="orange" :speed="1" :factor="2" />
  </TresMesh>
  <!-- :shader="customShader" -->
  <Reflector />
    <!-- ref="mirrorRef"
    :rotation="[-Math.PI * 0.5, 0, 0]"
    :position="[0, -2, 0]"
    color="#222"
  >
    <TresCircleGeometry :args="[10, 16]" />
  </Reflector> -->
</template>
