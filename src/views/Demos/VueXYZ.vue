<script setup>
import { reactive, ref, watch } from 'vue'
import { TresCanvas, vLog } from '@tresjs/core'
import { OrbitControls } from '@tresjs/cientos'
import { useTriangle, usePolygon } from 'vuexyz'
import { BufferGeometry, BufferAttribute, Shape, ExtrudeGeometry, DoubleSide } from 'three'
import { Pane } from 'tweakpane';

const pane = new Pane();

const { vertices: Tvertices, edges, faces } = useTriangle({ sideLength: 1 })
console.log('jaime ~ faces:', faces.value);
console.log('jaime ~ edges:', edges.value);
console.log('jaime ~ Tvertices:', Tvertices.value);

const traingleGeometry = new BufferGeometry();
const triangleVertices = new Float32Array([
  Tvertices.value[0].x, Tvertices.value[0].y, 0, // v0
  Tvertices.value[1].x, Tvertices.value[1].y, 0, // v2
  Tvertices.value[2].x, Tvertices.value[2].y, 0, // v1
]);

traingleGeometry.setAttribute('position', new BufferAttribute(triangleVertices, 3));

// POLYGON
const extrudeSettings = reactive({ 
	depth: 2, 
	bevelEnabled: true, 
	bevelSegments: 2, 
	steps: 2, 
	bevelSize: 1, 
	bevelThickness: 1 
});

const polygonGeometry = ref()
const polygonOptions = reactive({
  sides: 8,
  sideLength: 0.5,
  wireframe: true,
})

pane.addBinding(polygonOptions, 'sides', {
  min: 3,
  max: 12,
  steps: 1,
});
pane.addBinding(polygonOptions, 'wireframe');
pane.addBinding(extrudeSettings, 'depth', {
  min: 1,
  max: 8,
  steps: 1,
});
pane.addBinding(extrudeSettings, 'bevelSegments', {
  min: 1,
  max: 8,
  steps: 1,
});
pane.addBinding(extrudeSettings, 'bevelEnabled');


watch([polygonOptions, extrudeSettings], () => {
  generatePolygonGeo();
}, { deep: true });

const generatePolygonGeo = () => {
  polygonGeometry.value?.dispose();
  polygonGeometry.value = null;
  const { vertices: Pvertices } = usePolygon({ sides: polygonOptions.sides, sideLength: polygonOptions.sideLength })

  const polygonShape = new Shape();

  Pvertices.value.map((vertex, index) => {
    if (index === 0) {
      polygonShape.moveTo(vertex.x, vertex.y);
    } else {
      polygonShape.lineTo(vertex.x, vertex.y);
    }
  });

  polygonGeometry.value = new ExtrudeGeometry(polygonShape, extrudeSettings );
}
generatePolygonGeo();

</script>
<template>
  <TresCanvas window-size clear-color="#111" ref="canvasRef">
    <TresPerspectiveCamera :position="[0, 0, 15]" :fov="45" :aspect="1" :near="0.1" :far="1000" />
    <OrbitControls />
    <TresMesh name="triangle" :geometry="traingleGeometry">
      <TresMeshBasicMaterial :side="DoubleSide" :color="0x00ff00" />
    </TresMesh>
    <TresMesh name="Polygon" v-log :position-y="2" :geometry="polygonGeometry">
      <TresMeshBasicMaterial :side="DoubleSide" :color="0x00ff" :wireframe="polygonOptions.wireframe" />
    </TresMesh>
  </TresCanvas>
</template>