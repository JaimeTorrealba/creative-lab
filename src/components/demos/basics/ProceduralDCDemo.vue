<script setup>
import { ref } from "vue";
import { useLoop } from "@tresjs/core";
import { TransformControls } from "@tresjs/cientos";
import { useCircle } from "vuexyz";
import { Vector3, BufferGeometry } from "three";

const redCircle = ref();
const blueCircle = ref();
const yellowCircle = ref();
const whiteCircle = ref();
const pinkCircle = ref();
const brownCircle = ref();
const greyCircle = ref();
const desiredDistance = 1.5;
const maxDistance = 2;

const circle = useCircle({ radius: 1, position: { x: 0, y: 0 } });
const circleGeometry = new BufferGeometry().setFromPoints(
  circle.threeCurvePath.value.getSpacedPoints(50)
);

function updateConstraint(meshA, meshB) {
  const delta = new Vector3().subVectors(meshB.position, meshA.position);
  const currentDistance = delta.length();
  if (currentDistance > maxDistance) {
    const correction = delta
      .setLength(desiredDistance)
      .add(meshA.position)
      .sub(meshB.position);
    meshB.position.add(correction);
  }
}

const { onBeforeRender } = useLoop();
onBeforeRender(() => {
  if (!redCircle.value || !blueCircle.value || !yellowCircle.value || !whiteCircle.value || !pinkCircle.value || !brownCircle.value || !greyCircle.value)
    return;
  updateConstraint(redCircle.value, blueCircle.value);
  updateConstraint(blueCircle.value, yellowCircle.value);
  updateConstraint(yellowCircle.value, whiteCircle.value);
  updateConstraint(whiteCircle.value, pinkCircle.value);
  updateConstraint(pinkCircle.value, brownCircle.value);
  updateConstraint(brownCircle.value, greyCircle.value);
});
</script>
<template>
  <TransformControls :object="redCircle" />

  <TresLine ref="redCircle" :geometry="circleGeometry">
    <TresLineBasicMaterial :color="0xff0000" />
  </TresLine>
  <TresLine ref="blueCircle" :position-x="2" :geometry="circleGeometry">
    <TresLineBasicMaterial color="blue" />
  </TresLine>
  <TresLine ref="yellowCircle" :position-x="4" :geometry="circleGeometry">
    <TresLineBasicMaterial color="yellow" />
  </TresLine>
  <TresLine ref="whiteCircle" :position-x="6" :geometry="circleGeometry">
    <TresLineBasicMaterial color="white" />
  </TresLine>
  <TresLine ref="pinkCircle" :position-x="8" :geometry="circleGeometry">
    <TresLineBasicMaterial color="pink" />
  </TresLine>
  <TresLine ref="brownCircle" :position-x="10" :geometry="circleGeometry">
    <TresLineBasicMaterial color="brown" />
  </TresLine>
  <TresLine ref="greyCircle" :position-x="12" :geometry="circleGeometry">
    <TresLineBasicMaterial color="grey" />
  </TresLine>
</template>
