<script setup>
import { watch } from "vue";
import { useTexture } from "@tresjs/cientos";
import { MeshStandardNodeMaterial, RepeatWrapping, LinearFilter } from "three/webgpu";
import {
  uniform,
  texture,
  select,
  lessThan,
  float,
  vec4,
  vec3,
  mix,
  step,
  add,
  mul,
  vec2,
  uv,
} from "three/tsl";
import { Pane } from "tweakpane";

const uBorderSize = uniform(0.03);
const uAlphaThreshold = uniform(0.5);
const uTextureScale = uniform(1.0);
const material = new MeshStandardNodeMaterial();

const { state: colorTex } = useTexture("/textures/8k_earth_daymap.jpg");
const { state: tex, isLoading } = useTexture("/perlin.png");

watch(tex, (_tex) => {
  console.log('jaime ~ colorTex:', colorTex);
  if (_tex) {
    _tex.wrapS = _tex.wrapT = RepeatWrapping;
    _tex.minFilter = LinearFilter;
    material.colorNode = texture(_tex, vec2(mul(uv().x, uTextureScale), mul(uv().y, uTextureScale))).r;
    const colorMap = texture(colorTex.value, uv());

    const mask = step(add(uAlphaThreshold, uBorderSize), material.colorNode);

    const alpha = select(
      lessThan(material.colorNode, uAlphaThreshold),
      float(0.0),
      float(1.0)
    );

    const color1 = vec3(0.0);
    const color2 = colorMap.rgb;
    const finalColor = vec4(mix(color1, color2, mask), alpha);
    material.colorNode = finalColor;
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
