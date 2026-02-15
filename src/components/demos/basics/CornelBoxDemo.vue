<script setup>
import { onBeforeUnmount } from "vue";
import * as THREE from "three/webgpu";
import {
  pass,
  mrt,
  output,
  normalView,
  diffuseColor,
  velocity,
  add,
  vec4,
  directionToColor,
  colorToDirection,
  sample,
  uniform,
} from "three/tsl";
import { ssgi } from "three/addons/tsl/display/SSGINode.js";
import { traa } from "three/addons/tsl/display/TRAANode.js";
import { useLoop, useTres } from "@tresjs/core";
import { Pane } from "tweakpane";

const { scene, camera, renderer } = useTres();

const postProcessing = new THREE.PostProcessing(renderer);

const scenePass = pass(scene.value, camera.value);
scenePass.setMRT(
  mrt({
    output: output,
    diffuseColor: diffuseColor,
    normal: directionToColor(normalView),
    velocity: velocity,
  })
);

const colorNode = scenePass.getTextureNode("output");
const depthNode = scenePass.getTextureNode("depth");
const normalNode = scenePass.getTextureNode("normal");
const velocityNode = scenePass.getTextureNode("velocity");

const diffuseTexture = scenePass.getTexture("diffuseColor");
diffuseTexture.type = THREE.UnsignedByteType;

const normalTexture = scenePass.getTexture("normal");
normalTexture.type = THREE.UnsignedByteType;

const sceneNormal = sample((uv) => colorToDirection(normalNode.sample(uv)));

const giPass = ssgi(colorNode, depthNode, sceneNormal, camera.value);
giPass.sliceCount.value = 2;
giPass.stepCount.value = 8;

const giIntensity = uniform(1.2);
const composite = vec4(add(colorNode.rgb, giPass.rgb.mul(giIntensity)), colorNode.a);
composite.name = "Composite";

const traaPass = traa(composite, depthNode, velocityNode, camera.value);
postProcessing.outputNode = traaPass;

const { render } = useLoop();

render((notifySuccess) => {
  postProcessing.render();
  notifySuccess();
});

const pane = new Pane();
const ssgiFolder = pane.addFolder({ title: "SSGI" });

ssgiFolder.addBinding(giIntensity, "value", {
  label: "GI intensity",
  min: 0,
  max: 3,
  step: 0.05,
});
ssgiFolder.addBinding(giPass.sliceCount, "value", {
  label: "slice count",
  min: 1,
  max: 4,
  step: 1,
});
ssgiFolder.addBinding(giPass.stepCount, "value", {
  label: "step count",
  min: 2,
  max: 16,
  step: 1,
});

onBeforeUnmount(() => {
  pane.dispose();
});
</script>
<template>
  <!-- Cornell Box inspired scene -->

  <!-- Left wall - red -->
  <TresMesh
    :position="[-10, 7.5, 0]"
    :rotation="[0, Math.PI * 0.5, 0]"
    :scale="[20, 15, 1]"
    :receiveShadow="true"
  >
    <TresPlaneGeometry :args="[1, 1]" />
    <TresMeshPhysicalMaterial color="#ff0000" />
  </TresMesh>

  <!-- Right wall - green -->
  <TresMesh
    :position="[10, 7.5, 0]"
    :rotation="[0, -Math.PI * 0.5, 0]"
    :scale="[20, 15, 1]"
    :receiveShadow="true"
  >
    <TresPlaneGeometry :args="[1, 1]" />
    <TresMeshPhysicalMaterial color="#00ff00" />
  </TresMesh>

  <!-- Floor (white) -->
  <TresMesh :rotation="[-Math.PI * 0.5, 0, 0]" :scale="[20, 20, 1]" :receiveShadow="true">
    <TresPlaneGeometry :args="[1, 1]" />
    <TresMeshPhysicalMaterial color="#ffffff" />
  </TresMesh>

  <!-- Back wall (white) -->
  <TresMesh
    :position="[0, 7.5, -10]"
    :rotation="[0, 0, -Math.PI * 0.5]"
    :scale="[15, 20, 1]"
    :receiveShadow="true"
  >
    <TresPlaneGeometry :args="[1, 1]" />
    <TresMeshPhysicalMaterial color="#ffffff" />
  </TresMesh>

  <!-- Ceiling (white) -->
  <TresMesh
    :position="[0, 15, 0]"
    :rotation="[Math.PI * 0.5, 0, 0]"
    :scale="[20, 20, 1]"
    :receiveShadow="true"
  >
    <TresPlaneGeometry :args="[1, 1]" />
    <TresMeshPhysicalMaterial color="#ffffff" />
  </TresMesh>

  <!-- Tall box (white) -->
  <TresMesh
    :position="[-3, 3.5, -2]"
    :rotation="[0, Math.PI * 0.25, 0]"
    :castShadow="true"
    :receiveShadow="true"
  >
    <TresBoxGeometry :args="[5, 7, 5]" />
    <TresMeshPhysicalMaterial color="#ffffff" />
  </TresMesh>

  <!-- Short box (white) -->
  <TresMesh
    :position="[4, 2, 4]"
    :rotation="[0, -Math.PI * 0.1, 0]"
    :castShadow="true"
    :receiveShadow="true"
  >
    <TresBoxGeometry :args="[4, 4, 4]" />
    <TresMeshPhysicalMaterial color="#ffffff" />
  </TresMesh>
</template>
