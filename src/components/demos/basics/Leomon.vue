<script setup>
import { reactive } from "vue";
import { useLoader, useTres } from "@tresjs/core";
import { IESLoader } from "three/addons/loaders/IESLoader.js";
import { IESSpotLight } from "three/webgpu";
import { Pane } from "tweakpane";

const { extend } = useTres();

extend({ IESSpotLight });

const { state: softDisplay, isLoading: isLoadingSoftDisplay } = useLoader(
  IESLoader,
  "/textures/ies/soft-display.ies"
);
const { state: areaLight, isLoading: isLoadingAreaLight } = useLoader(
  IESLoader,
  "/textures/ies/area-light.ies"
);
const { state: displayLight, isLoading: isLoadingDisplayLight } = useLoader(
  IESLoader,
  "/textures/ies/display.ies"
);
const { state: topPostLight, isLoading: isLoadingTopPostLight } = useLoader(
  IESLoader,
  "/textures/ies/top-post.ies"
);

const pane = new Pane();

const options = reactive({
  softDisplayIntensity: 10,
  softDisplayColor: "#ffffff",
  softDisplayVisible: true,
  areaLightIntensity: 10,
  areaLightColor: "#ffffff",
  areaLightVisible: true,
  displayLightIntensity: 10,
  displayLightColor: "#ffffff",
  displayLightVisible: true,
  topPostLightIntensity: 10,
  topPostLightColor: "#ffffff",
  topPostLightVisible: true,
});

pane.addBinding(options, "softDisplayVisible", { label: "Soft Display Visible" });
pane.addBinding(options, "softDisplayIntensity", {
  min: 0,
  max: 50,
  step: 0.5,
  label: "Soft Display Intensity",
});
pane.addBinding(options, "softDisplayColor", { label: "Soft Display Color" });
pane.addBinding(options, "areaLightVisible", { label: "Area Light Visible" });
pane.addBinding(options, "areaLightIntensity", {
  min: 0,
  max: 50,
  step: 0.5,
  label: "Area Light Intensity",
});
pane.addBinding(options, "areaLightColor", { label: "Area Light Color" });
pane.addBinding(options, "displayLightVisible", { label: "Display Light Visible" });
pane.addBinding(options, "displayLightIntensity", {
  min: 0,
  max: 50,
  step: 0.5,
  label: "Display Light Intensity",
});
pane.addBinding(options, "displayLightColor", { label: "Display Light Color" });
pane.addBinding(options, "topPostLightVisible", { label: "Top Post Light Visible" });
pane.addBinding(options, "topPostLightIntensity", {
  min: 0,
  max: 50,
  step: 0.5,
  label: "Top Post Light Intensity",
});
pane.addBinding(options, "topPostLightColor", { label: "Top Post Light Color" });
</script>
<template>
  <TresIESSpotLight
    v-if="!isLoadingSoftDisplay"
    :iesMap="softDisplay"
    :position="[3, 5, 0]"
    :intensity="options.softDisplayIntensity"
    :color="options.softDisplayColor"
    :visible="options.softDisplayVisible"
  />
  <TresIESSpotLight
    v-if="!isLoadingAreaLight"
    :iesMap="areaLight"
    :position="[-3, 5, 0]"
    :intensity="options.areaLightIntensity"
    :color="options.areaLightColor"
    :visible="options.areaLightVisible"
  />
  <TresIESSpotLight
    v-if="!isLoadingDisplayLight"
    :iesMap="displayLight"
    :position="[0, 5, -3]"
    :intensity="options.displayLightIntensity"
    :color="options.displayLightColor"
    :visible="options.displayLightVisible"
  />
  <TresIESSpotLight
    v-if="!isLoadingTopPostLight"
    :iesMap="topPostLight"
    :position="[0, 5, 3]"
    :intensity="options.topPostLightIntensity"
    :color="options.topPostLightColor"
    :visible="options.topPostLightVisible"
  />
</template>
