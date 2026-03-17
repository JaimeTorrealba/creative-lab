<script setup>
import { ref } from "vue";
import { useTres, useLoop } from "@tresjs/core";
import { Plane, useTextures, Sky, ScrollControls } from "@tresjs/cientos";
import { CubicBezierCurve3, Vector3, BufferGeometry } from "three";

const { camera } = useTres();

const { textures, isLoading } = useTextures([
  "/textures/world-creator-moore/color.jpg",
  "/textures/world-creator-moore/normal.jpg",
  "/textures/world-creator-moore/height.jpg",
  "/textures/world-creator-moore/ao.png",
]);

const progress = ref(0);
const originalPoints = [
  [-1.8, 1.2, 50],
  [40, 2, 10],
  [-10,1.5,30],
  [-23, 1.2, -15],
];

const bezierCurve = new CubicBezierCurve3(
  new Vector3(...originalPoints[0]),
  new Vector3(...originalPoints[1]),
  new Vector3(...originalPoints[2]),
  new Vector3(...originalPoints[3])
);

const points = bezierCurve.getPoints(50);
const geometry = new BufferGeometry().setFromPoints(points);

const { onBeforeRender } = useLoop();

onBeforeRender(() => {
  const target = bezierCurve.getPoint(progress.value);
  camera.value.position.lerp(target, 0.1);
  camera.value.lookAt(-23, 2, -25);
});
</script>
<template>
  <ScrollControls :distance="0" v-model="progress" />
  <Plane
    receive-shadow
    cast-shadow
    :args="[5, 5, 500, 500]"
    v-if="!isLoading"
    :scale="20"
  >
    <TresMeshStandardMaterial
      :map="textures[0]"
      :normalMap="textures[1]"
      :displacementMap="textures[2]"
      :aoMap="textures[3]"
    />
  </Plane>
  <TresLine :geometry="geometry">
    <TresLineBasicMaterial color="red" />
  </TresLine>
  <Sky />
</template>
