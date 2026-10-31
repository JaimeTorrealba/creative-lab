<script setup>
import { watch, onUnmounted, shallowRef } from 'vue'
import { useLoop, useTres } from '@tresjs/core'
import { useTexture } from '@tresjs/cientos'
import { Color, MeshStandardNodeMaterial, RepeatWrapping, LinearFilter } from 'three/webgpu'
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
  uv
} from 'three/tsl'
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

watch(tex, (_tex) => {
  if (_tex) {
    _tex.wrapS = _tex.wrapT = RepeatWrapping
    _tex.minFilter = LinearFilter
    material.colorNode = texture(
      _tex,
      vec2(mul(uv().x, uTextureScale), mul(uv().y, uTextureScale))
    ).r
    const colorMap = texture(colorTex.value, uv())

    const mask = step(add(uAlphaThreshold, uBorderSize), material.colorNode)

    const alpha = select(lessThan(material.colorNode, uAlphaThreshold), float(0.0), float(1.0))

    const color1 = vec3(0.0)
    const color2 = colorMap.rgb
    const finalColor = vec4(mix(color1, color2, mask), alpha)
    material.colorNode = finalColor
    material.emissiveNode = uGlowColor.mul(uGlowIntensity).mul(alpha).mul(mask.oneMinus())
    material.transparent = true
    // Discard dissolved fragments so they don't write depth over the sparks behind them
    material.alphaTest = 0.5

    particles.value = createGpuEdgeParticles({
      count: 20000,
      particles: particleUniforms,
      borderAt: (spawnUv) => {
        const noise = texture(_tex, spawnUv.mul(uTextureScale)).r
        const pastBorder = step(add(uAlphaThreshold, uBorderSize), noise)
        return step(uAlphaThreshold, noise).mul(pastBorder.oneMinus())
      },
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
