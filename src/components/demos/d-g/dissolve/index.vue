<script setup>
import { watch, reactive, onUnmounted } from 'vue'
import { useLoop, useTres } from '@tresjs/core'
import { useTexture } from '@tresjs/cientos'
import { EffectComposerPmndrs, BloomPmndrs } from '@tresjs/post-processing'
import fragment from './fragment.glsl'
import { Color, LinearFilter, RepeatWrapping } from 'three'
import { Pane } from 'tweakpane'
import { createEdgeParticles } from './edgeParticles'
import { addGlowBindings } from '../dissolve-shared/glowPane'

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
    uTextureScale: { value: options.textureScale },
    uGlowColor: { value: new Color().setRGB(0.15, 0.15, 0.96) },
    uGlowIntensity: { value: 6 }
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

const particleUniforms = {
  uTime: { value: 0 },
  uPixelRatio: { value: 1 },
  uParticleSize: { value: 30 },
  uParticleSpeed: { value: 0.6 },
  uParticleDistance: { value: 0.6 }
}
const particles = createEdgeParticles({
  count: 20000,
  uniforms: { ...shader.uniforms, ...particleUniforms }
})

const bloom = reactive({ intensity: 1.5, threshold: 0.9 })

const glowFolder = addGlowBindings(pane, {
  glowColor: shader.uniforms.uGlowColor,
  glowIntensity: shader.uniforms.uGlowIntensity,
  particles: {
    size: particleUniforms.uParticleSize,
    speed: particleUniforms.uParticleSpeed,
    distance: particleUniforms.uParticleDistance
  }
})
glowFolder.addBinding(bloom, 'intensity', { label: 'bloom', min: 0, max: 5 })
glowFolder.addBinding(bloom, 'threshold', { label: 'bloom threshold', min: 0, max: 2 })

const { renderer } = useTres()
const { onBeforeRender } = useLoop()
onBeforeRender(({ elapsed }) => {
  particleUniforms.uTime.value = elapsed
  particleUniforms.uPixelRatio.value = renderer.getPixelRatio()
})

onUnmounted(() => {
  pane?.dispose()
  particles.dispose()
})

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
  <primitive v-if="!isLoading" :object="particles.points" />
  <Suspense>
    <EffectComposerPmndrs>
      <BloomPmndrs
        :intensity="bloom.intensity"
        :luminance-threshold="bloom.threshold"
        :luminance-smoothing="0.1"
        mipmap-blur
      />
    </EffectComposerPmndrs>
  </Suspense>
</template>
