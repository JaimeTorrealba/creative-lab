<script setup>
import { TresCanvas, vLog } from '@tresjs/core'
import { OrbitControls } from '@tresjs/cientos'
import { useTriangle, usePolygon } from 'vuexyz'
import { BufferGeometry, BufferAttribute, Shape, ShapeGeometry } from 'three'

const { vertices: Tvertices, edges, faces } = useTriangle({ sideLength: 1 })
console.log('jaime ~ faces:', faces.value);
console.log('jaime ~ edges:', edges.value);
console.log('jaime ~ Tvertices:', Tvertices.value);

const traingleGeometry = new BufferGeometry();
const triangleVertices = new Float32Array([
  Tvertices.value[0].x, Tvertices.value[0].y, 1.0, // v0
  Tvertices.value[1].x, Tvertices.value[1].y, 1.0, // v2
  Tvertices.value[2].x, Tvertices.value[2].y, 1.0, // v1
]);

traingleGeometry.setAttribute('position', new BufferAttribute(triangleVertices, 3));

// POLYGON

const { vertices: Pvertices } = usePolygon({ sides: 8, sideLength: 0.5 })
console.log('jaime ~ Pvertices:', Pvertices.value);

const polygonShape = new Shape();

Pvertices.value.map((vertex, index) => {
  if (index === 0) {
    polygonShape.moveTo(vertex.x, vertex.y);
  } else {
    polygonShape.lineTo(vertex.x, vertex.y);
  }
});

const polygonGeometry = new ShapeGeometry(polygonShape);

</script>
<template>
  <TresCanvas window-size clear-color="#111" ref="canvasRef">
    <TresPerspectiveCamera :position="[0, 0, 15]" :fov="45" :aspect="1" :near="0.1" :far="1000" />
    <OrbitControls />
    <TresMesh :geometry="traingleGeometry">
      <TresMeshBasicMaterial :color="0x00ff00" />
    </TresMesh>
    <TresMesh v-log :position-y="2" :geometry="polygonGeometry">
      <TresMeshBasicMaterial :color="0x00ff" />
    </TresMesh>
    <TresDirectionalLight :position="[0, 2, 4]" :intensity="2" />
    <TresAmbientLight />
  </TresCanvas>
</template>