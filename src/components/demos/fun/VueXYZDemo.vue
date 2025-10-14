<script setup>
import { reactive, ref, watch } from 'vue'
import { useTriangle, usePolygon, useEllipse } from 'vuexyz'
import { BufferGeometry, ExtrudeGeometry, DoubleSide } from 'three'
import { Pane } from 'tweakpane';

const pane = new Pane();

const { threeShape: triangleShape } = useTriangle({ sideLength: 1 })

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

const polygonPane = pane.addFolder({
  title: 'Polygon',
});

polygonPane.addBinding(polygonOptions, 'sides', {
  min: 3,
  max: 12,
  steps: 1,
});
polygonPane.addBinding(polygonOptions, 'wireframe');
polygonPane.addBinding(extrudeSettings, 'depth', {
  min: 1,
  max: 8,
  steps: 1,
});
polygonPane.addBinding(extrudeSettings, 'bevelSegments', {
  min: 1,
  max: 8,
  steps: 1,
});
polygonPane.addBinding(extrudeSettings, 'bevelEnabled');


watch([polygonOptions, extrudeSettings], () => {
  generatePolygonGeo();
}, { deep: true });

const generatePolygonGeo = () => {
  polygonGeometry.value?.dispose();
  polygonGeometry.value = null;
  const { threeShape: polygonShape } = usePolygon({ sides: polygonOptions.sides, sideLength: polygonOptions.sideLength })

  polygonGeometry.value = new ExtrudeGeometry(polygonShape.value, extrudeSettings);
}
generatePolygonGeo();

// ELLIPSE
const ellipseGeometry = ref()
const ellipseOptions = reactive({
  xRadius: 1,
  yRadius: 0.5,
})

const ellipsePane = pane.addFolder({
  title: 'Ellipse',
});
ellipsePane.addBinding(ellipseOptions, 'xRadius', {
  min: 0.1,
  max: 5,
  steps: 0.1,
});
ellipsePane.addBinding(ellipseOptions, 'yRadius', {
  min: 0.1,
  max: 5,
  steps: 0.1,
});


watch([ellipseOptions, extrudeSettings], () => {
  generateEllipseGeo();
}, { deep: true });

const generateEllipseGeo = () => {
  const { threeCurvePath: ellipseShape } = useEllipse({ xRadius: ellipseOptions.xRadius, yRadius: ellipseOptions.yRadius })
  ellipseGeometry.value?.dispose();
  ellipseGeometry.value = null;
  ellipseGeometry.value = new BufferGeometry().setFromPoints(ellipseShape.value.getSpacedPoints(50))
}
generateEllipseGeo()

</script>
<template>
    <TresMesh name="triangle" :scale="2">
        <TresShapeGeometry :args="[triangleShape]"/>
        <TresMeshBasicMaterial :side="DoubleSide" :color="0x00ff00" />
      </TresMesh>
      <TresMesh name="Polygon" :position-y="3" :geometry="polygonGeometry">
        <TresMeshBasicMaterial :side="DoubleSide" :color="0x00ff" :wireframe="polygonOptions.wireframe" />
      </TresMesh>
      <TresLine name="Ellipse" :position-x="-3" :geometry="ellipseGeometry">
        <TresLineBasicMaterial :side="DoubleSide" :color="0xff0000" />
      </TresLine>
</template>