<script setup>
import { watch } from "vue";
import { useTexture } from "@tresjs/cientos";
import { MeshStandardNodeMaterial, RepeatWrapping, LinearFilter } from "three/webgpu";
import { uniform, wgslFn, uv, texture } from "three/tsl";
import { Pane } from "tweakpane";

const uBorderSize = uniform(0.03);
const uAlphaThreshold = uniform(0.5);
const uTextureScale = uniform(1.0);
const material = new MeshStandardNodeMaterial();

const { state: colorTex } = useTexture("/textures/8k_earth_daymap.jpg");
const { state: tex, isLoading } = useTexture("/perlin.png");

const dissolve = wgslFn(`
  fn dissolve(
    noiseVal: f32,
    colorRgb: vec3f,
    alphaThreshold: f32,
    borderSize: f32
  ) -> vec4f {
    let mask: f32 = step(alphaThreshold + borderSize, noiseVal);
    let alpha: f32 = select(0.0, 1.0, noiseVal >= alphaThreshold);
    let finalColor: vec3f = mix(vec3f(0.0), colorRgb, mask);
    return vec4f(finalColor, alpha);
  }
`);

watch(tex, (_tex) => {
  if (_tex) {
    _tex.wrapS = _tex.wrapT = RepeatWrapping;
    _tex.minFilter = LinearFilter;

    const noiseVal = texture(_tex, uv().mul(uTextureScale)).r;
    const colorRgb = texture(colorTex.value, uv()).rgb;

    material.colorNode = dissolve({
      noiseVal,
      colorRgb,
      alphaThreshold: uAlphaThreshold,
      borderSize: uBorderSize,
    });
    material.transparent = true;
  }
});

const pane = new Pane();

pane.addBinding(uBorderSize, "value", {
  min: 0,
  max: 0.03,
  step: 0.01,
  label: "border size",
});
pane.addBinding(uAlphaThreshold, "value", {
  min: 0,
  max: 1,
  step: 0.01,
  label: "alpha threshold",
});
pane.addBinding(uTextureScale, "value", {
  min: 0,
  max: 5,
  step: 0.1,
  label: "texture scale",
});
</script>
<template>
  <TresMesh v-if="!isLoading" :material="material">
    <TresIcosahedronGeometry :args="[1, 64]" />
  </TresMesh>
</template>
