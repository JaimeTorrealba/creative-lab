<script setup>
import { shallowRef, watch, reactive } from "vue";
import { BufferAttribute } from "three";
import { Pane } from 'tweakpane';

const pane = new Pane();

const options = reactive ({
  color: { r: 0, g: 1, b: 1 },
});

pane.addBinding(options, 'color');

const MeshRef = shallowRef(null);

watch(MeshRef, (sphere) => {
  const count = sphere.geometry.attributes.position.count;
  const colors = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    colors[i * 3 + 0] = 0;
    colors[i * 3 + 1] = 1;
    colors[i * 3 + 2] = 1;
  }
  sphere.geometry.setAttribute('color', new BufferAttribute(colors, 3));
});

const onClick = (event) => {
  event.stopPropagation();
  const faceIndex = event.faceIndex;
  const geometry = MeshRef.value.geometry;
  const colors = geometry.attributes.color;
  // convert to 0-1 range for fragment shader
  const _color = { r: options.color.r/255, g: options.color.g/255, b: options.color.b/255 }; 
  // Each face is made of 3 vertices
  for (let i = 0; i < 3; i++) {
    const vertexIndex = geometry.index.getX(faceIndex * 3 + i);
    colors.setXYZ(vertexIndex, _color.r, _color.g, _color.b);
  }
  colors.needsUpdate = true;
};
</script>
<template>
  <TresMesh ref="MeshRef" @click="onClick">
    <TresSphereGeometry :args="[1, 32]" />
    <TresMeshLambertMaterial vertexColors />
  </TresMesh>
  <TresDirectionalLight :position="[5, 10, 7]" :intensity="1.5" />
  <TresAmbientLight :intensity="0.3" />
</template>
