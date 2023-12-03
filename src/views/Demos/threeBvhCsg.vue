<script setup>
import { ref, watch } from 'vue'
import { TresCanvas } from '@tresjs/core'
import { CameraControls } from '@tresjs/cientos';
import { SUBTRACTION, Brush, Evaluator } from 'three-bvh-csg';
import { MeshStandardMaterial, Mesh, SphereGeometry, BoxGeometry } from 'three';

// const brush1 = new Brush( new SphereGeometry() );
// brush1.updateMatrixWorld();

// const brush2 = new Brush( new BoxGeometry() );
// brush2.position.y = 0.5;
// brush2.updateMatrixWorld();

// const evaluator = new Evaluator();
// const result = evaluator.evaluate( brush1, brush2, SUBTRACTION );

// const mesh = new Mesh( result, new MeshStandardMaterial() );

// const sphere1 = ref()
// const sphere2 = ref()
// const brush1 = ref()
// const brush2 = ref()
// const evaluator = ref()

// watch(sphere1, value => {
//   brush1.value = new Brush( value.geometry );
//   brush1.value.updateMatrixWorld();
// })
// watch(sphere2, value => {
//   brush2.value = new Brush( value.geometry );
//   brush2.value.updateMatrixWorld();
// })
// watch([brush1, brush2], ([b1, b2]) => {
//   if ( b1 && b2 ) {
//     console.log('jaime ~ watch ~ b1:', b1);
//     console.log('jaime ~ watch ~ b2:', b2);
//     evaluator.value = new Evaluator();
//     const result = evaluator.value.evaluate( b1, b2, SUBTRACTION );
//     console.log( result );
//   }
// })

</script>
<template>
  <TresCanvas window-size clear-color="#111" ref="canvasRef">
    <TresPerspectiveCamera :position="[0, 0, 3]" :fov="45" :aspect="1" :near="0.1" :far="1000" />
    <CameraControls :distance="15" />
    <TresMesh :position="[-0.5, 0, 0]" ref="sphere1">
      <TresSphereGeometry :args="[1, 16]" />
      <TresMeshStandardMaterial :color="0x11ff11" />
    </TresMesh>
    <TresMesh :position="[0.5, 0, 0]" ref="sphere2">
      <TresSphereGeometry :args="[1, 16]" />
      <TresMeshStandardMaterial :color="0xff1111" />
    </TresMesh>
    <!-- <primitive :object="mesh" /> -->
    <TresDirectionalLight :position="[0, 2, 4]" :intensity="2" />
    <TresAmbientLight />

  </TresCanvas>
</template>