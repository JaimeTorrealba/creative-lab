<script setup>
import vertex from "./shaders/simonGrass/vertex.glsl";
import fragment from "./shaders/simonGrass/fragment.glsl";
import { InstancedBufferGeometry, BufferAttribute, Sphere, Vector3, Vector2, Vector4 } from "three";
import { useLoop } from "@tresjs/core";

const NUM_GRASS = 7500;
const GRASS_SEGMENTS = 6;
// const GRASS_VERTICES = (GRASS_SEGMENTS + 1) * 2;
const GRASS_PATCH_SIZE = 5;
const GRASS_HEIGHT = 2;
const GRASS_WIDTH = 0.25;

const VERTICES = (GRASS_SEGMENTS + 1) * 2;
const indices = [];

for (let i = 0; i < GRASS_SEGMENTS; i++) {
  const vi = i + 2;
  indices[i * 12 + 0] = vi + 0;
  indices[i * 12 + 1] = vi + 1;
  indices[i * 12 + 2] = vi + 2;

  indices[i * 12 + 3] = vi + 2;
  indices[i * 12 + 4] = vi + 1;
  indices[i * 12 + 5] = vi + 3;

  const fi = VERTICES + vi;

  indices[i * 12 + 6] = fi + 2;
  indices[i * 12 + 7] = fi + 1;
  indices[i * 12 + 8] = fi + 0;

  indices[i * 12 + 9] = fi + 3;
  indices[i * 12 + 10] = fi + 1;
  indices[i * 12 + 11] = fi + 2;
}
const geo = new InstancedBufferGeometry();
geo.instanceCount = NUM_GRASS;
geo.setIndex(indices);

const maxIndex = Math.max(...indices);
const positions = new Float32Array((maxIndex + 1) * 3);
geo.setAttribute("position", new BufferAttribute(positions, 3));


geo.boundingSphere = new Sphere(new Vector3(0, 0, 0), 1 + GRASS_PATCH_SIZE * 2);

const shader = {
   vertexShader: vertex,
  fragmentShader: fragment,
  uniforms: {
    uTime: { value: 0 },
    uGrassParams: {
      value: new Vector4(GRASS_SEGMENTS, GRASS_PATCH_SIZE, GRASS_WIDTH, GRASS_HEIGHT),
    },
    resolution: { value: new Vector2(window.innerWidth, window.innerHeight) },
  },
};

const { onBeforeRender } = useLoop();

onBeforeRender(({elapsed}) => {
  shader.uniforms.uTime.value = elapsed * 0.5;
});
</script>
<template>
    <TresMesh :geometry="geo" :position-y="-0.5">
        <TresShaderMaterial v-bind="shader" />
    </TresMesh>
</template>
