<script setup>
import { WebGLCubeRenderTarget, HalfFloatType, CubeCamera, ACESFilmicToneMapping } from 'three'
import { LightProbeGenerator } from 'three/addons/lights/LightProbeGenerator.js'
import { LightProbeHelper } from 'three/addons/helpers/LightProbeHelper.js'
import { useTres } from '@tresjs/core'
import { shallowRef, watch, onUnmounted } from 'vue'
import { Pane } from 'tweakpane'
import CornelBox from '@/components/internals/CornelBox.vue'

const { renderer, scene } = useTres()
const sphereRef = shallowRef()

const params = {
  probeIntensity: 2,
  envIntensity: 1,
  showHelper: true,
  roughness: 0.25,
  metalness: 1,
}

let lp, helper, pane

watch(sphereRef, async (mesh) => {
  if (!mesh) return

  const s = scene.value

  const cubeRenderTarget = new WebGLCubeRenderTarget(256, { type: HalfFloatType })
  const cubeCamera = new CubeCamera(0.1, 100, cubeRenderTarget)
  cubeCamera.position.set(0, 7.5, 0)
  s.add(cubeCamera)
  cubeCamera.update(renderer, s)
  s.remove(cubeCamera)

  renderer.toneMapping = ACESFilmicToneMapping

  lp = await LightProbeGenerator.fromCubeRenderTarget(renderer, cubeRenderTarget)
  lp.intensity = params.probeIntensity
  s.add(lp)

  s.environment = cubeRenderTarget.texture
  s.environmentIntensity = params.envIntensity

  // LightProbeHelper renders a small sphere shaded purely by the probe's SH coefficients.
  // Its surface shows you the directional color distribution the probe captured —
  // red hemisphere on the left, green on the right, white from above.
  helper = new LightProbeHelper(lp, 1.5)
  helper.position.set(0, 7.5, 0) // same position as the cube camera bake point
  s.add(helper)

  // --- Tweakpane ---
  pane = new Pane({ title: 'Light Probe' })

  pane.addBinding(params, 'probeIntensity', { label: 'probe intensity', min: 0, max: 5, step: 0.05 })
    .on('change', ({ value }) => { lp.intensity = value })

  // environmentIntensity scales the specular IBL (scene.environment) independently
  // from the probe. Useful to balance diffuse bleed vs. specular reflections.
  pane.addBinding(params, 'envIntensity', { label: 'env (specular) intensity', min: 0, max: 3, step: 0.05 })
    .on('change', ({ value }) => { s.environmentIntensity = value })

  pane.addBinding(params, 'showHelper', { label: 'show helper' })
    .on('change', ({ value }) => { helper.visible = value })

  const matFolder = pane.addFolder({ title: 'Sphere material' })

  // Roughness is the most educational knob here:
  // at 0 the sphere is a perfect mirror showing the env map (specular IBL).
  // at 1 it's fully diffuse and shows only the probe's SH color bleed.
  matFolder.addBinding(params, 'roughness', { min: 0, max: 1, step: 0.01 })
    .on('change', ({ value }) => { mesh.material.roughness = value })

  matFolder.addBinding(params, 'metalness', { min: 0, max: 1, step: 0.01 })
    .on('change', ({ value }) => { mesh.material.metalness = value })
})

onUnmounted(() => {
  pane?.dispose()
  if (helper) scene.value.remove(helper)
  if (lp) scene.value.remove(lp)
})
</script>

<template>
  <CornelBox />

  <TresMesh ref="sphereRef" :position="[0, 4, 0]">
    <TresSphereGeometry :args="[1, 64, 64]" />
    <TresMeshStandardMaterial color="#ffffff" :roughness="params.roughness" :metalness="params.metalness" />
  </TresMesh>
</template>
