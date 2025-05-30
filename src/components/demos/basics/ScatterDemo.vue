<script setup>
import { useTexture, useTresContext, extend } from "@tresjs/core";
import { useGLTF } from "@tresjs/cientos";
import { ThreeScatter } from "@jaimebboyjt/three-scatter";

 extend({ ThreeScatter })

const { scene } = useTresContext();
console.log("jaime ~ scene:", scene);

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

// const scatter = new ThreeScatter(geometry, model, 50);
// scatter.setAll((model) => {
//   model.scale.set(3, 3, 3);
// });
// scatter.alignToSurfaceNormal();
// scene.value.add(scatter);
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
  <TresThreeScatter :args="[geometry, model, 100]" />
</template>
