<script setup>
import { shallowRef } from "vue";
import { useRenderLoop, useTresContext } from "@tresjs/core";
import { useGLTF } from "@tresjs/cientos";
import { fpsControls } from "@jaimebboyjt/tres-fps-controls";
import { Spherical } from "three";

const { scene } = await useGLTF("/models/ff1+black+magician+4faces.glb");

const { camera } = useTresContext();

const blackMagicRef = shallowRef(false);


console.log("mathPI ~:", Math.PI * 0.25);



const { onLoop } = useRenderLoop();

onLoop(() => {
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
  <fpsControls :moveSpeed="0.25" />
  <primitive :object="scene" ref="blackMagicRef" :position-y="-1.5" />
  <TresPolarGridHelper :args="[25, 8, 1, 64]" :position-y="-2" />
  <TresAmbientLight :intensity="5" />
</template>
