<script setup>
import { watch, reactive, ref,computed } from "vue";
import { extend } from "@tresjs/core";
import { useGLTF, useTextures } from "@tresjs/cientos";
import { ThreeScatter } from "@jaimebboyjt/three-scatter";
import { Pane } from "tweakpane";

extend({ ThreeScatter });

const scatterRef = ref(null);
const pathFloor = "/models/surfaceSamplingTest.glb";
const { state: floor } = useGLTF(pathFloor);

const pathModel = "/models/House.glb";
const { state: model } = useGLTF(pathModel);
console.log('jaime ~ model:', model);

const { textures } = useTextures([
   "/textures/floor_textures/Ground_Wet_002_basecolor.jpg",
   "/textures/floor_textures/Ground_Wet_002_normal.jpg",
   "/textures/floor_textures/Ground_Wet_002_roughness.jpg",
   "/textures/floor_textures/Ground_Wet_002_ambientOcclusion.jpg",
]);

const geometry = computed(() => floor.value?.scene.children[0].geometry);

watch(scatterRef, (scatter) => {
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
</script>
<template>
  <TresMesh v-if="geometry" :geometry="geometry">
    <TresMeshStandardMaterial
      :normalMap="textures[1]"
      :map="textures[0]"
      :roughnessMap="textures[2]"
      :aoMap="textures[3]"
    />
  </TresMesh>
  <TresDirectionalLight :position="[10, 10, 10]" :intensity="4" />
  <TresThreeScatter v-if="geometry && model?.scene" ref="scatterRef" :args="[geometry, model.scene, 100]" />
</template>
