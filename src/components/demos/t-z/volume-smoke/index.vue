<script setup>
import { onBeforeUnmount } from 'vue'
import {
  Data3DTexture,
  RedFormat,
  LinearFilter,
  RepeatWrapping,
  NeutralToneMapping,
  VolumeNodeMaterial,
  Mesh,
  BoxGeometry,
  TorusKnotGeometry,
  MeshStandardMaterial,
  DoubleSide,
  PlaneGeometry,
  PointLight,
  SpotLight,
  PostProcessing,
  Layers
} from 'three/webgpu'
import { vec3, Fn, time, texture3D, screenUV, uniform, screenCoordinate, pass } from 'three/tsl'
import { bayer16 } from 'three/addons/tsl/math/Bayer.js'
import { gaussianBlur } from 'three/addons/tsl/display/GaussianBlurNode.js'
import { ImprovedNoise } from 'three/addons/math/ImprovedNoise.js'
import { useLoop, useTres } from '@tresjs/core'
import { Pane } from 'tweakpane'

const LAYER_VOLUMETRIC = 10

// -------------------------------------------------- 3D Perlin noise texture
function createTexture3D() {
  const size = 128
  const data = new Uint8Array(size * size * size)
  const scale = 10
  const perlin = new ImprovedNoise()
  const repeatFactor = 5.0
  let i = 0

  for (let z = 0; z < size; z++) {
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const nx = (x / size) * repeatFactor
        const ny = (y / size) * repeatFactor
        const nz = (z / size) * repeatFactor
        data[i++] = 128 + 128 * perlin.noise(nx * scale, ny * scale, nz * scale)
      }
    }
  }

  const tex = new Data3DTexture(data, size, size, size)
  tex.format = RedFormat
  tex.minFilter = LinearFilter
  tex.magFilter = LinearFilter
  tex.wrapS = RepeatWrapping
  tex.wrapT = RepeatWrapping
  tex.unpackAlignment = 1
  tex.needsUpdate = true
  return tex
}

// -------------------------------------------------- Context
const { scene, camera, renderer } = useTres()

renderer.shadowMap.enabled = true
renderer.toneMapping = NeutralToneMapping
renderer.toneMappingExposure = 2

// -------------------------------------------------- Volumetric material
const noiseTexture3D = createTexture3D()
const smokeAmount = uniform(2)

const volumetricMaterial = new VolumeNodeMaterial()
volumetricMaterial.steps = 12
volumetricMaterial.offsetNode = bayer16(screenCoordinate)
volumetricMaterial.scatteringNode = Fn(({ positionRay }) => {
  const timeScaled = vec3(time, 0, time.mul(0.3))
  const sampleGrain = (sc, timeScale = 1) =>
    texture3D(noiseTexture3D, positionRay.add(timeScaled.mul(timeScale)).mul(sc).mod(1), 0).r.add(
      0.5
    )

  let density = sampleGrain(0.1)
  density = density.mul(sampleGrain(0.05, 1))
  density = density.mul(sampleGrain(0.02, 2))
  return smokeAmount.mix(1, density)
})

// -------------------------------------------------- Scene objects
const volumetricMesh = new Mesh(new BoxGeometry(20, 10, 20), volumetricMaterial)
volumetricMesh.receiveShadow = true
volumetricMesh.position.y = 2
volumetricMesh.layers.disableAll()
volumetricMesh.layers.enable(LAYER_VOLUMETRIC)
scene.value.add(volumetricMesh)

const torusKnot = new Mesh(
  new TorusKnotGeometry(0.8, 0.3, 100, 16),
  new MeshStandardMaterial({ color: 0xffffff, side: DoubleSide })
)
torusKnot.castShadow = true
scene.value.add(torusKnot)

const floor = new Mesh(new PlaneGeometry(100, 100), new MeshStandardMaterial({ color: 0xffffff }))
floor.rotation.x = -Math.PI / 2
floor.position.y = -3
floor.receiveShadow = true
scene.value.add(floor)

// -------------------------------------------------- Lights
const pointLight = new PointLight(0xf9bb50, 3, 100)
pointLight.castShadow = true
pointLight.position.set(0, 1.4, 0)
pointLight.layers.enable(LAYER_VOLUMETRIC)
scene.value.add(pointLight)

const spotLight = new SpotLight(0xffffff, 100)
spotLight.position.set(2.5, 5, 2.5)
spotLight.angle = Math.PI / 6
spotLight.penumbra = 1
spotLight.decay = 2
spotLight.distance = 0
spotLight.castShadow = true
spotLight.shadow.intensity = 0.98
spotLight.shadow.mapSize.width = 1024
spotLight.shadow.mapSize.height = 1024
spotLight.shadow.camera.near = 1
spotLight.shadow.camera.far = 15
spotLight.shadow.focus = 1
spotLight.layers.enable(LAYER_VOLUMETRIC)
scene.value.add(spotLight)

// -------------------------------------------------- Post-processing
const postProcessing = new PostProcessing(renderer)

const volumetricLightingIntensity = uniform(1)

const volumetricLayer = new Layers()
volumetricLayer.disableAll()
volumetricLayer.enable(LAYER_VOLUMETRIC)

const scenePass = pass(scene.value, camera.value)
const sceneDepth = scenePass.getTextureNode('depth')

volumetricMaterial.depthNode = sceneDepth.sample(screenUV)

const volumetricPass = pass(scene.value, camera.value, { depthBuffer: false })
volumetricPass.setLayers(volumetricLayer)
volumetricPass.setResolutionScale(0.25)

const denoiseStrength = uniform(0.6)
const blurredVolumetricPass = gaussianBlur(volumetricPass, denoiseStrength)

const scenePassColor = scenePass.add(blurredVolumetricPass.mul(volumetricLightingIntensity))
postProcessing.outputNode = scenePassColor

// -------------------------------------------------- Tweakpane
const pane = new Pane()

const params = {
  resolution: volumetricPass.getResolutionScale(),
  denoise: true
}

const rayFolder = pane.addFolder({ title: 'Ray Marching' })
rayFolder
  .addBinding(params, 'resolution', { min: 0.1, max: 1, step: 0.05, label: 'resolution' })
  .on('change', ({ value }) => volumetricPass.setResolutionScale(value))

rayFolder.addBinding(volumetricMaterial, 'steps', {
  min: 2,
  max: 16,
  step: 1,
  label: 'step count'
})

rayFolder.addBinding(denoiseStrength, 'value', {
  min: 0,
  max: 1,
  step: 0.01,
  label: 'denoise strength'
})

rayFolder.addBinding(params, 'denoise', { label: 'denoise' }).on('change', ({ value }) => {
  const volumetric = value ? blurredVolumetricPass : volumetricPass
  postProcessing.outputNode = scenePass.add(volumetric.mul(volumetricLightingIntensity))
  postProcessing.needsUpdate = true
})

const lightFolder = pane.addFolder({ title: 'Lighting / Scene' })
lightFolder.addBinding(pointLight, 'intensity', { min: 0, max: 6, label: 'point intensity' })
lightFolder.addBinding(spotLight, 'intensity', { min: 0, max: 200, label: 'spot intensity' })
lightFolder.addBinding(volumetricLightingIntensity, 'value', {
  min: 0,
  max: 2,
  label: 'fog intensity'
})
lightFolder.addBinding(smokeAmount, 'value', { min: 0, max: 3, label: 'smoke amount' })

// -------------------------------------------------- Loop
const { render, onBeforeRender } = useLoop()

onBeforeRender(({ elapsed }) => {
  const t = elapsed
  const sc = 2.4

  pointLight.position.x = Math.sin(t * 0.7) * sc
  pointLight.position.y = Math.cos(t * 0.5) * sc
  pointLight.position.z = Math.cos(t * 0.3) * sc

  spotLight.position.x = Math.cos(t * 0.3) * sc
  spotLight.lookAt(0, 0, 0)

  torusKnot.rotation.y = t * 0.2
})

render((notifySuccess) => {
  postProcessing.render()
  notifySuccess()
})

// -------------------------------------------------- Cleanup
onBeforeUnmount(() => {
  pane.dispose()
  scene.value.remove(volumetricMesh, torusKnot, floor, pointLight, spotLight)
  noiseTexture3D.dispose()
  volumetricMaterial.dispose()
})
</script>

<template>
  <!-- scene built imperatively; this group is a required placeholder -->
  <TresGroup />
</template>
