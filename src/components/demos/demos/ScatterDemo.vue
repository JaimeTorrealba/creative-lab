<script setup>
import { reactive, shallowRef, watch } from "vue";
import { useTresContext, useTexture } from "@tresjs/core";
import { useGLTF } from '@tresjs/cientos'
import { Pane } from "tweakpane";
import { ThreeScatter } from "../../internals/ThreeScatter";

// collission detection
// publish

const { scene: floor } = await useGLTF('/models/surfaceSamplingTest.glb')
const { scene: meshToSample } = await useGLTF('/models/House.glb')
const { scene: meshToSample2 } = await useGLTF('/models/Fantasy House.glb')

const { normalMap, map, roughnessMap, aoMap } = await useTexture({
    map: '/textures/floor_textures/Ground_Wet_002_basecolor.jpg',
    normalMap: '/textures/floor_textures/Ground_Wet_002_normal.jpg',
    roughnessMap: '/textures/floor_textures/Ground_Wet_002_roughness.jpg',
    aoMap: '/textures/floor_textures/Ground_Wet_002_ambientOcclusion.jpg',
})

const { scene } = useTresContext();
const floorRef = shallowRef(null);
const scatter = shallowRef(null);

watch(floorRef, (_floor) => {
  if (_floor) {
    meshToSample2
    scatter.value = new ThreeScatter(floor.children[0].geometry, [meshToSample, meshToSample2], 50);
    scene.value.add(scatter.value.scatterGroup);
  }
});

// debugger
const pane = new Pane();

const options = reactive({
  rotX: 0,
  rotY: 0,
  rotZ: 0,
  scale: 1,
  //more
  seeds: 1,
});

const rotations = pane.addFolder({
  title: "Rotation",
});
// rotations
rotations
  .addBinding(options, "rotX", {
    min: -Math.PI,
    max: Math.PI,
    step: 0.1,
  })
  .on("change", ({ value }) => {
    scatter.value.setRotationX(value);
  });
rotations
  .addBinding(options, "rotY", {
    min: -Math.PI,
    max: Math.PI,
    step: 0.1,
  })
  .on("change", ({ value }) => {
    scatter.value.setRotationY(value, () => Math.random() + 0.5);
  });
rotations
  .addBinding(options, "rotZ", {
    min: -Math.PI,
    max: Math.PI,
    step: 0.1,
  })
  .on("change", ({ value }) => {
    scatter.value.setRotationZ(value);
  });

const scales = pane.addFolder({
  title: "Scale",
});
scales
  .addBinding(options, "scale", {
    min: 0.1,
    max: 3,
    step: 0.1,
  })
  .on("change", ({ value }) => {
    scatter.value.setScale(value);
  });

pane
  .addBinding(options, "seeds", {
    min: 1,
    max: 10,
    step: 1,
  })
  .on("change", ({ value }) => {
    scatter.value.setSeeds(value);
  });
</script>
<template>
  <TresMesh ref="floorRef" :geometry="floor.children[0].geometry" >
    <TresMeshStandardMaterial :normalMap="normalMap" :map="map" :roughnessMap="roughnessMap" :aoMap="aoMap" />
  </TresMesh>
</template>
