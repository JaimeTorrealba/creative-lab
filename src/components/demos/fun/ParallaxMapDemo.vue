<script setup>
import { reactive } from "vue";
import { useLoop, useTres } from "@tresjs/core";
import { useTextures } from "@tresjs/cientos";
import { watchOnce } from "@vueuse/core";
import * as THREE from "three";
import { Pane } from "tweakpane";
import vertex from './shaders/ParallaxMap/vertex.glsl'
import simpleFragment from './shaders/ParallaxMap/simple_fragment.glsl'
import steepFragment from './shaders/ParallaxMap/steep_fragment.glsl'
import occlusionFragment from './shaders/ParallaxMap/occlusion_fragment.glsl'
import perPixelFragment from './shaders/ParallaxMap/per_pixel_fragment.glsl'

const path = "/textures/floor_rocks/Ground_Wet_Rocks_001_";

const { textures, isLoading } = useTextures([
  `${path}basecolor.jpg`,
  `${path}normal.jpg`,
  `${path}height.png`,
  `${path}roughness.jpg`,
]);

watchOnce(isLoading, (newVal) => {
  if (!newVal) {
    textures.value.forEach((texture) => {
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(2, 2);
    });
    simpleParallaxMaterial.uniforms.uDiffuseMap.value = textures.value[0];
    simpleParallaxMaterial.uniforms.uNormalMap.value = textures.value[1];
    simpleParallaxMaterial.uniforms.uHeightMap.value = textures.value[2];

    steepParallaxMaterial.uniforms.uDiffuseMap.value = textures.value[0];
    steepParallaxMaterial.uniforms.uNormalMap.value = textures.value[1];
    steepParallaxMaterial.uniforms.uHeightMap.value = textures.value[2];

    occlusionParallaxMaterial.uniforms.uDiffuseMap.value = textures.value[0];
    occlusionParallaxMaterial.uniforms.uNormalMap.value = textures.value[1];
    occlusionParallaxMaterial.uniforms.uHeightMap.value = textures.value[2];

    perPixelParallaxMaterial.uniforms.uDiffuseMap.value = textures.value[0];
    perPixelParallaxMaterial.uniforms.uNormalMap.value = textures.value[1];
    perPixelParallaxMaterial.uniforms.uHeightMap.value = textures.value[2];
  }
});

const simpleParallaxMaterial = new THREE.ShaderMaterial({
  uniforms: {
    uDiffuseMap: { value: null },
    uNormalMap: { value: null },
    uHeightMap: { value: null },
    uHeightScale: { value: 0.1 },
    uViewPos: { value: new THREE.Vector3() },
  },
  vertexShader: vertex,
  fragmentShader: simpleFragment,
});

const steepParallaxMaterial = new THREE.ShaderMaterial({
  uniforms: {
    uDiffuseMap: { value: null },
    uNormalMap: { value: null },
    uHeightMap: { value: null },
    uHeightScale: { value: 0.1 },
    uViewPos: { value: new THREE.Vector3() },
  },
  vertexShader: vertex,
  fragmentShader: steepFragment,
});

const occlusionParallaxMaterial = new THREE.ShaderMaterial({
  uniforms: {
    uDiffuseMap: { value: null },
    uNormalMap: { value: null },
    uHeightMap: { value: null },
    uHeightScale: { value: 0.1 },
    uViewPos: { value: new THREE.Vector3() },
  },
  vertexShader: vertex,
  fragmentShader: occlusionFragment,
});

const perPixelParallaxMaterial = new THREE.ShaderMaterial({
  uniforms: {
    uDiffuseMap: { value: null },
    uNormalMap: { value: null },
    uHeightMap: { value: null },
    uHeightScale: { value: 0.1 },
    uViewPos: { value: new THREE.Vector3() },
  },
  vertexShader: vertex,
  fragmentShader: perPixelFragment,
});

const { camera } = useTres();

const { onBeforeRender } = useLoop();
onBeforeRender(() => {
  simpleParallaxMaterial.uniforms.uViewPos.value.copy(camera.value.position);
  steepParallaxMaterial.uniforms.uViewPos.value.copy(camera.value.position);
  occlusionParallaxMaterial.uniforms.uViewPos.value.copy(camera.value.position);
  perPixelParallaxMaterial.uniforms.uViewPos.value.copy(camera.value.position);
});

const options = reactive({
    simpleParallaxHeightScale: 0.1,
    steepParallaxHeightScale: 0.1,
  occlusionParallaxHeightScale: 0.1,
  perPixelParallaxHeightScale: 0.1,
})

const pane = new Pane();
const parallaxFolder = pane.addFolder({ title: "Simple Parallax mapping" });
parallaxFolder.addBinding(options, "simpleParallaxHeightScale", {
  label: "height scale",
  min: 0,
  max: 2,
  step: 0.01,
}).on("change", ({value}) => {
  simpleParallaxMaterial.uniforms.uHeightScale.value = value;
});
const steepParallaxFolder = pane.addFolder({ title: "Steep Parallax mapping" });
steepParallaxFolder.addBinding(options, "steepParallaxHeightScale", {
  label: "height scale",
  min: 0,
  max: 1,
  step: 0.01,
}).on("change", ({value}) => {
  steepParallaxMaterial.uniforms.uHeightScale.value = value;
});

const occlusionParallaxFolder = pane.addFolder({ title: "Occlusion Parallax mapping" });
occlusionParallaxFolder.addBinding(options, "occlusionParallaxHeightScale", {
  label: "height scale",
  min: -1,
  max: 1,
  step: 0.01,
}).on("change", ({value}) => {
  occlusionParallaxMaterial.uniforms.uHeightScale.value = value;
});

const perPixelParallaxFolder = pane.addFolder({ title: "Per-Pixel Displacement" });
perPixelParallaxFolder.addBinding(options, "perPixelParallaxHeightScale", {
  label: "height scale",
  min: 0,
  max: 1,
  step: 0.01,
}).on("change", ({value}) => {
  perPixelParallaxMaterial.uniforms.uHeightScale.value = value;
});

</script>
<template>
  <TresMesh
    :material="simpleParallaxMaterial"
    :position="[-1.5, 0, -1.5]"
    :rotation="[-Math.PI / 2, 0, 0]"
  >
    <TresPlaneGeometry :args="[2, 2, 32, 32]" />
  </TresMesh>
  <TresMesh
    :material="steepParallaxMaterial"
    :position="[1.5, 0, -1.5]"
    :rotation="[-Math.PI / 2, 0, 0]"
  >
    <TresPlaneGeometry :args="[2, 2, 32, 32]" />
  </TresMesh>
  <TresMesh
    :material="occlusionParallaxMaterial"
    :position="[-1.5, 0, 1.5]"
    :rotation="[-Math.PI / 2, 0, 0]"
  >
    <TresPlaneGeometry :args="[2, 2, 32, 32]" />
  </TresMesh>
  <TresMesh
    :material="perPixelParallaxMaterial"
    :position="[1.5, 0, 1.5]"
    :rotation="[-Math.PI / 2, 0, 0]"
  >
    <TresPlaneGeometry :args="[2, 2, 32, 32]" />
  </TresMesh>
</template>
