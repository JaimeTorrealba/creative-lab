<script setup>
import { useLoop } from '@tresjs/core'
import { Color, AdditiveBlending } from 'three'
import fragment from './shaders/ParticlesRing/fragment.glsl'
import vertex from './shaders/ParticlesRing/vertex.glsl'
const parameters = {}
parameters.count = 50000
parameters.radius = 5
parameters.size = 5
parameters.branches = 5
parameters.spin = 1
parameters.randomness = 0.5
parameters.randomnessPower = 3
parameters.insideColor = '#4568DC'
parameters.outsideColor = '#F7F7F7'

const shader = {
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
    vertexColors: true,
    vertexShader: vertex,
    fragmentShader: fragment,
    uniforms: {
        uTime: { value: 0 },
        uSize: {
            value: parameters.size,
        },
    },
}

const positions = new Float32Array(parameters.count * 3)
const colors = new Float32Array(parameters.count * 3)
const scales = new Float32Array(parameters.count * 1)
const randomness = new Float32Array(parameters.count * 3)

const insideColor = new Color(parameters.insideColor)
const outsideColor = new Color(parameters.outsideColor)

for (let i = 0; i < parameters.count; i++) {
    const i3 = i * 3

    // Position
    const radius = Math.random() * parameters.radius

    const branchAngle =
        ((i % parameters.branches) / parameters.branches) * Math.PI * 2

    positions[i3] = Math.cos(branchAngle) * radius
    positions[i3 + 1] = 0
    positions[i3 + 2] = Math.sin(branchAngle) * radius

    const randomX =
        Math.pow(Math.random(), parameters.randomnessPower) *
        (Math.random() < 0.5 ? 1 : -1) *
        parameters.randomness *
        radius
    const randomY =
        Math.pow(Math.random(), parameters.randomnessPower) *
        (Math.random() < 0.5 ? 1 : -1) *
        parameters.randomness *
        radius
    const randomZ =
        Math.pow(Math.random(), parameters.randomnessPower) *
        (Math.random() < 0.5 ? 1 : -1) *
        parameters.randomness *
        radius

    randomness[i3] = randomX
    randomness[i3 + 1] = randomY
    randomness[i3 + 2] = randomZ

    // Color
    const mixedColor = insideColor.clone()
    mixedColor.lerp(outsideColor, radius / parameters.radius)

    colors[i3] = mixedColor.r
    colors[i3 + 1] = mixedColor.g
    colors[i3 + 2] = mixedColor.b

    //Scale
    scales[i] = Math.random()
}

const { onBeforeRender } = useLoop()
onBeforeRender(({ elapsed }) => {
    shader.uniforms.uTime.value = elapsed
})
</script>
<template>
    <TresPoints>
        <TresBufferGeometry :position="[positions, 3]" :a-scale="[scales, 1]" :color="[colors, 3]"
            :a-randomness="[randomness, 3]" />
        <TresShaderMaterial v-bind="shader" />
    </TresPoints>
</template>