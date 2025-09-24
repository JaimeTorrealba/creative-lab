<script setup>
import { shallowRef } from "vue";
import { useTres, useLoop } from "@tresjs/core";
import { useGLTF } from "@tresjs/cientos";
// import { BloomPmndrs, EffectComposerPmndrs } from "@tresjs/post-processing";
import {
  Uniform,
  Vector2,
  //   Mesh,
  //   PlaneGeometry,
  //   MeshBasicMaterial,
  BufferGeometry,
  BufferAttribute,
} from "three";
import { GPUComputationRenderer } from "three/addons/misc/GPUComputationRenderer.js";
import { useWindowSize, useDevicePixelRatio, watchOnce } from "@vueuse/core";
import { Pane } from "tweakpane";
import vertex from "./shaders/GPGPUFlowField/vertex.glsl";
import fragment from "./shaders/GPGPUFlowField/fragment.glsl";
import particlesShader from "./shaders/GPGPUFlowField/particles.glsl";

const { state: model, isLoading } = useGLTF(
  "/models/necronomicon_custom_vertex_colors.glb"
);

const { width, height } = useWindowSize();
const { pixelRatio } = useDevicePixelRatio();
const { renderer } = useTres();
const geometry = shallowRef();
const pane = new Pane();
const gpgpu = {};

const shaders = {
  vertexShader: vertex,
  fragmentShader: fragment,
  uniforms: {
    uSize: new Uniform(0.09),
    uResolution: new Uniform(
      new Vector2(width.value * pixelRatio.value, height.value * pixelRatio.value)
    ),
    uParticlesTexture: new Uniform(),
  },
};

const start = () => {
  const baseGeometry = {};
  baseGeometry.instance = model.value.scene.children[0].geometry;
  baseGeometry.count = model.value.scene.children[0].geometry.attributes.position.count;

  // GPU Compute
  gpgpu.size = Math.ceil(Math.sqrt(baseGeometry.count));
  gpgpu.computation = new GPUComputationRenderer(gpgpu.size, gpgpu.size, renderer);

  // Base particles
  const baseParticlesTexture = gpgpu.computation.createTexture();

  for (let i = 0; i < baseGeometry.count; i++) {
    const i3 = i * 3; // xyz
    const i4 = i * 4; // rgba

    // red channel
    baseParticlesTexture.image.data[i4 + 0] =
      baseGeometry.instance.attributes.position.array[i3 + 0];
    // green channel
    baseParticlesTexture.image.data[i4 + 1] =
      baseGeometry.instance.attributes.position.array[i3 + 1];
    // blue channel
    baseParticlesTexture.image.data[i4 + 2] =
      baseGeometry.instance.attributes.position.array[i3 + 2];
    // alpha channel
    baseParticlesTexture.image.data[i4 + 3] = Math.random();
  }

  // Particles variable
  gpgpu.particlesVariable = gpgpu.computation.addVariable(
    "uParticles",
    particlesShader,
    baseParticlesTexture
  );
  gpgpu.computation.setVariableDependencies(gpgpu.particlesVariable, [
    gpgpu.particlesVariable,
  ]);

  gpgpu.particlesVariable.material.uniforms.uTime = new Uniform(0);
  gpgpu.particlesVariable.material.uniforms.uDelta = new Uniform(0);
  gpgpu.particlesVariable.material.uniforms.uBase = new Uniform(baseParticlesTexture);
  gpgpu.particlesVariable.material.uniforms.uFlowFieldInfluence = new Uniform(0.5);
  gpgpu.particlesVariable.material.uniforms.uFlowFieldStrength = new Uniform(2.0);
  gpgpu.particlesVariable.material.uniforms.uFlowFieldFrequency = new Uniform(0.5);

  // Init
    gpgpu.computation.init();

  // Controls
  pane.addBinding(
    gpgpu.particlesVariable.material.uniforms.uFlowFieldInfluence,
    "value",
    {
      label: "Flow Field Influence",
      min: 0,
      max: 1,
    }
  );
  pane.addBinding(gpgpu.particlesVariable.material.uniforms.uFlowFieldStrength, "value", {
    label: "Flow Field Strength",
    min: 0,
    max: 10,
  });
  pane.addBinding(
    gpgpu.particlesVariable.material.uniforms.uFlowFieldFrequency,
    "value",
    {
      label: "Flow Field Frequency",
      min: 0,
      max: 1,
      step: 0.01,
    }
  );

  // particles
  const particlesUVArray = new Float32Array(baseGeometry.count * 2);
  const particlesSize = new Float32Array(baseGeometry.count);

  for (let y = 0; y < gpgpu.size; y++) {
    for (let x = 0; x < gpgpu.size; x++) {
      const i = x + y * gpgpu.size;
      const i2 = i * 2;
      particlesUVArray[i2 + 0] = (x + 0.5) / gpgpu.size;
      particlesUVArray[i2 + 1] = (y + 0.5) / gpgpu.size;
      // Random size
      particlesSize[i] = Math.random();
    }
  }

  geometry.value = new BufferGeometry();
  geometry.value.setDrawRange(0, baseGeometry.count);
  geometry.value.setAttribute("aParticlesUv", new BufferAttribute(particlesUVArray, 2));
  geometry.value.setAttribute("aSize", new BufferAttribute(particlesSize, 1));
  geometry.value.setAttribute("aColor", baseGeometry.instance.attributes.color);
};

// Wait until the model is loaded, then start when renderer is ready
watchOnce(isLoading, (v) => {
  if (!v) start();
});

const { onBeforeRender } = useLoop();
onBeforeRender(({ elapsed, delta }) => {
  // Update particles before the gpgpu computation
  if(!gpgpu.computation) return;
  gpgpu.particlesVariable.material.uniforms.uDelta.value = delta;
  gpgpu.particlesVariable.material.uniforms.uTime.value = elapsed;
  gpgpu.computation.compute();
  shaders.uniforms.uParticlesTexture.value = gpgpu.computation.getCurrentRenderTarget(
    gpgpu.particlesVariable
  ).texture;
});
</script>
<template>
  <TresPoints v-if="model && geometry" :geometry="geometry">
    <TresShaderMaterial v-bind="shaders" />
  </TresPoints>
  <!-- <EffectComposerPmndrs>
    <BloomPmndrs
      :radius="0.85"
      :intensity="8.0"
      :luminance-threshold="1.1"
      :luminance-smoothing="0.3"
      mipmap-blur
    />
  </EffectComposerPmndrs> -->
</template>
