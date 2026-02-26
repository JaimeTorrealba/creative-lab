<script setup>
import { watch, reactive } from "vue";
import fragment from "./shaders/voronoid/fragment.glsl";
import { Vector2 } from "three";
import { useWindowSize } from "@vueuse/core";
import { useLoop } from "@tresjs/core";
import { Pane } from "tweakpane";

const { width , height } = useWindowSize();

watch([width, height], () => {
  shader.uniforms.u_resolution.value.set(width.value, height.value)
})

const shader = {
  uniforms: {
    u_time: { value: 0 },
    u_resolution: { value: new Vector2(width.value, height.value) },
    u_scale : { value: 3 },
    u_debug: { value: false },
    u_mouse: { value: new Vector2(width.value * 0.5, height.value * 0.5) }
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: fragment,
}

const options = reactive({
  speed: 1,
})

const pane = new Pane()
pane.addBinding(shader.uniforms.u_scale, "value", {
  min: 1,
  max: 12,
  step: 0.1,
  label: "Scale"
})

pane.addBinding(options, "speed", {
  min: 0,
  max: 5,
  step: 0.1,
  label: "Speed"
})

pane.addBinding(shader.uniforms.u_debug, "value", {
  label: "Debug"
})

 const updateUniforms = (ev) => {
   ev.object.material.uniforms.u_mouse.value.set(ev.uv.x * width.value, (ev.uv.y) * height.value)
 }

const { onBeforeRender } = useLoop()
onBeforeRender(({ elapsed }) => {
  shader.uniforms.u_time.value = elapsed * options.speed
})
</script>
<template>
  <TresMesh @pointermove="(ev) => updateUniforms(ev)">
    <TresPlaneGeometry :args="[2,2]" />
    <TresShaderMaterial v-bind="shader" />
  </TresMesh>
</template>
