<script setup>
import { shallowRef, watch, computed } from "vue";
import { useLoop } from "@tresjs/core";
import { useGLTF, CustomShaderMaterial } from "@tresjs/cientos";
import { Pane } from "tweakpane";
import {
  DoubleSide,
  MeshStandardMaterial,
  MeshDepthMaterial,
  RGBADepthPacking,
  Uniform,
} from "three";
import fragment from "./shaders/slicedModel/fragment.glsl";
import vertex from "./shaders/slicedModel/vertex.glsl";

// patch map not working
const patchMap = {
  csm_Slice: {
    "*": `
      #include <colorspace_fragment>
        if(!gl_FrontFacing){ 
        gl_FragColor = vec4(0.75, 0.15, 0.3, 1.0);
        }
        `,
  },
};
const uniforms = {
  uSliceStart: new Uniform(1.75),
  uSliceArc: new Uniform(1.25),
};

const pane = new Pane();
pane.addBinding(uniforms.uSliceStart, "value", {
  min: -Math.PI,
  max: Math.PI,
  step: 0.01,
  label: "Slice Start",
});
pane.addBinding(uniforms.uSliceArc, "value", {
  min: 0,
  max: Math.PI * 2,
  step: 0.01,
  label: "Slice Arc",
});

const csmMaterialRef = shallowRef();
const csmDepthMaterialRef = shallowRef();
const material = new MeshStandardMaterial({
  metalness: 0.5,
  roughness: 0.25,
  envMapIntensity: 0.5,
  color: "#858080",
});

const slicedMaterial = {
  // CSM materials
  baseMaterial: MeshStandardMaterial,
  fragmentShader: fragment,
  vertexShader: vertex,
  uniforms: uniforms,
  patchMap: patchMap,
  // standard material
  metalness: 0.5,
  roughness: 0.25,
  envMapIntensity: 0.5,
  color: "#858080",
  side: DoubleSide,
};
const slicedDepthMaterial = {
  // CSM materials
  baseMaterial: MeshDepthMaterial,
  fragmentShader: fragment,
  vertexShader: vertex,
  uniforms: uniforms,
  patchMap: patchMap,
  // standard material
  depthPacking: RGBADepthPacking,
};

const { state, isLoading } = useGLTF("/models/gears.glb", {
  draco: true,
  traverse: (child) => {
    if (child.isMesh) {
      if (child.name === "outerHull") {
        child.material = csmMaterialRef.value.instance;
        child.customDepthMaterial = csmDepthMaterialRef.value.instance;
      } else {
        child.material = material;
      }
      child.castShadow = true;
      child.receiveShadow = true;
    }
  },
});

const model = computed(() => state.value.scene);

watch(isLoading, (newVal) => {
  if (!newVal) {
    console.log("GLTF Model Loaded:", model.value);
  }
});

const { onBeforeRender } = useLoop();

onBeforeRender(({ elapsed }) => {
  if (!isLoading.value) {
    state.value.scene.rotation.y = elapsed * 0.1;
  }
});
</script>
<template>
  <primitive v-if="!isLoading" :object="state.scene" />
  <TresMesh receive-shadow :position="[-4, -3, -4]" :look-at="[0, 0, 0]">
    <TresPlaneGeometry :args="[10, 10, 10]" />
    <TresMeshStandardMaterial color="#aaa" />
  </TresMesh>
  <TresMesh :visible="false">
    <CustomShaderMaterial ref="csmMaterialRef" v-bind="slicedMaterial" />
  </TresMesh>
  <TresMesh :visible="false">
    <CustomShaderMaterial ref="csmDepthMaterialRef" v-bind="slicedDepthMaterial" />
  </TresMesh>
  <TresDirectionalLight
    :position="[6.25, 3, 4]"
    cast-shadow
    ref="directionalLight"
    :intensity="4"
    :color="'#ffffff'"
    :shadow-mapSize-width="1024"
    :shadow-mapSize-height="1024"
    :shadow-camera-near="0.1"
    :shadow-camera-far="30"
    :shadow-normalBias="0.05"
    :shadow-camera-top="8"
    :shadow-camera-right="8"
    :shadow-camera-bottom="-8"
    :shadow-camera-left="-8"
  />
</template>
