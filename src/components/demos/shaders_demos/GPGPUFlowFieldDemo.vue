<script setup>
import { useTresContext, useLoop } from '@tresjs/core';
import { useGLTF } from '@tresjs/cientos';
import {
    Uniform, Vector2, Mesh,
    PlaneGeometry,
    MeshBasicMaterial,
    BufferGeometry,
    BufferAttribute,
} from 'three';
import { GPUComputationRenderer } from 'three/addons/misc/GPUComputationRenderer.js';
import { useWindowSize, useDevicePixelRatio } from '@vueuse/core';
import { Pane } from 'tweakpane';
import vertex from './shaders/GPGPUFlowField/vertex.glsl';
import fragment from './shaders/GPGPUFlowField/fragment.glsl';
import particlesShader from './shaders/GPGPUFlowField/particles.glsl';

const { scene: model } = await useGLTF('/models/push logo.glb');

const { width, height } = useWindowSize();
const { pixelRatio } = useDevicePixelRatio()
const { renderer, scene } = useTresContext()
const pane = new Pane()

const baseGeometry = {}
baseGeometry.instance = model.children[0].geometry
baseGeometry.count = model.children[0].geometry.attributes.position.count

// GPU Compute
const gpgpu = {}
gpgpu.size = Math.ceil(Math.sqrt(baseGeometry.count))
gpgpu.computation = new GPUComputationRenderer(gpgpu.size, gpgpu.size, renderer.value)

// Base particles
const baseParticlesTexture = gpgpu.computation.createTexture()

for (let i = 0; i < baseGeometry.count; i++) {
    const i3 = i * 3 // xyz
    const i4 = i * 4 // rgba

    // red channel
    baseParticlesTexture.image.data[i4 + 0] = baseGeometry.instance.attributes.position.array[i3 + 0]
    // green channel
    baseParticlesTexture.image.data[i4 + 1] = baseGeometry.instance.attributes.position.array[i3 + 1]
    // blue channel
    baseParticlesTexture.image.data[i4 + 2] = baseGeometry.instance.attributes.position.array[i3 + 2]
    // alpha channel
    baseParticlesTexture.image.data[i4 + 3] = Math.random()

}

// Particles variable
gpgpu.particlesVariable = gpgpu.computation.addVariable('uParticles', particlesShader, baseParticlesTexture)
gpgpu.computation.setVariableDependencies(gpgpu.particlesVariable, [gpgpu.particlesVariable])

gpgpu.particlesVariable.material.uniforms.uTime = new Uniform(0)
gpgpu.particlesVariable.material.uniforms.uDelta = new Uniform(0)
gpgpu.particlesVariable.material.uniforms.uBase = new Uniform(baseParticlesTexture)
gpgpu.particlesVariable.material.uniforms.uFlowFieldInfluence = new Uniform(0.5)
gpgpu.particlesVariable.material.uniforms.uFlowFieldStrength = new Uniform(2.0)
gpgpu.particlesVariable.material.uniforms.uFlowFieldFrequency = new Uniform(0.5)

// Init
gpgpu.computation.init()

// debug
gpgpu.debug = new Mesh(
    new PlaneGeometry(3, 3),
    new MeshBasicMaterial({ map: gpgpu.computation.getCurrentRenderTarget(gpgpu.particlesVariable).texture })
)
gpgpu.debug.position.set(3, 0, 0)
scene.value.add(gpgpu.debug)

pane.addBinding(gpgpu.particlesVariable.material.uniforms.uFlowFieldInfluence, 'value',
    {
        label: 'Flow Field Influence',
        min: 0,
        max: 1,
    })
pane.addBinding(gpgpu.particlesVariable.material.uniforms.uFlowFieldStrength, 'value',
    {
        label: 'Flow Field Strength',
        min: 0,
        max: 10,
    })
pane.addBinding(gpgpu.particlesVariable.material.uniforms.uFlowFieldFrequency, 'value',
    {
        label: 'Flow Field Frequency',
        min: 0,
        max: 1,
        steps: 0.01
    })


// particles
const particlesUVArray = new Float32Array(baseGeometry.count * 2)
const particlesSize = new Float32Array(baseGeometry.count)

for (let y = 0; y < gpgpu.size; y++) {
    for (let x = 0; x < gpgpu.size; x++) {
        const i = x + y * gpgpu.size
        const i2 = i * 2
        particlesUVArray[i2 + 0] = (x + 0.5) / gpgpu.size
        particlesUVArray[i2 + 1] = (y + 0.5) / gpgpu.size
        // Random size
        particlesSize[i] = Math.random()
    }
}

const geometry = new BufferGeometry()
geometry.setDrawRange(0, baseGeometry.count)
geometry.setAttribute('aParticlesUv', new BufferAttribute(particlesUVArray, 2))
geometry.setAttribute('aSize', new BufferAttribute(particlesSize, 1))
const shaders = {
    vertexShader: vertex,
    fragmentShader: fragment,
    uniforms:
    {
        uSize: new Uniform(0.09),
        uResolution: new Uniform(new Vector2(width.value * pixelRatio.value, height.value * pixelRatio.value)),
        uParticlesTexture: new Uniform()
    }
}

// Update
const { onBeforeRender } = useLoop()

onBeforeRender(({ elapsed, delta }) => {
    // Update particles before the gpgpu computation
    gpgpu.particlesVariable.material.uniforms.uDelta.value = delta
    gpgpu.particlesVariable.material.uniforms.uTime.value = elapsed
    gpgpu.computation.compute()
    shaders.uniforms.uParticlesTexture.value = gpgpu.computation.getCurrentRenderTarget(gpgpu.particlesVariable).texture
})
</script>
<template>
    <TresPoints :geometry="geometry">
        <TresShaderMaterial v-bind="shaders" />
    </TresPoints>
</template>