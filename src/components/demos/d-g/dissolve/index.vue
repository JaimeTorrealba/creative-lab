<script setup>
import { watch, reactive, onUnmounted } from 'vue'
import { useTexture } from '@tresjs/cientos'
import fragment from './fragment.glsl'
import { LinearFilter, RepeatWrapping } from 'three'
import { Pane } from 'tweakpane'

const options = reactive({
  alphaThreshold: 0.5,
  borderSize: 0.05,
  textureScale: 1
})

const pane = new Pane()
pane.addBinding(options, 'alphaThreshold', { min: 0, max: 1 }).on('change', () => {
  shader.uniforms.uAlphaThreshold.value = options.alphaThreshold
})
pane.addBinding(options, 'borderSize', { min: 0, max: 0.1 }).on('change', () => {
  shader.uniforms.uBorderSize.value = options.borderSize
})
pane.addBinding(options, 'textureScale', { min: 0, max: 5 }).on('change', () => {
  shader.uniforms.uTextureScale.value = options.textureScale
})

const { state: texture, isLoading } = useTexture('/perlin.png')

const shader = {
  uniforms: {
    uTexture: { value: texture },
    uAlphaThreshold: { value: options.alphaThreshold },
    uBorderSize: { value: options.borderSize },
    uTextureScale: { value: options.textureScale }
  },
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: fragment,
  transparent: true
  // side: DoubleSide,
}

onUnmounted(() => pane?.dispose())

watch(texture, (_tex) => {
  if (_tex) {
    _tex.wrapS = RepeatWrapping
    _tex.wrapT = RepeatWrapping
    _tex.minFilter = _tex.magFilter = LinearFilter
    shader.uniforms.uTexture.value = _tex
  }
})
</script>
<template>
  <TresMesh v-if="!isLoading">
    <TresIcosahedronGeometry :args="[1, 64]" />
    <TresShaderMaterial v-bind="shader" />
  </TresMesh>
</template>
