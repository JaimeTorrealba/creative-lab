<script setup>
import { useLoop } from "@tresjs/core";
import { Vector2 } from 'three';
import { useWindowSize } from '@vueuse/core';
import { watch } from 'vue';
import { Pane } from 'tweakpane';
import fragment from './shaders/wave/fragment.glsl'
import vertex from './shaders/wave/vertex.glsl'

const { width, height } = useWindowSize();

const shader = {
  vertexShader: vertex,
  fragmentShader: fragment,
  uniforms: {
    uTime: { value: 0 },
    uResolution: { value: new Vector2(width.value, height.value) },
    uOrigin: { value: new Vector2(0.5, 0.5) },
    uFrequency: { value: 5.0 },
    uSpeed: { value: 0.5 },
    uFadeStart: { value: 0.5 },
    uFadeEnd: { value: 1.0 }
  }
}

watch([width, height], () => {
  shader.uniforms.uResolution.value.set(width.value, height.value);
});

const { onBeforeRender } = useLoop();
onBeforeRender(({ elapsed }) => {
  shader.uniforms.uTime.value = elapsed;
});

// Tweakpane setup
const pane = new Pane();

const waveFolder = pane.addFolder({ title: 'Wave Parameters' });
waveFolder.addBinding(shader.uniforms.uOrigin.value, 'x', { min: 0, max: 1, step: 0.01, label: 'Origin X' });
waveFolder.addBinding(shader.uniforms.uOrigin.value, 'y', { min: 0, max: 1, step: 0.01, label: 'Origin Y' });
waveFolder.addBinding(shader.uniforms.uFrequency, 'value', { min: 1, max: 20, step: 0.5, label: 'Frequency' });
waveFolder.addBinding(shader.uniforms.uSpeed, 'value', { min: 0.1, max: 2, step: 0.1, label: 'Speed' });

const fadeFolder = pane.addFolder({ title: 'Fade Parameters' });
fadeFolder.addBinding(shader.uniforms.uFadeStart, 'value', { min: 0, max: 2, step: 0.1, label: 'Fade Start' });
fadeFolder.addBinding(shader.uniforms.uFadeEnd, 'value', { min: 0, max: 2, step: 0.1, label: 'Fade End' });

</script>
<template>
      <TresMesh>
        <TresPlaneGeometry :args="[2, 2]" />
        <TresShaderMaterial v-bind="shader" />
      </TresMesh>
</template>