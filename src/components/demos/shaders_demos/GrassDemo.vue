<script setup>
import { useLoop } from '@tresjs/core'
import { Sampler } from '@tresjs/cientos'
import vertex from './shaders/grass/vertex.glsl'
import fragment from './shaders/grass/fragment.glsl'
import { DoubleSide, ShaderMaterial, PlaneGeometry } from 'three'

const count = 5000
const geometry = new PlaneGeometry(0.1, 1, 1, 4);
geometry.translate(0, 0.5, 0);

const leavesMaterial = new ShaderMaterial({
    vertexShader: vertex,
    fragmentShader: fragment,
    uniforms: {
        uTime: { value: 0.0 },
    },
    side: DoubleSide,
});

const { onBeforeRender } = useLoop()

onBeforeRender(({ elapsed }) => {
    leavesMaterial.uniforms.uTime.value = elapsed
})
</script>
<template>
    <Sampler :count="count">
        <TresMesh :rotation-x="Math.PI * -0.5" :visible="false">
            <TresPlaneGeometry :args="[10, 10]" />
            <TresMeshBasicMaterial :color="0xe4e4e4" />
        </TresMesh>

        <TresInstancedMesh ref="instanceRef" :rotation-x="Math.PI * 0.5" :args="[geometry, leavesMaterial, 1000]">
        </TresInstancedMesh>
    </Sampler>
</template>