<script setup>
import * as THREE from 'three';
import { useLoop } from '@tresjs/core';

const points = new THREE.CatmullRomCurve3([
	new THREE.Vector3( 0, 0, 0 ),
	new THREE.Vector3( 0, 0.05, 0.5 ),
	new THREE.Vector3( 0, 0, 0.75 ),
]).getPoints( 50 );
const geometry = new THREE.BufferGeometry().setFromPoints( points );

const onMove = ( event ) => {
   const x = event.intersection.point.x;
   const y = event.intersection.point.y;

   points[ 0 ].x = x;
   points[ 0 ].y = y;

   geometry.setFromPoints( points );
};

const { onBeforeRender } = useLoop();

onBeforeRender(({delta}) => {

   for ( let i = 1; i < points.length; i ++ ) {
      points[ i ].y += (points[ i - 1 ].y - points[ i ].y)  * delta * 15;
      points[ i ].x += (points[ i - 1 ].x - points[ i ].x)  * delta * 15;
   }

   geometry.setFromPoints( points );
});

</script>
<template>
   <TresMesh :visible="false" @pointermove="onMove">
      <TresPlaneGeometry />
      <TresMeshBasicMaterial />
   </TresMesh>
   <TresLine :geometry="geometry">
      <TresLineBasicMaterial :color="'#FF0000'" :linewidth="0.1" />
   </TresLine>
   <TresGridHelper :args="[1,4]" :rotation="[Math.PI * 0.5,0, 0 ]" />
</template>