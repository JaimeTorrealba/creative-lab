<script setup>
  import { shallowRef } from "vue";
import { Vector2 } from "three";
import { Pane } from "tweakpane";
import { gsap } from "gsap";
import vertex from "./shaders/HoverOnFaces/vertex.glsl";
import fragment from "./shaders/HoverOnFaces/fragment.glsl";

const materialRef = shallowRef();
let currentStrength = 0.15;

const shader = {
  uniforms: {
    mousePos: { value: new Vector2(0.5, 0.5) },
    hoverRadius: { value: 0.15 },
    hoverStrength: { value: 0.15 },
  },
  vertexShader: vertex,
  fragmentShader: fragment,
  wireframe: false,
}

function onMove(event) {
  shader.uniforms.mousePos.value.set(event.intersection.uv.x, event.intersection.uv.y)
}
function onMouseDown() {
  gsap.to(shader.uniforms.hoverStrength, {
    value: 0,
    duration: 0.25,
    ease: "power2.out",
  });
}
function onMouseUp() {
  gsap.to(shader.uniforms.hoverStrength, {
    value: currentStrength,
    duration: 0.25,
    ease: "power2.out",
  });
}

const pane = new Pane({ title: "Hover On Faces Shader" });
const folder = pane.addFolder({ title: "Settings" });
folder.addBinding(shader.uniforms.hoverRadius, "value", { min: 0, max: 0.5, step: 0.01, label: "Hover Radius" });
folder.addBinding(shader.uniforms.hoverStrength, "value", { min: 0, max: 0.5, step: 0.01, label: "Hover Strength" }).on("change", () => {
  currentStrength = shader.uniforms.hoverStrength.value;
});
folder.addBinding(shader, "wireframe", { label: "Wireframe" }).on("change", () => {
  if (materialRef.value) {
    materialRef.value.wireframe = shader.wireframe;
  }
});

</script>
<template>
  <TresMesh @pointermove="onMove" @pointerleave="onMouseDown" @pointerenter="onMouseUp">
    <TresIcosahedronGeometry :args="[1, 8]" />
    <TresShaderMaterial ref="materialRef" v-bind="shader" />
  </TresMesh>
</template>
