<script setup>
import { shallowRef } from "vue";
import { useLoop } from "@tresjs/core";
import { Pane } from "tweakpane";
import vertex from "./shaders/ForceField/vertex.glsl";
import fragment from "./shaders/ForceField/fragment.glsl";
import { Vector3, MathUtils } from "three";
import DragControls from "../../internals/DragControls.vue";

const boxRef = shallowRef();
const sphereRef = shallowRef();
const boxSize = new Vector3(1, 1, 1);

const shader = {
  uniforms: {
    uContactPoint: { value: new Vector3(0, -999, 0) },
    uContactNormal: { value: new Vector3() },
    uContactStrength: { value: 0.0 },
    uContactIntensity: { value: 5.0 },
  },
  transparent: true,
  depthWrite: false,
  vertexShader: vertex,
  fragmentShader: fragment,
};

const pane = new Pane();
pane.addBinding(shader.uniforms.uContactIntensity, 'value', {
  min: 0,
  max: 50,
  step: 0.1,
  label: 'Contact Intensity'
});

function getClosestPointOnBox(point, box) {
  const localPoint = point.clone().sub(box.position);
  return new Vector3(
    MathUtils.clamp(localPoint.x, -boxSize.x / 2, boxSize.x / 2),
    MathUtils.clamp(localPoint.y, -boxSize.y / 2, boxSize.y / 2),
    MathUtils.clamp(localPoint.z, -boxSize.z / 2, boxSize.z / 2)
  ).add(box.position);
}

function updateContact() {
  const closest = getClosestPointOnBox(sphereRef.value.position, boxRef.value);
  const dist = closest.distanceTo(sphereRef.value.position);
  const radius = 1;

  if (dist < radius) {
    const normal = sphereRef.value.position.clone().sub(closest).normalize();
    const penetration = 1.0 - dist / radius;

    shader.uniforms.uContactPoint.value.copy(closest);
    shader.uniforms.uContactNormal.value.copy(normal);
    shader.uniforms.uContactStrength.value = penetration;
  } else {
    shader.uniforms.uContactStrength.value = 0.0;
  }
}

const { onBeforeRender } = useLoop();

onBeforeRender(() => {
    updateContact();
});
</script>
<template>
  import DragControls from "../../internals/DragControls.vue";
  <TresMesh ref="boxRef">
    <TresBoxGeometry />
    <TresMeshNormalMaterial wireframe />
  </TresMesh>
  <DragControls :objects="[sphereRef]" />
  <TresMesh ref="sphereRef" :position="[3, 0, 0]">
    <TresSphereGeometry :args="[1, 64]" />
    <TresShaderMaterial v-bind="shader" />
  </TresMesh>
</template>
