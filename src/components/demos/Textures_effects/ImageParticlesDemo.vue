<script setup>
import { ref, watch } from "vue";
import { useTexture } from "@tresjs/cientos";
import { watchOnce } from "@vueuse/core";
import { randFloat } from "three/src/math/MathUtils";
import { gsap } from "gsap";
import vertex from "./shaders/image_particles/vertex.glsl";
import fragment from "./shaders/image_particles/fragment.glsl";

//TODO: add tweakpane

const wallRef = ref(null);

const multiplier = 18;
const columns = 16 * multiplier;
const lines = 9 * multiplier;

const { state:texture, isLoading } = useTexture(
  "/images/photo_slider2.jpg");

watchOnce(isLoading, (value) => {
    if (!value) {
        shader.uniforms.uTexture.value = texture.value;
    }
})

const shader = {
  vertexShader: vertex,
  fragmentShader: fragment,
  uniforms: {
    uSize: { value: 10.0 },
    uTexture: { value: null},
    uColumns: { value: columns },
    uLines: { value: lines },
    uProgress: { value: 0 },
  },
  defines: {
    USE_UV: "",
  },
  transparent: true,
  depthWrite: false,
  depthTest: false,
};

const positionArray = [];
const initPositionArray = [];

for (let x = 0; x < columns; x++) {
  for (let y = 0; y < lines; y++) {
    const innerPoints = [x, y, 0];
    const initInnerPoints = [x - columns / 2, y - lines / 2, randFloat(100, 250)];
    positionArray.push(...innerPoints);
    initPositionArray.push(...initInnerPoints);
  }
}

const position = new Float32Array(positionArray);
const initPosition = new Float32Array(initPositionArray);

watch(wallRef, (value) => {
  value.geometry.center();

  gsap.to(value.material.uniforms.uProgress, {
    value: 1,
    duration: 2,
    delay: 1,
    ease: "power4.in",
  });
});
</script>
<template>
  <TresPoints ref="wallRef">
    <TresBufferGeometry :position="[position, 3]" :initPos="[initPosition, 3]" />
    <TresShaderMaterial v-bind="shader" />
  </TresPoints>
</template>
