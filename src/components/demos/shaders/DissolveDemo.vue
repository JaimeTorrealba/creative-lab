<script setup>
import { watch, reactive } from "vue";
import { useTexture } from "@tresjs/cientos";
import { LinearFilter, RepeatWrapping } from "three";
import { Pane } from "tweakpane";

const options = reactive({
  alphaThreshold: 0.5,
  borderSize: 0.05,
  textureScale: 1,
});

const pane = new Pane();
pane.addBinding(options, "alphaThreshold", { min: 0, max: 1 }).on("change", () => {
  shader.uniforms.uAlphaThreshold.value = options.alphaThreshold;
});
pane.addBinding(options, "borderSize", { min: 0, max: 0.1 }).on("change", () => {
  shader.uniforms.uBorderSize.value = options.borderSize;
});
pane.addBinding(options, "textureScale", { min: 0, max: 5 }).on("change", () => {
  shader.uniforms.uTextureScale.value = options.textureScale;
});

const { state: texture, isLoading } = useTexture("/perlin.png");

const shader = {
  uniforms: {
    uTexture: { value: texture },
    uAlphaThreshold: { value: options.alphaThreshold },
    uBorderSize: { value: options.borderSize },
    uTextureScale: { value: options.textureScale },
  },
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: /* glsl */ `
    uniform sampler2D uTexture;
    uniform float uAlphaThreshold;
    uniform float uBorderSize;
    uniform float uTextureScale;
    varying vec2 vUv;

    void main() {
      vec4 textureColor = texture2D(uTexture, vec2(vUv.x * uTextureScale, vUv.y * uTextureScale));
      float alpha = textureColor.r;
      float mask = step(uAlphaThreshold + uBorderSize, textureColor.x);
      if (alpha < uAlphaThreshold) alpha = 0.0;
      else alpha = 1.0;

      gl_FragColor = vec4(mix(vec3(.15, .15, 0.96), vec3(0.75), mask), alpha);
    }
  `,
  transparent: true,
  // side: DoubleSide,
};

watch(texture, (_tex) => {
  if (_tex) {
    _tex.wrapS = RepeatWrapping;
    _tex.wrapT = RepeatWrapping;
    _tex.minFilter = _tex.magFilter = LinearFilter;
    shader.uniforms.uTexture.value = _tex;
  }
});
</script>
<template>
  <TresMesh v-if="!isLoading">
    <TresIcosahedronGeometry :args="[1, 64]" />
    <TresShaderMaterial v-bind="shader" />
  </TresMesh>
</template>
