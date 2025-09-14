<script setup>
import { shallowRef, watch, reactive } from "vue";
import { useLoop, useTexture, useTresContext } from "@tresjs/core";
import * as THREE from "three";
import {
  VolumetricMaskController,
} from "@/components/demos/shaders_demos/shaders/volumetricSmoke/utils.js";
import VERTEX_SHADER from "@/components/demos/shaders_demos/shaders/volumetricSmoke/vertex.glsl";
import FRAGMENT_SHADER from "@/components/demos/shaders_demos/shaders/volumetricSmoke/fragment.glsl";
import { useWindowSize } from "@vueuse/core";
import { Pane } from "tweakpane";

const pane = new Pane();

// TODO: check bake3Dtexture
const parameters = reactive({
  // Texture Generation
  textureSize: 96,
  cloudCoverage: 0.55,
  cloudSoftness: 0.05,
  noiseScale: 3.5,
  octaves: 5,
  persistence: 0.5,
  lacunarity: 3.0,
  noiseIntensity: 1.0,
  seed: Math.random() * 1000.0,

  // Cloud Shape (Shader)
  textureTiling: 2.0,

  // Material & Rendering (Shader)
  densityThreshold: 0.5,
  densityMultiplier: 5.0,
  opacity: 6.0,
  raymarchSteps: 44,
  lightSteps: 1,

  // Scale & Animation
  containerScale: 512.0,
  isAnimating: true,
  animationSpeedX: 0.2,
  animationSpeedY: 0.0,
  animationSpeedZ: 0.01,

  // Lighting
  ambientLightIntensity: 1.2,
  directionalLightIntensity: 2.5,
});

pane.addBinding(parameters, "animationSpeedX", {
  label: "Animation Speed X",
  min: -1,
  max: 1,
  step: 0.01,
});
pane.addBinding(parameters, "animationSpeedY", {
  label: "Animation Speed Y",
  min: -1,
  max: 1,
  step: 0.01,
});
pane.addBinding(parameters, "animationSpeedZ", {
  label: "Animation Speed Z",
  min: -1,
  max: 1,
  step: 0.01,
});
pane.addBinding(parameters, "containerScale", {
  label: "Container Scale",
  min: 0,
  max: 4080,
  step: 1,
});
pane.addBinding(parameters, "densityThreshold", {
  label: "Density Threshold",
  min: 0,
  max: 1,
  step: 0.01,
});
pane.addBinding(parameters, "isAnimating", {
  label: "Is Animating",
});

// ------- Refs & Context -------
const { width, height } = useWindowSize();
const { camera, renderer, scene } = useTresContext();
const directionalLightRef = shallowRef();
const ambientLightRef = shallowRef();
const smokeRef = shallowRef();

// A tiny 1x1 fallback texture for unused sampler uniforms
const fallbackTexture = new THREE.DataTexture(new Uint8Array([0, 0, 0, 255]), 1, 1);
fallbackTexture.needsUpdate = true;

// Use a blue-noise-like texture (we reuse an available asset for jitter)
const { map: blueNoise } = await useTexture({ map: "/textures/Cloud.png" });
blueNoise.wrapS = THREE.RepeatWrapping;
blueNoise.wrapT = THREE.RepeatWrapping;
blueNoise.minFilter = THREE.NearestFilter;
blueNoise.magFilter = THREE.NearestFilter;
blueNoise.needsUpdate = true;

// Mask controller creates u_mask_* uniforms and 3D shape noise textures
const maskController = new VolumetricMaskController();

// ------- Shader Material -------
const shader = {
  uniforms: {
    ...maskController.uniforms,
    uVolumeTexture: { value: null },
    uTextureOffset: { value: new THREE.Vector3(0, 0, 0) },
    uTextureTiling: { value: parameters.textureTiling },
    uBlueNoise: { value: blueNoise },
    uBlueNoiseSize: {
      value: new THREE.Vector2(blueNoise.image.width, blueNoise.image.height),
    },
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
    uOcclusionMode: { value: false },
  },
  vertexShader: VERTEX_SHADER,
  fragmentShader: FRAGMENT_SHADER,
  glslVersion: THREE.GLSL3,
  side: THREE.BackSide,
  transparent: true,
  depthWrite: false,
  depthTest: false,
};

const myWorker = new Worker(new URL("worker-smoke.js", import.meta.url));

const parametersClone = { ...parameters };

myWorker.postMessage(parametersClone);

myWorker.onmessage = (e) => {
  const size = parameters.textureSize
  const texture = new THREE.Data3DTexture(e.data, size, size, size);
  texture.format = THREE.RedFormat;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.unpackAlignment = 1;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.wrapR = THREE.RepeatWrapping;
  texture.needsUpdate = true;

  set3DTexture(texture)
};

const set3DTexture = (texture) => {
  shader.uniforms.uVolumeTexture.value = texture;
};

// Create a depth render target for occlusion
let depthTarget = new THREE.WebGLRenderTarget(width.value, height.value);
depthTarget.depthTexture = new THREE.DepthTexture(width.value, height.value);
depthTarget.depthTexture.format = THREE.DepthFormat;
depthTarget.depthTexture.type = THREE.UnsignedShortType;
depthTarget.depthBuffer = true;
shader.uniforms.uDepthTexture.value = depthTarget.depthTexture;

// Animate offsets + update matrices and light dir
const animatedOffset = new THREE.Vector3();
const { onBeforeRender } = useLoop();
onBeforeRender(({ delta }) => {
  // matrices and camera
  shader.uniforms.uProjectionMatrixInverse.value.copy(
    camera.value.projectionMatrixInverse
  );
  shader.uniforms.uViewMatrixInverse.value.copy(camera.value.matrixWorld);
  if (smokeRef.value) {
    shader.uniforms.uModelMatrix.value.copy(smokeRef.value.matrixWorld);
  }
  shader.uniforms.uProjectionMatrix.value.copy(camera.value.projectionMatrix);
  shader.uniforms.cameraPos.value.copy(camera.value.position);

  // light direction as normalized vector
  if (directionalLightRef.value?.position) {
    shader.uniforms.uLightDir.value.copy(
      directionalLightRef.value.position.clone().normalize()
    );
  }

  // animate volume offset
  if (parameters.isAnimating) {
    const dt = delta ?? 0.016;
    animatedOffset.x += parameters.animationSpeedX * dt;
    animatedOffset.y += parameters.animationSpeedY * dt;
    animatedOffset.z += parameters.animationSpeedZ * dt;
    shader.uniforms.uTextureOffset.value.copy(animatedOffset);
  }

  // Depth pre-pass: render scene without the volumetric mesh into the depth target
  if (renderer?.value && scene?.value && smokeRef.value) {
    const r = renderer.value;
    const s = scene.value;
    const prevTarget = r.getRenderTarget();
    const prevAutoClear = r.autoClear;
    const prevVisible = smokeRef.value.visible;
    // Hide the volume for depth pre-pass
    smokeRef.value.visible = false;
    r.setRenderTarget(depthTarget);
    r.autoClear = true;
    r.clear(true, true, true);
    r.render(s, camera.value);
    // Restore
    smokeRef.value.visible = prevVisible;
    r.setRenderTarget(prevTarget);
    r.autoClear = prevAutoClear;
    // Provide the freshly rendered depth texture to the shader
    shader.uniforms.uDepthTexture.value = depthTarget.depthTexture;
  }
});

// Keep resolution uniform in sync
watch([width, height], ([w, h]) => {
  shader.uniforms.uResolution.value.set(w, h);
  // Resize the depth render target to match the canvas size
  if (depthTarget) {
    depthTarget.setSize(w, h);
  }
});
</script>

<template>
  <!-- Lights -->
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
  <TresAmbientLight
    ref="ambientLightRef"
    :args="[0xffffff, parameters.ambientLightIntensity]"
  />

  <!-- Some solid scene objects -->
  <TresMesh :position="[0, -40, 0]" :rotation="[-Math.PI / 2, 0, 0]">
    <TresPlaneGeometry :args="[200, 200]" />
    <TresMeshStandardMaterial :args="[{ color: 0x666666, roughness: 0.8 }]" />
  </TresMesh>

  <TresMesh :position="[0, 0, 0]">
    <TresSphereGeometry :args="[15, 32, 16]" />
    <TresMeshStandardMaterial
      :args="[{ color: 0x00ff00, roughness: 0.3, metalness: 0.1 }]"
    />
  </TresMesh>
  <TresMesh :position="[0, 0, -50]">
    <TresSphereGeometry :args="[15, 32, 16]" />
    <TresMeshStandardMaterial
      :args="[{ color: 0xff00ff, roughness: 0.3, metalness: 0.1 }]"
    />
  </TresMesh>

  <!-- Volumetric Cloud Container (unit cube scaled up) -->
  <TresMesh ref="smokeRef" :scale="parameters.containerScale">
    <TresBoxGeometry :args="[1, 1, 1]" />
    <TresShaderMaterial v-bind="shader" />
  </TresMesh>
</template>
