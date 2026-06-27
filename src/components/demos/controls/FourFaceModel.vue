<script setup>
import { shallowRef, computed } from "vue";
import { useLoop, useTres } from "@tresjs/core";
import { useGLTF, OrbitControls } from "@tresjs/cientos";
// import { fpsControls } from "@jaimebboyjt/tres-fps-controls";
import { Spherical } from "three";

const { state } = useGLTF("/models/ff1+black+magician+4faces.glb");
const model = computed(() => state?.value?.scene);

const { camera } = useTres();

const blackMagicRef = shallowRef(false);

const { onBeforeRender } = useLoop();

onBeforeRender(() => {
  if (!blackMagicRef.value) return;
  const cameraPosition = camera.value.position;
  const coords = new Spherical().setFromVector3(cameraPosition);
  if (coords.theta < Math.PI * 0.25 && coords.theta > (Math.PI * 0.25) * -1) {
    blackMagicRef.value.lookAt(cameraPosition);
  } else if ( coords.theta > Math.PI * 0.25 && coords.theta < Math.PI * 0.75) {
    blackMagicRef.value.rotation.y = coords.theta - Math.PI * 0.5;
  } else if ( coords.theta < (Math.PI * 0.25) * -1 && coords.theta > (Math.PI * 0.75) * -1) {
    blackMagicRef.value.rotation.y = coords.theta + Math.PI * 0.5;
  } else {
    blackMagicRef.value.rotation.y = coords.theta + Math.PI;
  }

});
</script>
<template>
  <!-- <fpsControls :moveSpeed="0.25" /> -->
  <OrbitControls :enablePan="false" :enableZoom="true" :minPolarAngle="1.65" :maxPolarAngle="1.55" />
  <primitive v-if="model" :object="model" ref="blackMagicRef" :position-y="-1.5" />
  <TresPolarGridHelper :args="[25, 8, 1, 64]" :position-y="-2" />
  <TresAmbientLight :intensity="5" />
</template>
