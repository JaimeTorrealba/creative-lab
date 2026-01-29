<script setup>
import { useLoop } from "@tresjs/core";
import { useWindowSize, useMouse, useMousePressed } from "@vueuse/core";
import { Vector2 } from "three";
import { shallowRef, ref } from "vue";
import { convertToScreenCoords } from "./utils.js";
import { Line2 } from "three/examples/jsm/lines/Line2.js";
import { LineGeometry } from "three/examples/jsm/lines/LineGeometry.js";
import { LineMaterial } from "three/examples/jsm/lines/LineMaterial.js";

// import { Pane } from "tweakpane";

const { width, height } = useWindowSize();
const { x: mouseX, y: mouseY } = useMouse();
const { pressed } = useMousePressed();
const isDragging = ref(false);

const sphereRef = shallowRef(null);
const anchor = new Vector2(0, height.value / 2);
convertToScreenCoords(anchor, width, height);
const originWorld = new Vector2(anchor.x - width.value / 2, height.value / 2 - anchor.y);
const k = 0.01; // spring constant


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

class BasicMover {
  constructor() {
    this.position = new Vector2(
      (width.value / 2),
      height.value / 2
    );
    this.velocity = new Vector2(0, 0);
    this.acceleration = 0;
    this.anchor = new Vector2(width.value / 2, 0);
    this.gravity = new Vector2(0, 0.1);
 // not converted to screen space
    this.worldPosition = new Vector2();
  }
  update() {
    // If dragging, follow the mouse and reset velocity
    if (isDragging.value) {
      this.position.set(mouseX.value, mouseY.value);
      this.velocity.set(0, 0);
      this.updateWorldPosition();
      return;
    }

    const force = new Vector2().subVectors(
      this.position,
      this.anchor
    );
    const restLength = force.length() - height.value / 2; // desired length of spring
    force.normalize();
    force.multiplyScalar(-1 * k * (restLength)); // force = -kX
    this.velocity.add(force);
    this.velocity.add(this.gravity);
    this.position.add(this.velocity);
    this.velocity.multiplyScalar(0.99); // some damping
    this.updateWorldPosition();
  }

  // Check if mouse is over the ball (in screen space)
  isMouseOver() {
    const dx = mouseX.value - this.position.x;
    const dy = mouseY.value - this.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < 150; // 150 is the sphere radius
  }

  // Convert screen space [0..width],[0..height] to centered Three.js world space
  updateWorldPosition() {
    const centeredX = this.position.x - width.value / 2;
    const centeredY = height.value / 2 - this.position.y; // flip Y so +Y is up
    this.worldPosition.set(centeredX, centeredY);
  }
}
let mover = new BasicMover();

const { onBeforeRender } = useLoop();

onBeforeRender(() => {
  // Handle drag start: if pressing and mouse is over the ball
  if (pressed.value && mover.isMouseOver() && !isDragging.value) {
    isDragging.value = true;
  }
  // Handle drag end: if not pressing anymore
  if (!pressed.value && isDragging.value) {
    isDragging.value = false;
  }

  mover.update();
  if (lineRef.value) {
    const positions = [
      originWorld.x,
      originWorld.y,
      0,
      mover.worldPosition.x,
      mover.worldPosition.y,
      0,
    ];
    lineGeometry.setPositions(positions);
    lineGeometry.computeBoundingSphere();
  }
  if (sphereRef.value) {
    sphereRef.value.position.x = mover.worldPosition.x;
    sphereRef.value.position.y = mover.worldPosition.y;
  }
});
</script>
<template>
  <TresMesh :position="[originWorld.x, originWorld.y, 0]">
    <TresSphereGeometry :args="[30, 10]" />
    <TresMeshLambertMaterial :color="'#f7f7f7'" :shininess="100" />
  </TresMesh>
  <TresMesh ref="sphereRef">
    <TresSphereGeometry :args="[150, 48]" />
    <TresMeshLambertMaterial :color="'#f7f7f7'" :shininess="100" />
  </TresMesh>
  <primitive v-if="lineRef" :object="lineRef" />
</template>
