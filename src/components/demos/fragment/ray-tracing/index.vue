<script setup>
import { watch, onMounted, onUnmounted } from "vue";
import { PointerLockControls } from '@tresjs/cientos'
import { useWindowSize } from "@vueuse/core";
import { Vector2, Vector3 } from "three";
import fragment from "./fragment.glsl";
import { Pane } from "tweakpane";

const { width, height } = useWindowSize();

const shader = {
  vertexShader: `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;

    void main(){
      gl_Position = vec4(position, 1.0);
      vUv = uv;
      vNormal = normal;
      vPosition = position;
    }
  `,
  fragmentShader: fragment,
  uniforms: {
    uResolution: { value: new Vector2(width.value, height.value) },
    uCameraPos: { value: new Vector3(0, 1, 5) },
    uLightDir: { value: new Vector3(-1, -1, -1).normalize() },
  },
};

watch([width, height], () => {
  shader.uniforms.uResolution.value.set(width.value, height.value)
})

const onChange = (e) => { // TODO: cientos isn't exporting the events on @change
  console.log('jaime ~ onChange ~ event:', e);
  shader.uniforms.uCameraPos.value.copy(e.target.object.position)
}

const paneParams = {
  cameraPosX: 0, cameraPosY: 1, cameraPosZ: 5,
  lightDirX: -0.577, lightDirY: -0.577, lightDirZ: -0.577,
};

let pane;
onMounted(() => {
  pane = new Pane({ title: 'Ray Tracing' });

  const update = () => {
    shader.uniforms.uCameraPos.value.set(paneParams.cameraPosX, paneParams.cameraPosY, paneParams.cameraPosZ);
    shader.uniforms.uLightDir.value.set(paneParams.lightDirX, paneParams.lightDirY, paneParams.lightDirZ).normalize();
  };

  pane.addBinding(paneParams, 'cameraPosX', { label: 'Camera X', min: -10, max: 10 }).on('change', update);
  pane.addBinding(paneParams, 'cameraPosY', { label: 'Camera Y', min: -10, max: 10 }).on('change', update);
  pane.addBinding(paneParams, 'cameraPosZ', { label: 'Camera Z', min: -10, max: 10 }).on('change', update);
  pane.addBinding(paneParams, 'lightDirX', { label: 'Light X', min: -1, max: 1 }).on('change', update);
  pane.addBinding(paneParams, 'lightDirY', { label: 'Light Y', min: -1, max: 1 }).on('change', update);
  pane.addBinding(paneParams, 'lightDirZ', { label: 'Light Z', min: -1, max: 1 }).on('change', update);
});

onUnmounted(() => pane?.dispose());
</script>
<template>
  <!-- <PointerLockControls @change="onChange" /> -->
  <TresMesh>
    <TresPlaneGeometry :args="[4, 4]" />
    <TresShaderMaterial v-bind="shader" />
  </TresMesh>
</template>
