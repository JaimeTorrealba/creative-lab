<script setup>
import { useLoop } from "@tresjs/core";
import { useTexture } from "@tresjs/cientos";
import vertex from "@/components/demos/shaders/shaders/ActionLines/vertex.glsl";
import fragment from "@/components/demos/shaders/shaders/ActionLines/fragment.glsl";
import { LinearFilter, RepeatWrapping, Vector2 } from "three";
import { watchOnce, useWindowSize } from "@vueuse/core";
import { Pane } from "tweakpane";
import { shallowRef, reactive } from "vue";

const { state: texture, isLoading } = useTexture("/perlin.png");

watchOnce(isLoading, (newVal) => {
  if (!newVal) {
    texture.value.minFilter = LinearFilter;
    texture.value.wrapS = RepeatWrapping;
    texture.value.wrapT = RepeatWrapping;
    shader.uniforms.uTexture.value = texture.value;
  }
});

const { width , height } = useWindowSize();

const shader = {
  uniforms: {
    uTexture: { value: null },
    uTime: { value: 0 },
    uResolution: { value: new Vector2(width.value, height.value) },
    uNumLines: { value: 5.0 },
    uRadios: { value: 0.25 },
    uNoiseRadios: { value: 0.25 },

  },
  vertexShader: vertex,
  fragmentShader: fragment,
  transparent: true,
}

const options = reactive({
  speed: 1.0,
})

const pane = new Pane();
pane.addBinding(shader.uniforms.uNumLines, 'value', { min: 0, max: 15, step: 0.01, label: 'Factor' });
pane.addBinding(shader.uniforms.uRadios, 'value', { min: -0.5, max: 0.75, step: 0.01, label: 'Radio' });
pane.addBinding(shader.uniforms.uNoiseRadios, 'value', { min: 0, max: 1, step: 0.01, label: 'Noise Radio' });
pane.addBinding(options, 'speed', { min: 0, max: 5, step: 0.01, label: 'Speed' });


const boxRef = shallowRef(null);
const { onBeforeRender } = useLoop();
onBeforeRender(({ delta, elapsed }) => {
  shader.uniforms.uTime.value += delta * options.speed;
  boxRef.value.rotation.x = elapsed * 0.2;
  boxRef.value.rotation.y = elapsed * 0.2;
})
</script>
<template>
  <TresMesh>
    <TresPlaneGeometry :args="[2,2]" />
    <TresShaderMaterial v-bind="shader" />
  </TresMesh>
  <TresMesh ref="boxRef" :position-z=" -5">
    <TresBoxGeometry :args="[0.25,0.25,0.25]" />
    <TresMeshLambertMaterial color="red" />
  </TresMesh>
</template>
