// Particle System Simulation
// The Nature of Code
// The Coding Train / Daniel Shiffman
// https://youtu.be/syR0klfncCk
// https://thecodingtrain.com/learning/nature-of-code/4.1-particle-system-simulation.html
// https://editor.p5js.org/codingtrain/sketches/QRzgzQLnQ

<script setup>
import { useLoop } from "@tresjs/core";
import { useWindowSize } from "@vueuse/core";
import { Vector2 } from "three";
import { ref, reactive, onMounted, onUnmounted } from "vue";
import { Pane } from "tweakpane";

const { width, height } = useWindowSize();

const params = reactive({
  quantity: 3,
  speed: 1,
  size: 4,
  gravity: 0.2,
});

let pane;
onMounted(() => {
  pane = new Pane({ title: "Particles" });
  pane.addBinding(params, "quantity", { min: 1, max: 20, step: 1, label: "quantity / frame" });
  pane.addBinding(params, "speed", { min: 0.1, max: 5, step: 0.1, label: "speed" });
  pane.addBinding(params, "size", { min: 1, max: 30, step: 1, label: "size" });
  pane.addBinding(params, "gravity", { min: 0, max: 1, step: 0.01, label: "gravity" });
});
onUnmounted(() => pane?.dispose());

let idCounter = 0;
const gravity = new Vector2(0, 0.2);

class Particle {
  constructor(x, y) {
    this.id = idCounter++;
    this.pos = new Vector2(x, y);
    const angle = Math.random() * Math.PI * 2;
    this.vel = new Vector2(Math.cos(angle), Math.sin(angle));
    this.vel.multiplyScalar((Math.random() * 1.5 + 0.5) * params.speed);
    this.acc = new Vector2(0, 0);
    this.r = params.size;
    this.lifetime = 255;
    this.worldPos = new Vector2();
    this.updateWorldPosition();
  }

  finished() {
    return this.lifetime < 0;
  }

  applyForce(force) {
    this.acc.add(force);
  }

  edges() {
    // Bounce at bottom and sides (no top - particles can escape upward)
    if (this.pos.y >= height.value - this.r) {
      this.pos.y = height.value - this.r;
      this.vel.y *= -1;
    }
    if (this.pos.x >= width.value - this.r) {
      this.pos.x = width.value - this.r;
      this.vel.x *= -1;
    } else if (this.pos.x <= this.r) {
      this.pos.x = this.r;
      this.vel.x *= -1;
    }
  }

  update() {
    this.vel.add(this.acc);
    this.pos.add(this.vel);
    this.acc.set(0, 0);
    this.lifetime -= 5;
    this.edges();
    this.updateWorldPosition();
  }

  updateWorldPosition() {
    // Convert screen-space to Three.js world-space:
    // center at origin, flip Y so +Y is up
    const centeredX = this.pos.x - width.value / 2;
    const centeredY = height.value / 2 - this.pos.y;
    this.worldPos.set(centeredX, centeredY);
  }
}

const particles = ref([]);

const { onBeforeRender } = useLoop();

onBeforeRender(() => {
  gravity.set(0, params.gravity);

  for (let i = 0; i < params.quantity; i++) {
    particles.value.push(new Particle(width.value / 2, 20));
  }

  for (const particle of particles.value) {
    particle.applyForce(gravity);
    particle.update();
  }

  for (let i = particles.value.length - 1; i >= 0; i--) {
    if (particles.value[i].finished()) {
      particles.value.splice(i, 1);
    }
  }
});
</script>

<template>
  <TresMesh
    v-for="particle in particles"
    :key="particle.id"
    :position="[particle.worldPos.x, particle.worldPos.y, 0]"
  >
    <TresSphereGeometry :args="[particle.r, 8, 8]" />
    <TresMeshLambertMaterial
      :color="'#ffffff'"
      :opacity="particle.lifetime / 255"
      :transparent="true"
    />
  </TresMesh>
</template>
