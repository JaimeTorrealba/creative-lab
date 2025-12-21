<script setup>
import { useLoop } from "@tresjs/core";
import { useWindowSize } from "@vueuse/core";
import { Vector2 } from "three";
import { shallowRef, reactive } from "vue";
import { Pane } from "tweakpane";

const { width, height } = useWindowSize();
const sphereRef = shallowRef(null);

const options = reactive({
  gravity: 0.1,
  wind: 0,
  friction: false,
  frictionAmount: 0.1,
  showFluidResistance: false,
  fluidResistance: 0.01,
});


class BasicForces {
  constructor(pos, mass = 1, radius) {
    this.position = new Vector2(pos.x, pos.y);
    this.radius = radius;
    this.mass = mass;
    this.velocity = new Vector2(0, 0);
    this.acceleration = new Vector2(0, 0);
    this.worldPosition = new Vector2();
  }
  applyForce(force) {
    // F = m * a  -->  a = F / m
    const f = force.clone().divideScalar(this.mass);
    this.acceleration.add(f);
  }
  update() {
    this.velocity.add(this.acceleration);
    this.position.add(this.velocity);
    this.updateWorldPosition();
    this.acceleration.set(0, 0);
  }
  checkEdges() {
    if (this.position.y >= height.value - this.radius) {
      this.position.y = height.value - this.radius;
      this.velocity.y *= -1;
    } else if (this.position.y <= this.radius) {
      this.position.y = this.radius;
      this.velocity.y *= -1;
    }
    // Wrap within screen-space bounds [0, width] and [0, height]
    if (this.position.x >= width.value - this.radius) {
      this.position.x = width.value - this.radius;
      this.velocity.x *= -1;
    } else if (this.position.x <= this.radius) {
      this.position.x = this.radius;
      this.velocity.x *= -1;
    }
  }
  contactEdge() {
    return (
      this.position.x <= this.radius ||
      this.position.x >= width.value - this.radius ||
      this.position.y <= this.radius ||
      this.position.y >= height.value - this.radius
    );
  }

  // Convert screen space [0..width],[0..height] to centered Three.js world space
  updateWorldPosition() {
    const centeredX = this.position.x - width.value / 2;
    const centeredY = height.value / 2 - this.position.y; // flip Y so +Y is up
    this.worldPosition.set(centeredX, centeredY);
  }
}

class liquidForce {
  constructor(coefficient, area) {
    this.coefficient = coefficient;
    this.x = area.x;
    this.y = area.y;
    this.width = area.width;
    this.height = area.height;
  }
 contains(mover){
  const pos = mover.position;
  return (pos.x > this.x && pos.x < this.x + this.width && pos.y > this.y && pos.y < this.y + this.height);
 }
 calculateDrag(mover){
  let speed = mover.velocity.length();
  let dragMagnitude = this.coefficient * speed * speed;
  let drag = mover.velocity.clone().normalize().multiplyScalar(-1).multiplyScalar(dragMagnitude);
  return drag;
 }
}

const sphere1 = new BasicForces(new Vector2(width.value / 2, 0), 1, 100);
const liquid = new liquidForce(options.fluidResistance, {x:0, y:height.value/2, width:width.value, height:height.value/2});


// DEBUG
const pane = new Pane();

pane.addBinding(options, "gravity", { min: -1, max: 1, step: 0.01 });
pane.addBinding(options, "wind", { min: -1, max: 1, step: 0.01 });
pane.addBinding(options, "friction", { label: "friction", value: false });
pane.addBinding(options, "frictionAmount", {
  min: 0,
  max: 0.5,
  step: 0.01,
});
pane.addBinding(options, "showFluidResistance", {
  label: "fluid resistance",
  value: false,
});
pane.addBinding(options, "fluidResistance", { min: 0, max: 0.1, step: 0.001 });

// ANIMATION LOOP
const { onBeforeRender } = useLoop();
onBeforeRender(() => {
  sphere1.applyForce(new Vector2(0, options.gravity));
  sphere1.applyForce(new Vector2(options.wind, 0));
  sphere1.update();
  sphere1.checkEdges();
  if (options.friction && sphere1.contactEdge()) {
    let friction = sphere1.velocity.clone().normalize().multiplyScalar(-1);
    sphere1.applyForce(friction.multiplyScalar(options.frictionAmount));
  }
  if(liquid.contains(sphere1) && options.showFluidResistance){
    let drag = liquid.calculateDrag(sphere1);
    sphere1.applyForce(drag);
  }

  if (sphereRef.value) {
    sphereRef.value.position.x = sphere1.worldPosition.x;
    sphereRef.value.position.y = sphere1.worldPosition.y;
  }
});
</script>
<template>
  <TresMesh ref="sphereRef">
    <TresSphereGeometry :args="[100, 48]" />
    <TresMeshLambertMaterial :color="'#f7f7f7'" :shininess="100" />
  </TresMesh>
  <TresMesh ref="boxRef" :position-y="height / -4" :visible="options.showFluidResistance">
    <TresBoxGeometry :args="[width, height / 2]" />
    <TresMeshLambertMaterial :color="'#f7f7f7'" wireframe />
  </TresMesh>

</template>
