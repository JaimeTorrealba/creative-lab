<script setup>
import { useLoop } from "@tresjs/core";
import {
  BufferGeometry,
  CatmullRomCurve3,
  Vector3,
  FrontSide,
  BackSide,
  MeshStandardMaterial,
} from "three";
import { useTextures } from "@tresjs/cientos";
import { Pane } from "tweakpane";
import { reactive, shallowRef, watch, ref } from "vue";
import { watchOnce } from "@vueuse/core";

const pane = new Pane();

const options = reactive({
  debugCurve: false,
});

pane.addBinding(options, "debugCurve");

const { textures, isLoading } = useTextures([
  "/textures/front_ribbon.png",
  "/textures/back_ribbon.png",
]);

const frontMaterial = new MeshStandardMaterial({
  side: BackSide,
  roughness: 0.65,
  metalness: 0.25,
  alphaTest: true,
});
const backMaterial = new MeshStandardMaterial({
  side: FrontSide,
  roughness: 0.65,
  metalness: 0.25,
  alphaTest: true,
});

const materials = ref([]);

watchOnce(isLoading, (value) => {
  if (!value) {
    textures.value.forEach((t) => {
      t.wrapS = t.wrapT = 1000;
      t.repeat.set(1, 1);
      t.offset.setX(0.5);
      t.flipY = false;
    });
    textures.value[1].repeat.set(-1, 1);
    frontMaterial.map = textures.value[0];
    backMaterial.map = textures.value[1];
    materials.value = [frontMaterial, backMaterial];
  }
});

const pointsLength = 10;
const curvePoints = [];
for (let i = 0; i < pointsLength; i++) {
  const theta = (i / pointsLength) * Math.PI * 2;
  curvePoints.push(
    new Vector3().setFromSphericalCoords(2, Math.PI / 2 + (Math.random() - 0.5), theta)
  );
}
const curve = new CatmullRomCurve3(curvePoints);
curve.closed = true;
curve.tension = 0.5;
const points = curve.getPoints(50);
const curveGeometry = new BufferGeometry().setFromPoints(points);

const vertices = 100;
const spacedPoints = curve.getSpacedPoints(vertices);
const dimensions = [-0.2, 0.2];
// the method computes the tangents, normals and binormals for each segment of the curve
const frenetFrames = curve.computeFrenetFrames(vertices, true);

let _point = new Vector3();
let binormalsShift = new Vector3();

const finalPoints = [];

dimensions.forEach((dimension) => {
  for (let i = 0; i <= vertices; i++) {
    _point = spacedPoints[i];
    binormalsShift.add(frenetFrames.binormals[i]).multiplyScalar(dimension);
    finalPoints.push(new Vector3().copy(_point).add(binormalsShift));
  }
});

finalPoints[0].copy(finalPoints[vertices]);
finalPoints[vertices + 1].copy(finalPoints[vertices * 2 + 1]);

const ribbonGeometryRef = shallowRef();
watch(ribbonGeometryRef, (geo) => {
  geo.setFromPoints(finalPoints);
  //Nice trick to use two materials on the same geometry
  geo.addGroup(0, 6000, 0);
  geo.addGroup(0, 6000, 1);
});

const { onBeforeRender } = useLoop();
onBeforeRender(({ elapsed }) => {
  if (isLoading.value) return;
  textures.value[0].offset.x = elapsed * 0.1;
  textures.value[1].offset.x = -elapsed * 0.1;
});
</script>
<template>
  <TresLine :geometry="curveGeometry" :visible="options.debugCurve">
    <TresLineBasicMaterial color="red" />
  </TresLine>
  <!-- Ribbon mesh -->
  <TresMesh :material="materials">
    <TresPlaneGeometry ref="ribbonGeometryRef" :args="[1, 1, vertices, 1]" />
  </TresMesh>
  <TresAmbientLight :intensity="0.5" />
  <TresDirectionalLight :position="[0, 5, 0]" :intensity="2" />
</template>
