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
import { ref, shallowRef, reactive, onMounted, onUnmounted } from "vue";
import { Pane } from "tweakpane";

const { width, height } = useWindowSize();

const params = reactive({
  quantity: 3,
  speed: 1,
  size: 4,
  gravity: 0.2,
});

const repellerOpts = reactive({
  visible: true,
  power: 150,
  size: 16,
  posX: 0,
  posY: 0,
});

let pane;
onMounted(() => {
  pane = new Pane({ title: "Particles" });
  pane.addBinding(params, "quantity", { min: 1, max: 20, step: 1, label: "quantity / frame" });
  pane.addBinding(params, "speed", { min: 0.1, max: 5, step: 0.1, label: "speed" });
  pane.addBinding(params, "size", { min: 1, max: 30, step: 1, label: "size" });
  pane.addBinding(params, "gravity", { min: 0, max: 1, step: 0.01, label: "gravity" });

  const rf = pane.addFolder({ title: "Repeller" });
  rf.addBinding(repellerOpts, "visible", { label: "Visible" });
  rf.addBinding(repellerOpts, "power", { min: 0, max: 500, step: 1, label: "Power" });
  rf.addBinding(repellerOpts, "size", { min: 14, max: 60, step: 1, label: "Size" });
  rf.addBinding(repellerOpts, "posX", { min: -960, max: 960, step: 1, label: "X" }).on("change", ({ value }) => {
    repeller.position.x = width.value / 2 + value;
    repeller.updateWorldPosition();
  });
  rf.addBinding(repellerOpts, "posY", { min: -540, max: 540, step: 1, label: "Y" }).on("change", ({ value }) => {
    repeller.position.y = height.value / 2 - value;
    repeller.updateWorldPosition();
  });
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

class Repeller {
  constructor(x, y) {
    this.position = new Vector2(x, y)
    this.worldPosition = new Vector2()
    this.updateWorldPosition()
  }

  repel(particle) {
    const dir = this.position.clone().sub(particle.pos)
    let distance = dir.length()
    distance = Math.max(5, Math.min(repellerOpts.size * 3, distance))
    const strength = repellerOpts.power / (distance * distance)
    return dir.normalize().multiplyScalar(-strength)
  }

  collide(particle) {
    const dx = particle.pos.x - this.position.x
    const dy = particle.pos.y - this.position.y
    const dist = Math.sqrt(dx * dx + dy * dy)
    const minDist = repellerOpts.size + particle.r
    if (dist < minDist && dist > 0) {
      const nx = dx / dist
      const ny = dy / dist
      particle.pos.x = this.position.x + nx * minDist
      particle.pos.y = this.position.y + ny * minDist
      const dot = particle.vel.x * nx + particle.vel.y * ny
      if (dot < 0) {
        particle.vel.x -= 2 * dot * nx
        particle.vel.y -= 2 * dot * ny
      }
      particle.updateWorldPosition()
    }
  }

  updateWorldPosition() {
    this.worldPosition.set(
      this.position.x - width.value / 2,
      height.value / 2 - this.position.y
    )
  }
}

const repellerRef = shallowRef(null)
const repeller = new Repeller(width.value / 2, height.value / 2)

const particles = ref([]);

const { onBeforeRender } = useLoop();

onBeforeRender(() => {
  gravity.set(0, params.gravity);

  for (let i = 0; i < params.quantity; i++) {
    particles.value.push(new Particle(width.value / 2, 20));
  }

  for (const particle of particles.value) {
    particle.applyForce(gravity);
    if (repellerOpts.visible) particle.applyForce(repeller.repel(particle));
    particle.update();
    if (repellerOpts.visible) repeller.collide(particle);
  }

  for (let i = particles.value.length - 1; i >= 0; i--) {
    if (particles.value[i].finished()) {
      particles.value.splice(i, 1);
    }
  }

  if (repellerRef.value) {
    repellerRef.value.position.set(repeller.worldPosition.x, repeller.worldPosition.y, 0);
  }
});
</script>

<template>
  <TresMesh v-if="repellerOpts.visible" ref="repellerRef">
    <TresSphereGeometry :args="[repellerOpts.size, 16, 16]" />
    <TresMeshLambertMaterial color="#808080" />
  </TresMesh>

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
