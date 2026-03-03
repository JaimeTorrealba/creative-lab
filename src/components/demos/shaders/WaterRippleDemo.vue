<script setup>
import { onUnmounted, reactive, shallowRef, watch } from "vue";
import { useLoop } from "@tresjs/core";
import { Reflector, MeshWobbleMaterial, useTexture } from "@tresjs/cientos";
import vertex from "./shaders/waterRipple/vertex.glsl";
import fragment from "./shaders/waterRipple/fragment.glsl";
import { Color, RepeatWrapping, UniformsUtils } from "three";
import { Reflector as ThreeReflector } from "three/examples/jsm/objects/Reflector.js";
import { Pane } from "tweakpane";

const { state:texture, isLoading } = useTexture("/textures/waterdudv.jpg");

const mirrorRef = shallowRef();
const customShader = {
  ...ThreeReflector.ReflectorShader,
  uniforms: UniformsUtils.clone(ThreeReflector.ReflectorShader.uniforms),
  vertexShader: vertex,
  fragmentShader: fragment,
};

customShader.uniforms.color = { value: new Color("#f7f7f7")};
customShader.uniforms.tDudv = { value: null };
customShader.uniforms.time = { value: 0 };
customShader.uniforms.waveStrength = { value: 0.25 };
customShader.uniforms.waveSpeed = { value: 0.03 };
customShader.uniforms.rippleRadius = { value: 0.2 };
customShader.uniforms.rippleFeather = { value: 0.08 };

const pane = new Pane({ title: "Water Ripple" });
const options = reactive({
  waveStrength: customShader.uniforms.waveStrength.value,
  waveSpeed: customShader.uniforms.waveSpeed.value,
  rippleRadius: customShader.uniforms.rippleRadius.value,
  rippleFeather: customShader.uniforms.rippleFeather.value,
});
pane
  .addBinding(options, "waveStrength", {
    label: "Wave Strength",
    min: 0,
    max: 2,
    step: 0.01,
  })
  .on("change", ({ value }) => {
    mirrorRef.value.instance.material.uniforms.waveStrength.value = value;
  });

pane
  .addBinding(options, "waveSpeed", {
    label: "Wave Speed",
    min: 0,
    max: 0.2,
    step: 0.001,
  })
  .on("change", ({ value }) => {
    mirrorRef.value.instance.material.uniforms.waveSpeed.value = value;
  });

pane
  .addBinding(options, "rippleRadius", {
    label: "Ripple Radius",
    min: 0.02,
    max: 0.5,
    step: 0.01,
  })
  .on("change", ({ value }) => {
    mirrorRef.value.instance.material.uniforms.rippleRadius.value = value;
  });

pane
  .addBinding(options, "rippleFeather", {
    label: "Ripple Feather",
    min: 0.0,
    max: 0.2,
    step: 0.005,
  })
  .on("change", ({ value }) => {
    mirrorRef.value.instance.material.uniforms.rippleFeather.value = value;
  });


onUnmounted(() => {
  pane.dispose();
});

watch(
  isLoading,
  (value) => {
    if (!value) {
         texture.value.wrapS = texture.value.wrapT = RepeatWrapping;
         customShader.uniforms.tDudv.value = texture.value;
    }
  },
  { immediate: true },
);

const { onBeforeRender } = useLoop();
onBeforeRender(({ elapsed }) => {
  if (mirrorRef.value) {
    mirrorRef.value.instance.material.uniforms.time.value = elapsed;
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
  <Reflector
    v-if="!isLoading"
    ref="mirrorRef"
    :rotation-x="-Math.PI * 0.5"
    :position="[0, -2, 0]"
    color="#444"
    :shader="customShader"
  >
    <TresCircleGeometry :args="[10, 16]" />
  </Reflector>
</template>
