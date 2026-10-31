<script setup>
import { watch, onUnmounted, shallowRef } from 'vue'
import { useLoop, useTres } from '@tresjs/core'
import { useTexture } from '@tresjs/cientos'
import { Color, MeshStandardNodeMaterial, RepeatWrapping, LinearFilter } from 'three/webgpu'
import { uniform, wgslFn, uv, texture } from 'three/tsl'
import { Pane } from 'tweakpane'
import {
  createGpuEdgeParticles,
  createParticleUniforms
} from '../dissolve-shared/gpuEdgeParticles'
import { createEmissiveBloom } from '../dissolve-shared/gpuEmissiveBloom'
import { addGlowBindings } from '../dissolve-shared/glowPane'

const uBorderSize = uniform(0.03)
const uAlphaThreshold = uniform(0.5)
const uTextureScale = uniform(1.0)
const uGlowColor = uniform(new Color().setRGB(0.15, 0.15, 0.96))
const uGlowIntensity = uniform(3)
const uBloomStrength = uniform(1.2)
const particleUniforms = createParticleUniforms()
const particles = shallowRef()
const material = new MeshStandardNodeMaterial()

const { state: colorTex } = useTexture('/textures/8k_earth_daymap.jpg')
const { state: tex, isLoading } = useTexture('/perlin.png')

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
`)

// 1 inside the burning border (still visible, but not yet past it), 0 elsewhere
const dissolveBorder = wgslFn(`
  fn dissolveBorder(noiseVal: f32, alphaThreshold: f32, borderSize: f32) -> f32 {
    let visible: f32 = select(0.0, 1.0, noiseVal >= alphaThreshold);
    return visible * (1.0 - step(alphaThreshold + borderSize, noiseVal));
  }
`)

watch(tex, (_tex) => {
  if (_tex) {
    _tex.wrapS = _tex.wrapT = RepeatWrapping
    _tex.minFilter = LinearFilter

    const noiseVal = texture(_tex, uv().mul(uTextureScale)).r
    const colorRgb = texture(colorTex.value, uv()).rgb

    material.colorNode = dissolve({
      noiseVal,
      colorRgb,
      alphaThreshold: uAlphaThreshold,
      borderSize: uBorderSize
    })
    material.emissiveNode = uGlowColor.mul(uGlowIntensity).mul(
      dissolveBorder({ noiseVal, alphaThreshold: uAlphaThreshold, borderSize: uBorderSize })
    )
    material.transparent = true
    // Discard dissolved fragments so they don't write depth over the sparks behind them
    material.alphaTest = 0.5

    particles.value = createGpuEdgeParticles({
      count: 20000,
      particles: particleUniforms,
      borderAt: (spawnUv) =>
        dissolveBorder({
          noiseVal: texture(_tex, spawnUv.mul(uTextureScale)).r,
          alphaThreshold: uAlphaThreshold,
          borderSize: uBorderSize
        }),
      glowColor: uGlowColor,
      glowIntensity: uGlowIntensity
    })
  }
})

const pane = new Pane()

pane.addBinding(uBorderSize, 'value', {
  min: 0,
  max: 0.03,
  step: 0.01,
  label: 'border size'
})
pane.addBinding(uAlphaThreshold, 'value', {
  min: 0,
  max: 1,
  step: 0.01,
  label: 'alpha threshold'
})
pane.addBinding(uTextureScale, 'value', {
  min: 0,
  max: 5,
  step: 0.1,
  label: 'texture scale'
})

addGlowBindings(pane, {
  glowColor: uGlowColor,
  glowIntensity: uGlowIntensity,
  particles: particleUniforms
}).addBinding(uBloomStrength, 'value', { label: 'bloom', min: 0, max: 5 })

const { renderer, scene, camera } = useTres()
let bloom
const { render } = useLoop()
render((notifySuccess) => {
  if (camera.value) {
    bloom ??= createEmissiveBloom({
      renderer,
      scene: scene.value,
      camera: camera.value,
      strength: uBloomStrength
    })
    bloom.pipeline.render()
  }
  notifySuccess()
})

onUnmounted(() => {
  pane?.dispose()
  particles.value?.dispose()
  bloom?.dispose()
})
</script>
<template>
  <TresMesh v-if="!isLoading" :material="material">
    <TresIcosahedronGeometry :args="[1, 64]" />
  </TresMesh>
  <primitive v-if="particles" :object="particles.sprite" />
</template>
