<script setup>
import { onUnmounted, shallowRef, watch } from 'vue'
import { AdditiveBlending, Color, ShaderMaterial, Uniform } from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { useLoop, useTres } from '@tresjs/core'
import vertex from './vertex.glsl'
import fragment from './fragment.glsl'
import { DEFAULT_BLOOM, DEFAULT_PARAMS, MODEL_URL, SHAPES } from './constants'
import { createShapeGeometry } from './particleSampler'
import {
  createParticleSimulation,
  disposeParticleSimulation,
  getSimulationTextures,
  pushParticlesFrom,
  stepParticleSimulation
} from './particleSimulation'
import { createMotionBloomComposer } from './motionBloomComposer'
import { createDreamyParticlesPane } from './pane'

const params = { ...DEFAULT_PARAMS }
const bloom = structuredClone(DEFAULT_BLOOM)
const { renderer, scene, camera, sizes } = useTres()
const { scene: model } = await new GLTFLoader().loadAsync(MODEL_URL)

const shapeGeometry = shallowRef(createShapeGeometry(model, SHAPES[params.shape]))
let simulation = createParticleSimulation(renderer, shapeGeometry.value, params.textureSize)
const particleGeometry = shallowRef(simulation.particleGeometry)

const rebuildParticles = () => {
  const previousShapeGeometry = shapeGeometry.value
  disposeParticleSimulation(simulation)

  shapeGeometry.value = createShapeGeometry(model, SHAPES[params.shape])
  simulation = createParticleSimulation(renderer, shapeGeometry.value, params.textureSize)
  particleGeometry.value = simulation.particleGeometry
  previousShapeGeometry.dispose()
}

const particleMaterial = new ShaderMaterial({
  vertexShader: vertex,
  fragmentShader: fragment,
  uniforms: {
    uPositionTexture: new Uniform(null),
    uVelocityTexture: new Uniform(null),
    uParticleSize: new Uniform(params.size),
    uColor: new Uniform(new Color(params.color)),
    uMinAlpha: new Uniform(params.minAlpha),
    uMaxAlpha: new Uniform(params.maxAlpha)
  },
  blending: AdditiveBlending,
  transparent: true,
  depthWrite: false,
  depthTest: false
})

const syncParticleUniforms = () => {
  const { uniforms } = particleMaterial
  const textures = getSimulationTextures(simulation)
  uniforms.uPositionTexture.value = textures.position
  uniforms.uVelocityTexture.value = textures.velocity
  uniforms.uParticleSize.value = params.size
  uniforms.uMinAlpha.value = params.minAlpha
  uniforms.uMaxAlpha.value = params.maxAlpha
}

const updateParticleColor = () => particleMaterial.uniforms.uColor.value.set(params.color)

const pane = createDreamyParticlesPane(params, bloom, {
  onRebuild: rebuildParticles,
  onColorChange: updateParticleColor
})

const composer = createMotionBloomComposer({
  renderer,
  scene: scene.value,
  camera: camera.value,
  bloom
})

watch(
  [sizes.width, sizes.height, sizes.pixelRatio],
  ([width, height, pixelRatio]) => {
    if (!width || !height) return
    composer.setSize(width, height, pixelRatio)
  },
  { immediate: true }
)

const onPointerMove = (ev) => pushParticlesFrom(simulation, ev.point)

const { onBeforeRender, render } = useLoop()

onBeforeRender(() => {
  stepParticleSimulation(simulation, params)
  syncParticleUniforms()
})

render((notifySuccess) => {
  composer.renderWithBloom()
  notifySuccess()
})

onUnmounted(() => {
  pane.dispose()
  composer.dispose()
  disposeParticleSimulation(simulation)
  shapeGeometry.value.dispose()
  particleMaterial.dispose()
})
</script>

<template>
  <TresPoints :geometry="particleGeometry" :material="particleMaterial" :frustum-culled="false" />
  <TresMesh :geometry="shapeGeometry" @pointermove="onPointerMove">
    <TresMeshBasicMaterial :visible="false" />
  </TresMesh>
</template>
