<script setup>
import { reactive, onUnmounted } from 'vue'
import { useLoop, useTres } from '@tresjs/core'
import { useTextures } from '@tresjs/cientos'
import { watchOnce } from '@vueuse/core'
import {
  GLSL3,
  MeshStandardMaterial,
  PlaneGeometry,
  RepeatWrapping,
  ShaderMaterial,
  SRGBColorSpace,
  Vector3
} from 'three'
import { Pane } from 'tweakpane'
import vertex from './vertex.glsl'
import simpleFragment from './simple_fragment.glsl'
import steepFragment from './steep_fragment.glsl'
import occlusionFragment from './occlusion_fragment.glsl'
import reliefFragment from './relief_fragment.glsl'
import perPixelVertex from './per_pixel_vertex.glsl'
import perPixelFragment from './per_pixel_fragment.glsl'
import { createDistanceField } from './distanceField'

const path = '/textures/floor_rocks/Ground_Wet_Rocks_001_'

const PLANE_SIZE = 2
const FLAT = [-Math.PI / 2, 0, 0]
const FIELD = { width: 128, height: 128, depth: 64 }

// normalize(tanEyeVec) has to come out as a unit vector in voxel space, since that is the
// space the stored distances are measured in. So the ratio between the normal component and
// the lateral ones carries both the world-to-uv scale of the plane and the shape of the voxel
// grid — leave the second factor out and the ray marches far too steeply to need iterating.
const invBumpDepth = (bumpDepth) => (PLANE_SIZE / bumpDepth) * (FIELD.depth / FIELD.width)

// The five shader planes light themselves from here; the plain plane gets a matching
// TresDirectionalLight so the only difference between it and its neighbours is the parallax.
const LIGHT_POS = [4, 5, 4]
const lightPos = new Vector3(...LIGHT_POS)

const { textures, isLoading } = useTextures([
  `${path}basecolor.jpg`,
  `${path}normal.jpg`,
  `${path}height.png`,
  `${path}roughness.jpg`
])

let distanceTexture

watchOnce(isLoading, (newVal) => {
  if (!newVal) {
    textures.value.forEach((texture) => {
      // Wrapping matters: every technique here walks its uv outside [0, 1] at grazing angles.
      // Repeat does not — the shader planes sample plain uv, so tiling here would only put
      // the plain plane on a different scale from the five it is meant to be compared with.
      texture.wrapS = RepeatWrapping
      texture.wrapT = RepeatWrapping
    })

    // Only the basecolor carries colour; normal, height and roughness are data and have to
    // stay linear. three uploads an sRGB texture as SRGB8_ALPHA8, so the GPU decodes this one
    // on sample for the hand-written shaders too, not just for the MeshStandardMaterial.
    textures.value[0].colorSpace = SRGBColorSpace
    textures.value[0].needsUpdate = true

    plainMaterial.map = textures.value[0]
    plainMaterial.normalMap = textures.value[1]
    plainMaterial.roughnessMap = textures.value[3]
    plainMaterial.needsUpdate = true

    simpleParallaxMaterial.uniforms.uDiffuseMap.value = textures.value[0]
    simpleParallaxMaterial.uniforms.uNormalMap.value = textures.value[1]
    simpleParallaxMaterial.uniforms.uHeightMap.value = textures.value[2]

    steepParallaxMaterial.uniforms.uDiffuseMap.value = textures.value[0]
    steepParallaxMaterial.uniforms.uNormalMap.value = textures.value[1]
    steepParallaxMaterial.uniforms.uHeightMap.value = textures.value[2]

    occlusionParallaxMaterial.uniforms.uDiffuseMap.value = textures.value[0]
    occlusionParallaxMaterial.uniforms.uNormalMap.value = textures.value[1]
    occlusionParallaxMaterial.uniforms.uHeightMap.value = textures.value[2]

    reliefParallaxMaterial.uniforms.uDiffuseMap.value = textures.value[0]
    reliefParallaxMaterial.uniforms.uNormalMap.value = textures.value[1]
    reliefParallaxMaterial.uniforms.uHeightMap.value = textures.value[2]

    const { texture, normalizationFactor } = createDistanceField(textures.value[2], FIELD)
    distanceTexture = texture
    perPixelParallaxMaterial.uniforms.uDiffuseMap.value = textures.value[0]
    perPixelParallaxMaterial.uniforms.uNormalMap.value = textures.value[1]
    perPixelParallaxMaterial.uniforms.uDistanceMap.value = texture
    perPixelParallaxMaterial.uniforms.uNormalizationFactor.value = normalizationFactor
  }
})

const planeGeometry = new PlaneGeometry(PLANE_SIZE, PLANE_SIZE, 32, 32)
// The shader planes build their tangent frame from this attribute rather than assuming one.
planeGeometry.computeTangents()

// The "before" picture: same maps, no parallax of any kind. Just normal mapping, which is
// what every technique here is trying to improve on.
const plainMaterial = new MeshStandardMaterial()

const simpleParallaxMaterial = new ShaderMaterial({
  uniforms: {
    uDiffuseMap: { value: null },
    uNormalMap: { value: null },
    uHeightMap: { value: null },
    uHeightScale: { value: 0.1 },
    uLightPos: { value: lightPos },
    uViewPos: { value: new Vector3() }
  },
  vertexShader: vertex,
  fragmentShader: simpleFragment
})

const steepParallaxMaterial = new ShaderMaterial({
  uniforms: {
    uDiffuseMap: { value: null },
    uNormalMap: { value: null },
    uHeightMap: { value: null },
    uHeightScale: { value: 0.1 },
    uLightPos: { value: lightPos },
    uViewPos: { value: new Vector3() }
  },
  vertexShader: vertex,
  fragmentShader: steepFragment
})

const occlusionParallaxMaterial = new ShaderMaterial({
  uniforms: {
    uDiffuseMap: { value: null },
    uNormalMap: { value: null },
    uHeightMap: { value: null },
    uHeightScale: { value: 0.1 },
    uLightPos: { value: lightPos },
    uViewPos: { value: new Vector3() }
  },
  vertexShader: vertex,
  fragmentShader: occlusionFragment
})

const reliefParallaxMaterial = new ShaderMaterial({
  uniforms: {
    uDiffuseMap: { value: null },
    uNormalMap: { value: null },
    uHeightMap: { value: null },
    uHeightScale: { value: 0.1 },
    uLightPos: { value: lightPos },
    uViewPos: { value: new Vector3() }
  },
  vertexShader: vertex,
  fragmentShader: reliefFragment
})

// sampler3D needs GLSL3; this one also scales the normal component of its view vector by the
// bump depth, so it carries its own vertex shader rather than the one the other four share.
const perPixelParallaxMaterial = new ShaderMaterial({
  glslVersion: GLSL3,
  uniforms: {
    uDiffuseMap: { value: null },
    uNormalMap: { value: null },
    uDistanceMap: { value: null },
    uNormalizationFactor: { value: new Vector3(1, 1, 1) },
    uInvBumpDepth: { value: invBumpDepth(0.3) },
    uIterations: { value: 16 },
    uLightPos: { value: lightPos }
  },
  vertexShader: perPixelVertex,
  fragmentShader: perPixelFragment
})

const { camera } = useTres()

onUnmounted(() => {
  pane?.dispose()
  distanceTexture?.dispose()
  planeGeometry.dispose()
  plainMaterial.dispose()
})

const { onBeforeRender } = useLoop()
onBeforeRender(() => {
  simpleParallaxMaterial.uniforms.uViewPos.value.copy(camera.value.position)
  steepParallaxMaterial.uniforms.uViewPos.value.copy(camera.value.position)
  occlusionParallaxMaterial.uniforms.uViewPos.value.copy(camera.value.position)
  reliefParallaxMaterial.uniforms.uViewPos.value.copy(camera.value.position)
})

const options = reactive({
  simpleParallaxHeightScale: 0.1,
  steepParallaxHeightScale: 0.1,
  occlusionParallaxHeightScale: 0.1,
  reliefParallaxHeightScale: 0.1,
  perPixelBumpDepth: 0.3,
  perPixelIterations: 16
})

const pane = new Pane()
const parallaxFolder = pane.addFolder({ title: 'Simple Parallax mapping' })
parallaxFolder
  .addBinding(options, 'simpleParallaxHeightScale', {
    label: 'height scale',
    min: 0,
    max: 2,
    step: 0.01
  })
  .on('change', ({ value }) => {
    simpleParallaxMaterial.uniforms.uHeightScale.value = value
  })
const steepParallaxFolder = pane.addFolder({ title: 'Steep Parallax mapping' })
steepParallaxFolder
  .addBinding(options, 'steepParallaxHeightScale', {
    label: 'height scale',
    min: 0,
    max: 1,
    step: 0.01
  })
  .on('change', ({ value }) => {
    steepParallaxMaterial.uniforms.uHeightScale.value = value
  })

const occlusionParallaxFolder = pane.addFolder({ title: 'Occlusion Parallax mapping' })
occlusionParallaxFolder
  .addBinding(options, 'occlusionParallaxHeightScale', {
    label: 'height scale',
    min: -1,
    max: 1,
    step: 0.01
  })
  .on('change', ({ value }) => {
    occlusionParallaxMaterial.uniforms.uHeightScale.value = value
  })

const reliefParallaxFolder = pane.addFolder({ title: 'Relief mapping' })
reliefParallaxFolder
  .addBinding(options, 'reliefParallaxHeightScale', {
    label: 'height scale',
    min: 0,
    max: 1,
    step: 0.01
  })
  .on('change', ({ value }) => {
    reliefParallaxMaterial.uniforms.uHeightScale.value = value
  })

const perPixelParallaxFolder = pane.addFolder({ title: 'Per-Pixel Displacement (distances)' })
perPixelParallaxFolder
  .addBinding(options, 'perPixelBumpDepth', {
    label: 'bump depth',
    min: 0.02,
    max: 2,
    step: 0.01
  })
  .on('change', ({ value }) => {
    perPixelParallaxMaterial.uniforms.uInvBumpDepth.value = invBumpDepth(value)
  })
perPixelParallaxFolder
  .addBinding(options, 'perPixelIterations', {
    label: 'iterations',
    min: 1,
    max: 64,
    step: 1
  })
  .on('change', ({ value }) => {
    perPixelParallaxMaterial.uniforms.uIterations.value = value
  })
</script>
<template>
  <TresDirectionalLight :position="LIGHT_POS" :intensity="2.5" />
  <TresMesh
    :geometry="planeGeometry"
    :material="plainMaterial"
    :position="[-3, 0, -1.5]"
    :rotation="FLAT"
  />
  <TresMesh
    :geometry="planeGeometry"
    :material="simpleParallaxMaterial"
    :position="[0, 0, -1.5]"
    :rotation="FLAT"
  />
  <TresMesh
    :geometry="planeGeometry"
    :material="steepParallaxMaterial"
    :position="[3, 0, -1.5]"
    :rotation="FLAT"
  />
  <TresMesh
    :geometry="planeGeometry"
    :material="occlusionParallaxMaterial"
    :position="[-3, 0, 1.5]"
    :rotation="FLAT"
  />
  <TresMesh
    :geometry="planeGeometry"
    :material="reliefParallaxMaterial"
    :position="[0, 0, 1.5]"
    :rotation="FLAT"
  />
  <TresMesh
    :geometry="planeGeometry"
    :material="perPixelParallaxMaterial"
    :position="[3, 0, 1.5]"
    :rotation="FLAT"
  />
</template>
