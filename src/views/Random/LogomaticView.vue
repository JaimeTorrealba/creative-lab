<script setup lang="ts">
import { ref, onMounted } from "vue";
import { Pane } from "tweakpane";

const canvas = ref<HTMLCanvasElement | null>(null);
let ctx: CanvasRenderingContext2D | null = null;

const foreColor = [24];
const backColor = [230];
const limit = 36;

interface Connection extends Array<number> {}

let logos: Connection[][] = [];

// ------------------------------------------------------------
// Utility
// ------------------------------------------------------------

function combinations(arr: number[]) {
  const result: Connection[] = [];
  for (let i = 0; i < arr.length; i++) {
    for (let j = i + 1; j < arr.length; j++) {
      result.push([arr[i], arr[j]]);
    }
  }
  return result;
}

function subsets<T>(arr: T[]) {
  const result: T[][] = [[]];
  for (const el of arr) {
    const newSubs = result.map(s => [...s, el]);
    result.push(...newSubs);
  }
  return result;
}

function shuffle<T>(array: T[]) {
  const a = [...array];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function connectionSubsets(connections: number, number: number) {
  // Guard: if we're asking for more subsets than possible, return empty
  if (number > connections || number < 0 || connections < 0) {
    return [];
  }
  return subsets(shuffle(combinations([...Array(connections).keys()])))
    .filter(s => s.length === number);
}

// ------------------------------------------------------------
// Logo generation
// ------------------------------------------------------------

const connections = ref(6);
const leftConnections = ref(2);
const rightConnections = ref(2);
const invert = ref(false);
const leftTriangles = ref(false);
const rightTriangles = ref(false);
const rotation = ref(0);
const lineWidth = ref(1);

function generateLogos() {
  const leftList = connectionSubsets(connections.value, leftConnections.value);
  const rightList = connectionSubsets(connections.value, rightConnections.value);

  // Guard: if either list is empty, use default empty connections
  if (leftList.length === 0 || rightList.length === 0) {
    logos = Array(limit).fill([[], []]);
    return;
  }

  logos = [];

  for (let i = 0; i < limit; i++) {
    logos.push([
      leftList[i % leftList.length],
      rightList[i % rightList.length]
    ]);
  }
}

// ------------------------------------------------------------
// Drawing helpers (pure Canvas API)
// ------------------------------------------------------------

function pointAngleDistance(x: number, y: number, angle: number, dist: number) {
  return [x + Math.cos(angle) * dist, y - Math.sin(angle) * dist] as const;
}

function drawTriangle(center: number, size: number, leftSide: boolean) {
  if (!ctx) return;

  ctx.beginPath();
  ctx.moveTo(0, center - size * 0.5);

  let ang1 = leftSide ? (220 * Math.PI) / 180 : (-40 * Math.PI) / 180;
  let [x1, y1] = pointAngleDistance(0, center - size * 0.5, ang1, size * 0.77);
  ctx.lineTo(x1, y1);

  let ang2 = leftSide ? (140 * Math.PI) / 180 : (40 * Math.PI) / 180;
  let [x2, y2] = pointAngleDistance(0, center + size * 0.5, ang2, size * 0.77);
  ctx.lineTo(x2, y2);

  ctx.lineTo(0, center + size * 0.5);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(0, center - size * 0.5);
  ctx.lineTo(0, center + size * 0.5);
  ctx.stroke();
}

function drawSide(conns: Connection[], ys: number[], leftSide: boolean, triangles: boolean) {
  if (!ctx) return;

  for (let [a, b] of conns) {
    let size = ys[b] - ys[a];
    let center = ys[a] + size * 0.5;

    if (triangles) {
      drawTriangle(center, size, leftSide);
    } else {
      ctx.beginPath();
      ctx.arc(
        0,
        center,
        size / 2,
        leftSide ? Math.PI / 2 : -Math.PI / 2,
        leftSide ? (Math.PI * 3) / 2 : Math.PI / 2
      );
      ctx.stroke();
    }
  }
}

// ------------------------------------------------------------
// Main draw
// ------------------------------------------------------------

function draw() {
  if (!ctx || !canvas.value) return;

  ctx.fillStyle = `rgb(${backColor[0]}, ${backColor[0]}, ${backColor[0]})`;
  ctx.fillRect(0, 0, canvas.value.width, canvas.value.height);

  ctx.lineWidth = lineWidth.value;

  let idx = 0;

  for (let i = 0; i < 6; i++) {
    for (let j = 0; j < 6; j++) {
      if (logos.length === 0) continue;
      
      const logo = logos[idx % logos.length];
      idx++;

      // Guard: if logo connections are empty, skip drawing
      if (!logo[0] || !logo[1] || logo[0].length === 0 || logo[1].length === 0) {
        continue;
      }

      let maxY = 1 + Math.max(...logo[0].flat(), ...logo[1].flat());
      let rawYs = [...Array(maxY).keys()];
      let ys = rawYs.map(v =>
        ((v - rawYs[0]) / (rawYs[rawYs.length - 1] - rawYs[0])) * 100 - 50
      );

      ctx.save();
      ctx.translate(75 + i * 125, 75 + j * 125);
      ctx.rotate((rotation.value * Math.PI) / 180);

      // Fill pass
      ctx.fillStyle = invert.value
        ? `rgb(${foreColor[0]},${foreColor[0]},${foreColor[0]})`
        : `rgb(${backColor[0]},${backColor[0]},${backColor[0]})`;
      ctx.strokeStyle = ctx.fillStyle;
      drawSide(logo[0], ys, true, leftTriangles.value);
      drawSide(logo[1], ys, false, rightTriangles.value);

      // Stroke pass
      ctx.strokeStyle = invert.value
        ? `rgb(${backColor[0]},${backColor[0]},${backColor[0]})`
        : `rgb(${foreColor[0]},${foreColor[0]},${foreColor[0]})`;
      ctx.fillStyle = "transparent";
      drawSide(logo[0], ys, true, leftTriangles.value);
      drawSide(logo[1], ys, false, rightTriangles.value);

      ctx.restore();
    }
  }
}

function loop() {
  draw();
  requestAnimationFrame(loop);
}

// ------------------------------------------------------------
// Lifecycle
// ------------------------------------------------------------

onMounted(() => {
  if (canvas.value) {
    ctx = canvas.value.getContext("2d");
    generateLogos();
    loop();

    // Initialize Tweakpane
    const pane = new Pane();

    pane.addBinding(connections, "value", {
      min: 1,
      max: 6,
      step: 1,
      label: "Connections"
    }).on("change", () => {
      // Clamp left/right connections to not exceed connections value
      if (leftConnections.value > connections.value) {
        leftConnections.value = connections.value;
      }
      if (rightConnections.value > connections.value) {
        rightConnections.value = connections.value;
      }
      generateLogos();
    });

    pane.addBinding(leftConnections, "value", {
      min: 1,
      max: connections.value,
      step: 1,
      label: "Left Connections"
    }).on("change", () => generateLogos());

    pane.addBinding(rightConnections, "value", {
      min: 1,
      max: connections.value,
      step: 1,
      label: "Right Connections"
    }).on("change", () => generateLogos());

    pane.addBinding(invert, "value", { label: "Invert" });
    pane.addBinding(leftTriangles, "value", { label: "Left Triangles" });
    pane.addBinding(rightTriangles, "value", { label: "Right Triangles" });
    pane.addBinding(rotation, "value", {
      min: 0,
      max: 360,
      step: 1,
      label: "Rotation"
    });
    pane.addBinding(lineWidth, "value", {
      min: 0.1,
      max: 5,
      step: 0.1,
      label: "Line Width"
    });
  }
});
</script>

<template>
  <div class="logomatic">
    <canvas ref="canvas" width="800" height="800"></canvas>
  </div>
</template>

<style scoped>
.logomatic {
  display: grid;
  place-items: center;
  height: 100vh;
  gap: 1rem;
}
canvas {
  border: 1px solid #ccc;
}
</style>
