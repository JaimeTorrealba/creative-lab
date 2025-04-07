<script setup>
import { watch, shallowRef, defineModel, onMounted } from "vue";
import { Billboard } from "@tresjs/cientos";
import { useTresContext, useTexture } from "@tresjs/core";
import gsap from "gsap";
import { Vector3, Mesh, Group, SRGBColorSpace, LinearFilter } from "three";

const props = defineProps({
  items: {
    type: Array,
    default: () => [],
  },
});

const { camera } = useTresContext();
const model = defineModel();
const groupRef = shallowRef(null);

const urls = props.items.map((item) => item);
const rawTextures = await useTexture([...urls]);
const textures = rawTextures.map((texture) => {
  texture.colorSpace = SRGBColorSpace;
  texture.generateMipmaps = false;
  texture.minFilter = LinearFilter;
  texture.magFilter = LinearFilter;
  return texture;
});
const shaders = textures.map((texture) => {
  return {
    transparent: true,
    uniforms: {
      diffTexture: { value: texture },
    },
    vertexShader: `
        varying vec2 vUv;
       void main() {
         gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
         vUv = uv;
       }
     `,
    fragmentShader: `
       uniform sampler2D diffTexture;
       varying vec2 vUv;
 
       void main() { 
       vec2 texCoords = vUv;
 
       vec4 img = texture2D(diffTexture, texCoords);
 
         gl_FragColor = vec4(img);
       }
     `,
  };
});

const imgLength = props.items.length;
const initPositions = [];
props.items.map((_elem, _index) => {
  const range = (_index % imgLength) / imgLength;
  const angle = range * Math.PI * 2;
  const radius = 8 + range;
  const z = Math.cos(angle) * radius;
  const x = Math.sin(angle) * radius;
  const y = 1;
  initPositions.push(new Vector3(x, y, z));
});

watch(model, (_value) => {
  if (!groupRef.value || _value === undefined) return;
  const range = (_value % imgLength) / imgLength;
  const angle = range * Math.PI * 2;

  //Set scale to all children
  groupRef.value.children.map((child) => {
    if (!(child instanceof Group)) return;
    const mesh = child.children[0].children[0];
    gsap.set(mesh.scale, {
      x: 1.25,
      y: 1.25,
      z: 1.25,
    });
  });

  gsap.to(groupRef.value.rotation, {
    y: (y) => y - angle,
    duration: 0.25,
    ease: "power2.inOut",
    onComplete: () => computeEffectBackFaces(),
  });
});

function minValue(...args) {
   const min = args.reduce((acc, val) => {
     return acc < val ? acc : val;
   });
   return min;
 }
const computeEffectBackFaces = () => {
   const meshes = [];
   groupRef.value?.children.map((child) => {
     if (!(child instanceof Group)) return;
     const mesh = child.children[0].children[0];
     const _position = new Vector3();
     mesh.getWorldPosition(_position);
     const distance = camera.value?.position
       ? _position.distanceTo(camera.value.position)
       : Infinity;
     (mesh).distance = distance;
     if (mesh instanceof Mesh) {
       meshes.push(mesh);
     }
   });
 
   const smaller = minValue(...meshes.map((mesh) => mesh.distance));
   const BackMeshes = meshes.filter((mesh) => mesh.distance !== smaller);
 
   gsap.defaults({
     duration: 0.05,
     ease: "power2.inOut",
   });
 
   BackMeshes.map((_mesh) => {
     gsap.to(_mesh.scale, {
       x: 0.8,
       y: 0.8,
       z: 0.8,
     });
   });
 };

onMounted(() => {
   computeEffectBackFaces();
 });
</script>
<template>
  <TresGroup ref="groupRef">
    <Billboard
      v-for="(item, i) in items"
      :key="item.title"
      :position="[...initPositions[i]]"
    >
      <TresMesh :name="item.title">
        <TresPlaneGeometry :args="[4.44, 2]" />
        <TresShaderMaterial v-bind="shaders[i]" />
      </TresMesh>
    </Billboard>
    <TresMesh
      v-for="(item, i) in items"
      :key="item.title"
      :position="[initPositions[i].x, initPositions[i].y - 2, initPositions[i].z]"
      :rotation-x="-Math.PI / 2"
    >
      <TresCircleGeometry :args="[0.75, 16]" />
      <TresMeshBasicMaterial color="#111" />
    </TresMesh>
  </TresGroup>

  <TresMesh :position-y="-2" :rotation-x="-Math.PI / 2">
    <TresPlaneGeometry :args="[100, 100]" />
    <TresMeshStandardMaterial color="#182833" />
  </TresMesh>
</template>
