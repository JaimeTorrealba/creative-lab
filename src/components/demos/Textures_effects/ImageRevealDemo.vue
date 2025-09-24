<script setup>
import { computed, reactive } from 'vue'
import { useLoop } from '@tresjs/core'
import { useTexture } from '@tresjs/cientos'
import { watchOnce } from '@vueuse/core'
import vertex from './shaders/ImageReveal/vertex.glsl'
import fragment from './shaders/ImageReveal/fragment.glsl'
import { Pane } from 'tweakpane'

const { state: texture, isLoading } = useTexture('/images/photo_slider2.jpg')

watchOnce(isLoading, (value) => {
    if (!value) {
        shader.uniforms.uTexture.value = texture.value;
    }
})

const shader = {
  uniforms: {
    uTexture: { value: null },
    uTime: { value: 0 },
    uProgress: { value: 0.5 },
  },
  transparent: true,
  vertexShader: vertex,
  fragmentShader: fragment,
};

const imageScale = computed(() => {
    return texture.image ? {
        x: texture.image.width / texture.image.height,
        y: 1
    } : { x: 1, y: 1 }
})

const pane = new Pane();
const options = reactive({
    progress: 0.5
})

pane.addBinding(options, 'progress', {
    label: 'Progress',
    min: 0,
    max: 1,
    step: 0.01
}).on('change', (progress) => {
    shader.uniforms.uProgress.value = progress.value
});

const { onBeforeRender } = useLoop()
onBeforeRender(({elapsed}) => {
    shader.uniforms.uTime.value = elapsed
})
</script>
<template>
  <TresMesh :scale="[imageScale.x, imageScale.y, 1]">
    <TresPlaneGeometry :args="[1, 1]" />
    <TresShaderMaterial v-bind="shader" />
  </TresMesh>
</template>
