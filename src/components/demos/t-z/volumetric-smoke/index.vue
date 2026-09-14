<script setup>
import { shallowRef, watch, reactive, onUnmounted } from 'vue'
import { useLoop, useTres } from '@tresjs/core'
import { useTexture } from '@tresjs/cientos'
import * as THREE from 'three'
import { VolumetricMaskController } from './utils'
import VERTEX_SHADER from './vertex.glsl'
import FRAGMENT_SHADER from './fragment.glsl'
import { useWindowSize, watchOnce } from '@vueuse/core'
import { Pane } from 'tweakpane'

const pane = new Pane()

const parameters = reactive({
  textureSize: 96,
  cloudCoverage: 0.55,
  cloudSoftness: 0.05,
  noiseScale: 3.5,
  octaves: 5,
  persistence: 0.5,
  lacunarity: 3.0,
  noiseIntensity: 1.0,
  seed: Math.random() * 1000.0,
  textureTiling: 2.0,
  densityThreshold: 0.5,
  densityMultiplier: 5.0,
  opacity: 6.0,
  raymarchSteps: 44,
  lightSteps: 1,
  containerScale: 512.0,
  isAnimating: true,
  animationSpeedX: 0.2,
  animationSpeedY: 0.0,
  animationSpeedZ: 0.01,
  ambientLightIntensity: 1.2,
  directionalLightIntensity: 2.5
})

pane.addBinding(parameters, 'animationSpeedX', {
  label: 'Animation Speed X',
  min: -1,
  max: 1,
  step: 0.01
})
pane.addBinding(parameters, 'animationSpeedY', {
  label: 'Animation Speed Y',
  min: -1,
  max: 1,
  step: 0.01
})
pane.addBinding(parameters, 'animationSpeedZ', {
  label: 'Animation Speed Z',
  min: -1,
  max: 1,
  step: 0.01
})
pane.addBinding(parameters, 'containerScale', {
  label: 'Container Scale',
  min: 0,
  max: 2024,
  step: 1
})
pane
  .addBinding(parameters, 'densityThreshold', {
    label: 'Density Threshold',
    min: 0,
    max: 1,
    step: 0.01
  })
  .on('change', () => {
    shader.uniforms.uDensityThreshold.value = parameters.densityThreshold
  })
pane.addBinding(parameters, 'isAnimating', { label: 'Is Animating' })

const { width, height } = useWindowSize()
const { camera, renderer, scene } = useTres()
const directionalLightRef = shallowRef()
const ambientLightRef = shallowRef()
const smokeRef = shallowRef()

const fallbackTexture = new THREE.DataTexture(new Uint8Array([0, 0, 0, 255]), 1, 1)
fallbackTexture.needsUpdate = true

const { state: blueNoise, isLoading } = useTexture('/textures/Cloud.png')
watchOnce(isLoading, (v) => {
  if (!v) {
    blueNoise.value.wrapS = THREE.RepeatWrapping
    blueNoise.value.wrapT = THREE.RepeatWrapping
    blueNoise.value.minFilter = THREE.NearestFilter
    blueNoise.value.magFilter = THREE.NearestFilter
    blueNoise.value.needsUpdate = true
    shader.uniforms.uBlueNoise.value = blueNoise.value
    shader.uniforms.uBlueNoiseSize.value.x = blueNoise.value.width
    shader.uniforms.uBlueNoiseSize.value.y = blueNoise.value.height
    const parametersClone = { ...parameters }
    myWorker.postMessage(parametersClone)
  }
})

const maskController = new VolumetricMaskController()

const shader = {
  uniforms: {
    ...maskController.uniforms,
    uVolumeTexture: { value: null },
    uTextureOffset: { value: new THREE.Vector3(0, 0, 0) },
    uTextureTiling: { value: parameters.textureTiling },
    uBlueNoise: { value: null },
    uBlueNoiseSize: { value: new THREE.Vector2(32, 32) },
    uResolution: { value: new THREE.Vector2(width.value, height.value) },
    cameraPos: { value: camera.value.position },
    uSunColor: { value: new THREE.Color(0xffffff) },
    uSunIntensity: { value: parameters.directionalLightIntensity },
    uLightDir: { value: new THREE.Vector3(1, 1, 1).normalize() },
    uAmbientColor: { value: new THREE.Color(0xffffff) },
    uAmbientIntensity: { value: parameters.ambientLightIntensity },
    uOpacity: { value: parameters.opacity },
    uMaxSteps: { value: parameters.raymarchSteps },
    uLightSteps: { value: parameters.lightSteps },
    uDensityThreshold: { value: parameters.densityThreshold },
    uDensityMultiplier: { value: parameters.densityMultiplier },
    uDepthTexture: { value: fallbackTexture },
    uProjectionMatrixInverse: { value: camera.value.projectionMatrixInverse },
    uViewMatrixInverse: { value: camera.value.matrixWorld },
    uModelMatrix: { value: new THREE.Matrix4() },
    uContainerScale: { value: parameters.containerScale },
    uProjectionMatrix: { value: camera.value.projectionMatrix },
    uCameraNear: { value: camera.value.near },
    uCameraFar: { value: camera.value.far },
    uOcclusionMode: { value: false }
  },
  vertexShader: VERTEX_SHADER,
  fragmentShader: FRAGMENT_SHADER,
  glslVersion: THREE.GLSL3,
  side: THREE.BackSide,
  transparent: true,
  depthWrite: false,
  depthTest: false
}

const myWorker = new Worker(new URL('./worker-smoke.js', import.meta.url))

myWorker.onmessage = (e) => {
  const size = parameters.textureSize
  const texture = new THREE.Data3DTexture(e.data, size, size, size)
  texture.format = THREE.RedFormat
  texture.minFilter = THREE.LinearFilter
  texture.magFilter = THREE.LinearFilter
  texture.unpackAlignment = 1
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.wrapR = THREE.RepeatWrapping
  texture.needsUpdate = true
  shader.uniforms.uVolumeTexture.value = texture
}

let depthTarget = new THREE.WebGLRenderTarget(width.value, height.value)
depthTarget.depthTexture = new THREE.DepthTexture(width.value, height.value)
depthTarget.depthTexture.format = THREE.DepthFormat
depthTarget.depthTexture.type = THREE.UnsignedShortType
depthTarget.depthBuffer = true
shader.uniforms.uDepthTexture.value = depthTarget.depthTexture

const animatedOffset = new THREE.Vector3()
const { onBeforeRender } = useLoop()
onBeforeRender(({ delta }) => {
  shader.uniforms.uProjectionMatrixInverse.value.copy(camera.value.projectionMatrixInverse)
  shader.uniforms.uViewMatrixInverse.value.copy(camera.value.matrixWorld)
  if (smokeRef.value) {
    shader.uniforms.uModelMatrix.value.copy(smokeRef.value.matrixWorld)
  }
  shader.uniforms.uProjectionMatrix.value.copy(camera.value.projectionMatrix)
  shader.uniforms.cameraPos.value.copy(camera.value.position)

  if (directionalLightRef.value?.position) {
    shader.uniforms.uLightDir.value.copy(directionalLightRef.value.position.clone().normalize())
  }

  if (parameters.isAnimating) {
    const dt = delta ?? 0.016
    animatedOffset.x += parameters.animationSpeedX * dt
    animatedOffset.y += parameters.animationSpeedY * dt
    animatedOffset.z += parameters.animationSpeedZ * dt
    shader.uniforms.uTextureOffset.value.copy(animatedOffset)
  }

  if (renderer && scene?.value && smokeRef.value) {
    const r = renderer
    const s = scene.value
    const prevTarget = r.getRenderTarget()
    const prevAutoClear = r.autoClear
    const prevVisible = smokeRef.value.visible
    smokeRef.value.visible = false
    r.setRenderTarget(depthTarget)
    r.autoClear = true
    r.clear(true, true, true)
    r.render(s, camera.value)
    smokeRef.value.visible = prevVisible
    r.setRenderTarget(prevTarget)
    r.autoClear = prevAutoClear
    shader.uniforms.uDepthTexture.value = depthTarget.depthTexture
  }
})

onUnmounted(() => pane?.dispose())

watch([width, height], ([w, h]) => {
  shader.uniforms.uResolution.value.set(w, h)
  if (depthTarget) {
    depthTarget.setSize(w, h)
  }
})
</script>

<template>
  <TresDirectionalLight
    ref="directionalLightRef"
    :args="[0xffffff, parameters.directionalLightIntensity]"
    :position="[1, 1, 1]"
    cast-shadow
    :shadow-camera-near="0.5"
    :shadow-camera-far="500"
    :shadow-camera-left="-50"
    :shadow-camera-right="50"
    :shadow-camera-top="50"
    :shadow-camera-bottom="-50"
    :shadow-mapSize="[2048, 2048]"
  />
  <TresAmbientLight ref="ambientLightRef" :args="[0xffffff, parameters.ambientLightIntensity]" />

  <TresMesh :position="[0, -40, 0]" :rotation="[-Math.PI / 2, 0, 0]">
    <TresPlaneGeometry :args="[200, 200]" />
    <TresMeshStandardMaterial :args="[{ color: 0x666666, roughness: 0.8 }]" />
  </TresMesh>

  <TresMesh :position="[0, 0, 0]">
    <TresSphereGeometry :args="[15, 32, 16]" />
    <TresMeshStandardMaterial :args="[{ color: 0x00ff00, roughness: 0.3, metalness: 0.1 }]" />
  </TresMesh>
  <TresMesh :position="[0, 0, -50]">
    <TresSphereGeometry :args="[15, 32, 16]" />
    <TresMeshStandardMaterial :args="[{ color: 0xff00ff, roughness: 0.3, metalness: 0.1 }]" />
  </TresMesh>

  <TresMesh ref="smokeRef" :scale="parameters.containerScale">
    <TresBoxGeometry :args="[1, 1, 1]" />
    <TresShaderMaterial v-bind="shader" />
  </TresMesh>
</template>
