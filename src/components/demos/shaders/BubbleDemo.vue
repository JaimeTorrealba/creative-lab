<script setup>
import { useLoop, useTres } from "@tresjs/core";
import { CubeCamera, Environment } from "@tresjs/cientos";
import vertex from "./shaders/fresnel/vertex.glsl";
import fragment from "./shaders/fresnel/fragment.glsl";
import { shallowRef, watch } from "vue";

const { renderer, scene } = useTres();

const shader = {
  vertexShader: vertex,
  fragmentShader: fragment,
  uniforms: {
    mRefractionRatio: { value: 1.02 },
    mFresnelBias: { value: 0.1 },
    mFresnelPower: { value: 2.0 },
    mFresnelScale: { value: 1.0 },
    tCube: { value: null }, //  textureCube TODO this }
  },
};

const cubeCameraRef = shallowRef();
const bubbleRef = shallowRef();

watch(cubeCameraRef, (cubeCamera) => {
  if (cubeCamera) {
    console.log("jaime ~ cubeCamera:", cubeCamera.camera);
    shader.uniforms.tCube.value = cubeCamera.camera.renderTarget.texture;
  }
});

const { onBeforeRender } = useLoop()

onBeforeRender(() => {
  bubbleRef.value.visible = false;
  cubeCameraRef.value.update(renderer, scene.value);
  bubbleRef.value.visible = true;
})
</script>
<template>
  <Suspense>
    <Environment preset="studio" background />
  </Suspense>
  <CubeCamera ref="cubeCameraRef" :args="[0.1, 5000, 512]" :position-y="0">
    <TresMesh ref="bubbleRef" :position="[0, 0, 0]" :scale="2">
      <TresIcosahedronGeometry :args="[1, 64]" />
      <TresShaderMaterial v-bind="shader" />
    </TresMesh>
  </CubeCamera>
</template>
