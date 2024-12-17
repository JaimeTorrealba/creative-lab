<script setup>
import { watch } from 'vue'
import { useWindowSize, useMouseInElement } from '@vueuse/core'
import { useTexture } from '@tresjs/core'
import gsap from "gsap";
import { Vector2 } from 'three'
import vertex from './shaders/BlurPixels/vertex.glsl'
import fragment from './shaders/BlurPixels/fragment.glsl'

const { width, height } = useWindowSize()

const { map } = await useTexture({
    map: '/images/photo_slider2.jpg'
})
const canvas = document.getElementById('canvasId')
const { isOutside } = useMouseInElement(canvas)

const revealTexture = () => {
    gsap.to(shader.uniforms.uMouseEnter, {
        value: 0,
        duration: 0.5,
        ease: 'power2.out'
    })
}

const blurTexture = () => {
    gsap.to(shader.uniforms.uMouseEnter, {
        value: 1,
        duration: 0.5,
        ease: 'power2.out'
    })
}

watch(isOutside, (value) => {
    if (value) {
        revealTexture()
    } else {
        blurTexture()
    }
})

const shader = {
    uniforms: {
        uResolution: { value: new Vector2(width.value, height.value) },
        uTime: { value: 0 },
        uTexture: { value: map },
        uMouseEnter: { value: 0 },
        uMouseOverPos: { value: new Vector2(0.5, 0.9) }
    },
    vertexShader: vertex,
    fragmentShader: fragment,
}

//resize
watch(width, () => {
    shader.uniforms.uResolution.value = new Vector2(width.value, height.value)
})

const handleMove = (e) => {
    if (width.value < 768) return
    shader.uniforms.uMouseOverPos.value = new Vector2(e.x / width.value, e.y / height.value)
}

</script>
<template>
    <TresMesh @pointer-move="(event) => handleMove(event)">
        <TresPlaneGeometry :args='[width, height, 100, 100]' />
        <TresShaderMaterial v-bind="shader" />
    </TresMesh>
</template>