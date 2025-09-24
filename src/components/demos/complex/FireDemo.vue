<script setup>
import { useLoop } from "@tresjs/core";
import { Box, useTexture } from "@tresjs/cientos";
import { Vector4, Color, Matrix4, Vector3 } from "three";
import vertex from "./shaders/fire/vertex.glsl";
import fragment from "./shaders/fire/fragment.glsl";
import { reactive, ref } from "vue";
import { Pane } from "tweakpane";
import { watchOnce } from "@vueuse/core";


const { state: fireTex, isLoading } = useTexture("/textures/Fire.png");

watchOnce(isLoading, (v) => {
  if (!v) {
    fireShader.uniforms.fireTex.value = fireTex.value;
  }
});

const pane = new Pane();

const options = reactive({
  magnitude: 1.3,
  lacunarity: 2.0,
  gain: 1.0,
  scaleX: 1.0,
  scaleY: 1.0,
  scaleZ: 1.0,
  noiseScaleX: 1.0,
  noiseScaleY: 2.0,
  noiseScaleZ: 1.0,
  noiseScaleW: 0.3,
  seed: Math.random() * 19.19,
  color: new Color(0xeeeeee),
  xPos: 0.5,
  yPos: 0,
  zPos: 0,
});

pane
  .addBinding(options, "magnitude", { min: 0, max: 5, step: 0.1 })
  .on("change", (ev) => {
    fireShader.uniforms.magnitude.value = ev.value;
  });

pane
  .addBinding(options, "lacunarity", { min: 1, max: 5, step: 0.1 })
  .on("change", (ev) => {
    fireShader.uniforms.lacunarity.value = ev.value;
  });

pane.addBinding(options, "gain", { min: 0, max: 5, step: 0.1 }).on("change", (ev) => {
  fireShader.uniforms.gain.value = ev.value;
});

pane.addBinding(options, "scaleX", { min: 0.1, max: 5, step: 0.1 }).on("change", (ev) => {
  fireShader.uniforms.scale.value.x = ev.value;
  fireMeshRef.value.scale.x = ev.value;
});

pane.addBinding(options, "scaleY", { min: 0.1, max: 5, step: 0.1 }).on("change", (ev) => {
  fireShader.uniforms.scale.value.y = ev.value;
  fireMeshRef.value.scale.y = ev.value;
});

pane.addBinding(options, "scaleZ", { min: 0.1, max: 5, step: 0.1 }).on("change", (ev) => {
  fireShader.uniforms.scale.value.z = ev.value;
  fireMeshRef.value.scale.z = ev.value;
});
pane
  .addBinding(options, "noiseScaleX", { min: 0.1, max: 5, step: 0.1 })
  .on("change", (ev) => {
    fireShader.uniforms.noiseScale.value.x = ev.value;
  });
pane
  .addBinding(options, "noiseScaleY", { min: 0.1, max: 5, step: 0.1 })
  .on("change", (ev) => {
    fireShader.uniforms.noiseScale.value.y = ev.value;
  });
pane
  .addBinding(options, "noiseScaleZ", { min: 0.1, max: 5, step: 0.1 })
  .on("change", (ev) => {
    fireShader.uniforms.noiseScale.value.z = ev.value;
  });
pane
  .addBinding(options, "noiseScaleW", { min: 0.1, max: 5, step: 0.1 })
  .on("change", (ev) => {
    fireShader.uniforms.noiseScale.value.w = ev.value;
  });
pane.addBinding(options, "seed", { min: 0, max: 20, step: 0.01 }).on("change", (ev) => {
  fireShader.uniforms.seed.value = ev.value;
});
pane.addBinding(options, "xPos", { min: -5, max: 5, step: 0.1 }).on("change", (ev) => {
  fireMeshRef.value.position.x = ev.value;
});
pane.addBinding(options, "yPos", { min: -5, max: 5, step: 0.1 }).on("change", (ev) => {
  fireMeshRef.value.position.y = ev.value;
});
pane.addBinding(options, "zPos", { min: -5, max: 5, step: 0.1 }).on("change", (ev) => {
  fireMeshRef.value.position.z = ev.value;
});

const fireShader = {
  defines: {
    ITERATIONS: "20",
    OCTIVES: "3",
  },
  uniforms: {
    fireTex: { type: "t", value: null },
    time: { type: "f", value: 0.0 },
    seed: { type: "f", value: options.seed },
    invModelMatrix: { type: "m4", value: new Matrix4() },
    scale: {
      type: "v3",
      value: new Vector3(options.scaleX, options.scaleY, options.scaleZ),
    },
    noiseScale: {
      type: "v4",
      value: new Vector4(
        options.noiseScaleX,
        options.noiseScaleY,
        options.noiseScaleZ,
        options.noiseScaleW
      ),
    },
    magnitude: { type: "f", value: options.magnitude },
    lacunarity: { type: "f", value: options.lacunarity },
    gain: { type: "f", value: options.gain },
  },
  vertexShader: vertex,
  fragmentShader: fragment,
  transparent: true,
  depthTest: true,
  depthWrite: false,
};

const { onBeforeRender } = useLoop();

const fireMeshRef = ref();
const _worldScale = new Vector3();

onBeforeRender(() => {
  fireShader.uniforms.time.value += 0.01;
  const m = fireMeshRef.value;
  if (m) {
    // Keep inverse model matrix up to date (world to local)
    m.updateMatrixWorld();
    fireShader.uniforms.invModelMatrix.value.copy(m.matrixWorld).invert();
    // Keep world scale for consistent ray step size relative to world size
    m.getWorldScale(_worldScale);
    fireShader.uniforms.scale.value.copy(_worldScale);
  }
});
</script>
<template>
  <Box :scale="0.5" :position-z="-1.5" />
  <TresMesh ref="fireMeshRef" :position="[0.5, 0, 0]" :scale="1">
    <TresBoxGeometry :args="[1, 1, 1]" />
    <TresShaderMaterial v-bind="fireShader" />
  </TresMesh>
  <Box :scale="0.5" :position="[1, 0, 1.5]" />
</template>
