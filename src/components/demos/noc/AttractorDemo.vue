<script setup>
import { useLoop, useTres } from "@tresjs/core";
import { useWindowSize } from "@vueuse/core";
import { Vector2, SphereGeometry, MeshStandardMaterial, Mesh } from "three";
import { reactive } from "vue";
import { Pane } from "tweakpane";

const { width, height } = useWindowSize();
const { scene } = useTres();

const pane = new Pane();

const options = reactive({
  gravitationalForce: 1,
});

class Mover {
  constructor(pos, mass = 1) {
    this.position = new Vector2(pos.x, pos.y);
    this.mass = mass;
    this.velocity = new Vector2(0,0);
    this.acceleration = new Vector2(0, 0);
    this.worldPosition = new Vector2();
    this.radius = Math.sqrt(mass) * 10;
    this.mesh = null;
  }
  createMesh() {
    const geometry = new SphereGeometry(this.radius, 32, 32);
    const material = new MeshStandardMaterial({ color: 0x0077ff });
    const mesh = new Mesh(geometry, material);
    this.mesh = mesh;
    return mesh;
  }
  getMesh() {
    return this.mesh;
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

  // Convert screen space [0..width],[0..height] to centered Three.js world space
  updateWorldPosition() {
    const centeredX = this.position.x - width.value / 2;
    const centeredY = height.value / 2 - this.position.y; // flip Y so +Y is up
    this.worldPosition.set(centeredX, centeredY);
  }
}

class Attractor {
  constructor(pos, mass = 1) {
    this.position = new Vector2(pos.x, pos.y);
    this.mass = mass;
    this.radius = Math.sqrt(mass) * 10;
    this.worldPosition = new Vector2();
    this.mesh = null;
  }
  getMesh() {
    return this.mesh;
  }
  createMesh() {
    const geometry = new SphereGeometry(this.radius, 64, 64);
    const material = new MeshStandardMaterial({ color: 0xf7f7f7, wireframe: true });
    const mesh = new Mesh(geometry, material);
    this.mesh = mesh;
    return mesh;
  }
  updateWorldPosition() {
    const centeredX = this.position.x - width.value / 2;
    const centeredY = height.value / 2 - this.position.y;
    this.worldPosition.set(centeredX, centeredY);
  }
  attract(mover) {
    // const direction

    const force = this.position.clone().sub(mover.position);
    let distanceSq = force.lengthSq();
    // Constrain distanceSq between 100 and 1000 (like p5.js constrain)
    distanceSq = Math.max(100, Math.min(distanceSq, 1000));
    const G = options.gravitationalForce;
    const strength = (G * this.mass * mover.mass) / distanceSq;
    force.normalize().multiplyScalar(strength);
    return force;
  }
}

pane.addBinding(options, "gravitationalForce", { min: -50, max: 50, step: 1 });

// Track all movers (including the initial one)
const movers = [];
const sphere = new Mover({ x: 150, y: 150 }, 10);
const attractor = new Attractor({ x: width.value / 2, y: height.value / 2 }, 150);

scene.value.add(sphere.createMesh());
scene.value.add(attractor.createMesh());
movers.push(sphere);

function createMoverAtWorldPoint(worldX, worldY) {
  // Map world coordinates back to screen-space coordinates used by `Mover`
  const screenX = worldX + width.value / 2;
  const screenY = height.value / 2 - worldY;
  const newMover = new Mover({ x: screenX, y: screenY }, Math.random() * 50);
  scene.value.add(newMover.createMesh());
  movers.push(newMover);
}

const { onBeforeRender } = useLoop();
onBeforeRender(() => {
  attractor.updateWorldPosition();
  for (const m of movers) {
    const force = attractor.attract(m);
    m.applyForce(force);
    m.update();
    m.checkEdges();
    const mesh = m.getMesh();
    if (mesh) {
      mesh.position.x = m.worldPosition.x;
      mesh.position.y = m.worldPosition.y;
    }
  }
});
</script>
<template>
  <!-- Invisible XY plane to capture canvas clicks and provide e.point (world XY) -->
  <TresMesh
    name="click-plane"
    :visible="false"
    @click="(e) => createMoverAtWorldPoint(e.point.x, e.point.y)"
  >
    <TresPlaneGeometry :args="[width, height]" />
    <TresMeshBasicMaterial />
  </TresMesh>
</template>
