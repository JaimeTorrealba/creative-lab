<script setup>
import { useLoop } from "@tresjs/core";
import { useMouse, useWindowSize } from "@vueuse/core";
import { Vector2 } from "three";
import { shallowRef } from "vue";

const { width, height } = useWindowSize();
const { x, y } = useMouse();
const sphereRef = shallowRef(null);

class BasicMover {
  constructor() {
    this.position = new Vector2(
      Math.random() * width.value,
      Math.random() * height.value
    );
    this.velocity = new Vector2((Math.random() - 0.5) * 4, (Math.random() - 0.5) * 4);
    this.worldPosition = new Vector2();
    this.angle = 0;
  }
  update() {
    this.position.add(this.velocity);
    this.updateWorldPosition();
  }
  checkEdges() {
    // Wrap within screen-space bounds [0, width] and [0, height]
    if (this.position.x > width.value) {
      this.position.x = 0;
    } else if (this.position.x < 0) {
      this.position.x = width.value;
    }
    if (this.position.y > height.value) {
      this.position.y = 0;
    } else if (this.position.y < 0) {
      this.position.y = height.value;
    }
  }

  // Convert screen space [0..width],[0..height] to centered Three.js world space
  updateWorldPosition() {
    const centeredX = this.position.x - width.value / 2;
    const centeredY = height.value / 2 - this.position.y; // flip Y so +Y is up
    this.worldPosition.set(centeredX, centeredY);
  }
}
class MouseDirectionMover extends BasicMover {
  constructor() {
    super();
    this.mousePos = new Vector2(x.value, y.value);
  }
  update() {
    this.mousePos.set(x.value, y.value);
    const dirScreen = this.mousePos.clone().sub(this.position);
    const desired = dirScreen.clone().normalize().multiplyScalar(5);
    this.velocity.lerp(desired, 0.08);
    this.velocity.clampLength(0, 5);
    this.position.add(this.velocity);
    this.updateWorldPosition();

    const mouseWorld = new Vector2(
      x.value - width.value / 2,
      height.value / 2 - y.value
    );
    const toMouseWorld = mouseWorld.sub(this.worldPosition);
    this.angle = Math.atan2(toMouseWorld.y, toMouseWorld.x);
  }
}

const { onBeforeRender } = useLoop();

let mover = new MouseDirectionMover();

onBeforeRender(() => {
  mover.update();
  mover.checkEdges();
  if (sphereRef.value) {
    sphereRef.value.rotation.z = mover.angle;
    sphereRef.value.position.x = mover.worldPosition.x;
    sphereRef.value.position.y = mover.worldPosition.y;
  }
});
</script>
<template>
  <TresMesh ref="sphereRef">
    <TresBoxGeometry :args="[120, 40, 40]" />
    <TresMeshPhongMaterial :color="'#f7f7f7'" :shininess="100" />
  </TresMesh>
</template>
