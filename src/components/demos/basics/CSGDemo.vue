<script setup>
import { shallowRef } from 'vue'
import { OrbitControls, TransformControls } from '@tresjs/cientos'

import { SUBTRACTION, Brush, Evaluator } from 'three-bvh-csg';
import { SphereGeometry } from 'three';

const boxRef = shallowRef();
const result = shallowRef();
const csgRef = shallowRef();

const updateCut = () => {
  if(!boxRef.value) return
  const brush1 = new Brush(new SphereGeometry());
  brush1.updateMatrixWorld();

  csgRef.value.geometry.dispose();
  const brush2 = new Brush(boxRef.value.geometry);
  brush2.position.x += boxRef.value.position.x
  // brush2.position.copy(boxRef.value.position);
  brush2.updateMatrixWorld();

  const evaluator = new Evaluator();
  result.value = evaluator.evaluate(brush1, brush2, SUBTRACTION);

  csgRef.value.geometry = result.value.geometry;
}

const onChange = () => {
  updateCut();
}
</script>
<template>
    <OrbitControls make-default />
    <TresMesh ref="csgRef">
      <TresMeshBasicMaterial :color="0x22ff22" wireframe />
    </TresMesh>
    <TransformControls :object="boxRef" @change="onChange" />
    <TresMesh ref="boxRef" :position="[0, 1, 0]">
      <TresBoxGeometry :args="[1, 1, 1]" />
      <TresMeshBasicMaterial :color="0xff2222" />
    </TresMesh>
</template>