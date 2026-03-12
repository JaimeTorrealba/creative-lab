<script setup>
import { reactive } from "vue";
import { useLoader } from "@tresjs/core";
import { Environment, Lightformer } from "@tresjs/cientos";
import { watchOnce } from "@vueuse/core";
import { MaterialXLoader } from "three/addons/loaders/MaterialXLoader.js";
import { Pane } from "tweakpane";

const options = reactive({
  hasBackground: true,
  hasLightformer: true,
  backgroundIntensity: 1,
  environmentIntensity: 1,
  // backgroundRotation: 0,
});

const pane = new Pane();

pane.addBinding(options, "hasBackground", { label: "Has Background" });
pane.addBinding(options, "hasLightformer", { label: "Has Lightformer" });
pane.addBinding(options, "backgroundIntensity", {
  min: 0,
  max: 5,
  step: 0.1,
  label: "Background Intensity",
});
pane.addBinding(options, "environmentIntensity", {
  min: 0,
  max: 5,
  step: 0.1,
  label: "Environment Intensity",
});

const { state: material, isLoading } = useLoader(
  MaterialXLoader,
  "/materials/Car_Paint.mtlx"
);

watchOnce(isLoading, (value) => {
  if (!value) {
    console.log("jaime ~ material:", material.value);
  }
});
</script>
<template>
  <Suspense>
    <Environment
      preset="city"
      syncMaterials
      :background="options.hasBackground"
      :backgroundIntensity="options.backgroundIntensity"
      :environmentIntensity="options.environmentIntensity"
    >
      <Lightformer
        v-if="options.hasLightformer"
        from="ring"
        :scale="[10, 10]"
        :intensity="10000"
        :rotation-y="-Math.PI / 2"
      />
    </Environment>
  </Suspense>
  <TresMesh :material="material.materials.Car_Paint" v-if="!isLoading">
    <TresIcosahedronGeometry :args="[1, 16]" />
  </TresMesh>
</template>
