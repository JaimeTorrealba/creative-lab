<script setup>
import { reactive, ref, watch } from 'vue'
import { TresCanvas, vLog } from '@tresjs/core'
import { OrbitControls } from '@tresjs/cientos'
import { useTriangle, usePolygon, useEllipse } from 'vuexyz'
import { BufferGeometry, BufferAttribute, Shape, ExtrudeGeometry, DoubleSide, CubicBezierCurve,  Vector2, CurvePath } from 'three'
import { Pane } from 'tweakpane';

const pane = new Pane();

const { vertices: Tvertices, edges, faces } = useTriangle({ sideLength: 1 })
console.log('jaime ~ TRIANGLE faces:', faces.value);
console.log('jaime ~ TRIANGLE edges:', edges.value);
console.log('jaime ~ TRIANGLE Tvertices:', Tvertices.value);

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

  polygonGeometry.value = new ExtrudeGeometry(polygonShape, extrudeSettings);
}
generatePolygonGeo();

// ELLIPSE

const ellipseShape = new Shape();
const { edges: Eedges } = useEllipse({ xRadius: 1, yRadius: 0.5 })

const [ellipseValue] = Eedges.value;
console.log('jaime ~ ellipseValue:', ellipseValue);
const storeCurves = [] 
ellipseValue.map((vertex) => {
  const curve = new CubicBezierCurve(
    new Vector2( vertex.start.x, vertex.start.y ),
    new Vector2( vertex.c1.x, vertex.c1.y ),
    new Vector2( vertex.c2.x, vertex.c2.y ),
    new Vector2( vertex.end.x, vertex.end.y )
  );
  storeCurves.push(curve);
  // const points = curve.getPoints( 50 );
  // console.log('jaime ~ ellipseGeometry:', ellipseGeometry);
});
const curve = new CurvePath();
curve.curves = [...storeCurves];
const ellipseGeometry = new BufferGeometry().setFromPoints( curve.getSpacedPoints(50))

</script>
<template>
  <TresCanvas window-size clear-color="#111" ref="canvasRef">
    <TresPerspectiveCamera :position="[0, 0, 15]" :fov="45" :aspect="1" :near="0.1" :far="1000" />
    <OrbitControls />
    <TresMesh name="triangle" :geometry="traingleGeometry">
      <TresMeshBasicMaterial :side="DoubleSide" :color="0x00ff00" />
    </TresMesh>
    <TresMesh name="Polygon" v-log :position-y="3" :geometry="polygonGeometry">
      <TresMeshBasicMaterial :side="DoubleSide" :color="0x00ff" :wireframe="polygonOptions.wireframe" />
    </TresMesh>
    <TresLine name="Ellipse" :position-x="-3" :geometry="ellipseGeometry" >
      <TresLineBasicMaterial :side="DoubleSide" :color="0xff0000"  />
    </TresLine>
  </TresCanvas>
</template>