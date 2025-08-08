<script setup>
import { ref, reactive } from "vue";
import { useTexture, useLoop } from "@tresjs/core";
import { RepeatWrapping } from "three";
import { Pane } from 'tweakpane';

const textures = await useTexture([
  "/images/Parallax_Forest/01_Mist.png",
  "/images/Parallax_Forest/02_Bushes.png",
  "/images/Parallax_Forest/04_Forest.png",
  "/images/Parallax_Forest/06_Forest.png",
  "/images/Parallax_Forest/09_Forest.png",
  "/images/Parallax_Forest/08_Forest.png",
]);

textures.forEach((texture) => {
  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;
});

const materialBase = {
  color: "#ffffff",
  transparent: true,
};

const MistMaterial = {
  ...materialBase,
  map: textures[0],
};
const BushMaterial = {
  ...materialBase,
  map: textures[1],
};
const ForestMaterial = {
  ...materialBase,
  map: textures[2],
};
const ForestMaterial2 = {
  ...materialBase,
  map: textures[3],
};
const bushMaterial2 = {
  ...materialBase,
  map: textures[4],
};

const options = reactive({
    speed: 0.1,
    forestZPosition: -0.11,
    forest2ZPosition: -0.12,
    bushZPosition: -0.13,
})

const pane = new Pane();

pane.addBinding(options, 'speed', {
    label: 'Speed',
    min: -2,
    max: 2,
    step: 0.01
})

pane.addBinding(options, 'forestZPosition', {
    label: 'Forest Z Position',
    min: -0.2,
    max: 0.2,
    step: 0.01
});

pane.addBinding(options, 'forest2ZPosition', {
    label: 'Forest 2 Z Position',
    min: -0.2,
    max: 0.2,
    step: 0.01
});

pane.addBinding(options, 'bushZPosition', {
    label: 'Bush Z Position',
    min: -0.2,
    max: 0.2,
    step: 0.01
});

const bushesRef = ref(null);
const forestRef = ref(null);
const forest2Ref = ref(null);
const bushRef = ref(null);

const { onBeforeRender } = useLoop();

onBeforeRender(({ elapsed }) => {
  bushesRef.value.material.map.offset.x = elapsed * options.speed;
  forestRef.value.material.map.offset.x = elapsed * options.speed * 0.5;
  forest2Ref.value.material.map.offset.x = elapsed * options.speed * 0.2;
  bushRef.value.material.map.offset.x = elapsed * options.speed * 0.1;
});
</script>
<template>
  <TresMesh ref="bushesRef" name="bushes">
    <TresPlaneGeometry :args="[6, 6]" />
    <TresMeshStandardMaterial v-bind="BushMaterial" />
  </TresMesh>
  <TresMesh name="mist" :position-z="-0.1">
    <TresPlaneGeometry :args="[6, 6]" />
    <TresMeshStandardMaterial v-bind="MistMaterial" />
  </TresMesh>
  <TresMesh ref="forestRef" name="forest" :position-z="options.forestZPosition">
    <TresPlaneGeometry :args="[6, 6]" />
    <TresMeshStandardMaterial v-bind="ForestMaterial" />
  </TresMesh>
  <TresMesh ref="forest2Ref" name="forest2" :position-z="options.forest2ZPosition">
    <TresPlaneGeometry :args="[6, 6]" />
    <TresMeshStandardMaterial v-bind="ForestMaterial2" />
  </TresMesh>
  <TresMesh ref="bushRef" name="bush" :position-z="options.bushZPosition">
    <TresPlaneGeometry :args="[6, 6]" />
    <TresMeshStandardMaterial v-bind="bushMaterial2" />
  </TresMesh>
</template>
