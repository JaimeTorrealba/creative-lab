<script setup>
import { watch, reactive, ref } from "vue";
import { useTexture, extend } from "@tresjs/core";
import { useGLTF } from "@tresjs/cientos";
import { ThreeScatter } from "@jaimebboyjt/three-scatter";
import { Pane } from "tweakpane";

extend({ ThreeScatter });

const scatterRef = ref(null);
const pathFloor = "/models/surfaceSamplingTest.glb";
const { scene: floor } = await useGLTF(pathFloor);

const pathModel = "/models/House.glb";
const { scene: model } = await useGLTF(pathModel);

const { normalMap, map, roughnessMap, aoMap } = await useTexture({
  map: "/textures/floor_textures/Ground_Wet_002_basecolor.jpg",
  normalMap: "/textures/floor_textures/Ground_Wet_002_normal.jpg",
  roughnessMap: "/textures/floor_textures/Ground_Wet_002_roughness.jpg",
  aoMap: "/textures/floor_textures/Ground_Wet_002_ambientOcclusion.jpg",
});

const geometry = floor.children[0].geometry;

watch(scatterRef, (scatter) => {
  console.log("jaime ~ watch ~ scatter:", scatter);
  scatter.alignToSurfaceNormal();
  scatter.setAll((model) => {
    model.scale.set(3, 3, 3);
  });
  // scatterRef.value.setSeeds(5);
});

const options = reactive({
  seeds: 1,
  scale: 3,
});

const pane = new Pane();
// pane.addBinding(options, "seeds", {
//   label: "Seeds",
//   min: -10,
//   max: 10,
//   step: 1,
// });
pane.addBinding(options, "scale", {
  label: "Scale",
  min: 1,
  max: 10,
  step: 1,
});

watch(
  () => options.scale,
  (scale) => {
    scatterRef.value.setAll((model) => {
      model.scale.set(scale, scale, scale);
    });
  }
);
// watch(
//   () => options.seeds,
//   (seed) => {
//     // console.log('jaime ~ seed:', seed);
//     scatterRef.value.setSeeds(seed);
//     // console.log("jaime ~ scatterRef.value:", scatterRef.value);
//     // scatterRef.value.alignToSurfaceNormal();
//   }
// );
</script>
<template>
  <TresMesh :geometry="geometry">
    <TresMeshStandardMaterial
      :normalMap="normalMap"
      :map="map"
      :roughnessMap="roughnessMap"
      :aoMap="aoMap"
    />
  </TresMesh>
  <TresDirectionalLight :position="[10, 10, 10]" :intensity="4" />
  <TresThreeScatter ref="scatterRef" :args="[geometry, model, 100]" />
</template>
