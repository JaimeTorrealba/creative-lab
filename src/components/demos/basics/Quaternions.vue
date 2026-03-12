<script setup>
import { reactive, shallowRef } from "vue";
import { Pane } from "tweakpane";

const boxRef = shallowRef(null);

const options = reactive({
  x: 0,
  y: 0,
  z: 0,
  w: 0,
});

const pane = new Pane();

pane
  .addBinding(options, "x", { min: -Math.PI, max: Math.PI * 2, step: 0.01 })
  .on("change", () => {
    if (boxRef.value) {
      boxRef.value.quaternion.set(options.x, options.y, options.z, options.w);
    }
  });
pane
  .addBinding(options, "y", { min: -Math.PI, max: Math.PI * 2, step: 0.01 })
  .on("change", () => {
    if (boxRef.value) {
      boxRef.value.quaternion.set(options.x, options.y, options.z, options.w);
    }
  });
pane
  .addBinding(options, "z", { min: -Math.PI, max: Math.PI * 2, step: 0.01 })
  .on("change", () => {
    if (boxRef.value) {
      boxRef.value.quaternion.set(options.x, options.y, options.z, options.w);
    }
  });
pane
  .addBinding(options, "w", { min: -Math.PI, max: Math.PI * 2, step: 0.01 })
  .on("change", () => {
    if (boxRef.value) {
      boxRef.value.quaternion.set(options.x, options.y, options.z, options.w);
    }
  });
</script>
<template>
  <TresMesh ref="boxRef">
    <TresBoxGeometry />
    <TresMeshLambertMaterial :shininess="10" />
  </TresMesh>
</template>
