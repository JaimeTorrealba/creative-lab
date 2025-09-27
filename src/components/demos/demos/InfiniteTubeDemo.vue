<script setup>
import { shallowRef, watch, ref } from "vue";
import { useLoop } from "@tresjs/core";
import { Vector3, CatmullRomCurve3, BackSide, TubeGeometry, RepeatWrapping } from "three";
import { useTextures } from "@tresjs/cientos";

const { textures } = await useTextures([
  "/textures/tube/Alien_Flesh_001_color.jpg",
  "/textures/tube/Alien_Flesh_001_norm.jpg",
  "/textures/tube/Alien_Flesh_001_occ.jpg",
]);

const tubeMaterialRef = shallowRef(null);
const tubeRef = ref(null);
const progress = ref(0);

const points = [];

for (var i = 0; i < 5; i += 1) {
  points.push(new Vector3(0, 0, 2.5 * (i / 4)));
}

const curve = new CatmullRomCurve3(points);

watch(tubeMaterialRef, (value) => {
  value.map.wrapS = RepeatWrapping;
  value.map.wrapT = RepeatWrapping;
  value.normalMap.wrapS = RepeatWrapping;
  value.normalMap.wrapT = RepeatWrapping;
  value.aoMap.wrapS = RepeatWrapping;
  value.aoMap.wrapT = RepeatWrapping;
});
watch(progress, (value) => {
  tubeRef.value.geometry.dispose();
  curve.points[2].x = value * 0.05;
  curve.points[2].y = -value * 0.05;
  curve.points[4].x = value * 0.005;
  tubeRef.value.geometry = new TubeGeometry(curve, 70, 0.02, 50, false);
});

const { onBeforeRender } = useLoop();

onBeforeRender(() => {
  tubeMaterialRef.value.map.offset.x = progress.value * -1;
});
</script>
<template>
  <!-- <ScrollControls :distance="0" v-model="progress" /> -->
  <TresMesh :position="[0, 0, -2]" ref="tubeRef">
    <TresTubeGeometry :args="[curve, 70, 0.02, 50, false]" />
    <TresMeshStandardMaterial
      ref="tubeMaterialRef"
      :side="BackSide"
      :map="textures[0]"
      :aoMap="textures[2]"
      :normalMap="textures[1]"
    />
  </TresMesh>
  <TresDirectionalLight :args="[0xffffff, 0.8]" />
  <TresHemisphereLight :args="[0xffffbb, 0x887979, 0.9]" />
</template>
