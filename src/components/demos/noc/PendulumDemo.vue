<script setup>
import { useLoop } from "@tresjs/core";
import { useWindowSize } from "@vueuse/core";
import { Vector2 } from "three";
import { shallowRef, reactive } from "vue";
import { Pane } from "tweakpane";
import { convertToScreenCoords } from "./utils.js";
import { Line2 } from "three/examples/jsm/lines/Line2.js";
import { LineGeometry } from "three/examples/jsm/lines/LineGeometry.js";
import { LineMaterial } from "three/examples/jsm/lines/LineMaterial.js";

const { width, height } = useWindowSize();
const sphereRef = shallowRef(null);
const pane = new Pane();

const options = reactive({
  length: 300,
  gravity: 0.1,
  damping: false,
});

// LINE
const lineRef = shallowRef(null);
const lineGeometry = new LineGeometry();
const lineMaterial = new LineMaterial({
  color: 0x00ff88,
  worldUnits: true,
  linewidth: 5,
  dashed: false,
});
const line = new Line2(lineGeometry, lineMaterial);
lineRef.value = line;


// Internals
let angle = Math.PI / 4;
let angleVelocity = 0;
let angleAcceleration = 0;

const origin = new Vector2(0, height.value / 2);
convertToScreenCoords(origin, width, height);
const originWorld = new Vector2(origin.x - width.value / 2, height.value / 2 - origin.y);

class Bob {
  constructor() {
    this.position = new Vector2();
    this.worldPosition = new Vector2();
  }
  update() {
    const force = options.gravity * Math.sin(angle);
    angleAcceleration = (-1 * force) / options.length;
    angleVelocity += angleAcceleration;
    angle += angleVelocity;

    if (options.damping) {
      angleVelocity *= 0.99;
    }

    this.position.set(
      options.length * Math.sin(angle) + origin.x,
      options.length * Math.cos(angle) + origin.y
    );
    this.updateWorldPosition();
  }
  updateWorldPosition() {
    const centeredX = this.position.x - width.value / 2;
    const centeredY = height.value / 2 - this.position.y; // flip Y so +Y is up
    this.worldPosition.set(centeredX, centeredY);
  }
}

const bob = new Bob();

pane.addBinding(options, "gravity", { min: -1, max: 1, step: 0.01 });
pane.addBinding(options, "length", { min: 50, max: 500, step: 1 });
pane.addBinding(options, "damping");

const { onBeforeRender } = useLoop();
onBeforeRender(() => {
  bob.update();
  if (lineRef.value) {
    const positions = [
      originWorld.x,
      originWorld.y,
      0,
      bob.worldPosition.x,
      bob.worldPosition.y,
      0,
    ];
    lineGeometry.setPositions(positions);
    lineGeometry.computeBoundingSphere();
  }
  if (sphereRef.value) {
    sphereRef.value.position.x = bob.worldPosition.x;
    sphereRef.value.position.y = bob.worldPosition.y;
  }
});
</script>
<template>
  <TresMesh ref="sphereRef">
    <TresSphereGeometry :args="[64, 48]" />
    <TresMeshLambertMaterial :color="'#f7f7f7'" :shininess="100" />
  </TresMesh>
  <primitive v-if="lineRef" :object="lineRef" />
</template>
