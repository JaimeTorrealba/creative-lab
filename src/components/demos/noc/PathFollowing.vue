<script setup>
import { useLoop } from '@tresjs/core'
import { useWindowSize } from '@vueuse/core'
import {
  Vector2,
  BufferGeometry,
  Float32BufferAttribute,
  Line,
  LineBasicMaterial,
  LineSegments
} from 'three'
import { shallowRef, reactive, onUnmounted } from 'vue'
import { Pane } from 'tweakpane'

const { width, height } = useWindowSize()

const options = reactive({
  maxspeed: 3,
  maxforce: 0.15,
  lookAhead: 50,
  pathRadius: 40,
  showDebug: false
})

// ── Geometry helpers ──────────────────────────────────────────────────────────

// Screen-space → world-space (shared formula across all NOC demos)
function toWorld(sx, sy) {
  return new Vector2(sx - width.value / 2, height.value / 2 - sy)
}

// ── Path ──────────────────────────────────────────────────────────────────────

class Path {
  constructor(points) {
    this.points = points // Vector2[] in screen space
    this.radius = options.pathRadius
  }
}

function generatePath() {
  const m = width.value * 0.06
  const ry = () => height.value * (0.15 + Math.random() * 0.7)
  return new Path([
    new Vector2(m, height.value * 0.5),
    new Vector2(width.value * 0.22, ry()),
    new Vector2(width.value * 0.42, ry()),
    new Vector2(width.value * 0.62, ry()),
    new Vector2(width.value * 0.8, ry()),
    new Vector2(width.value - m, height.value * 0.5)
  ])
}

// ── Vehicle ───────────────────────────────────────────────────────────────────

class Vehicle {
  constructor(startPos) {
    this.position = startPos.clone()
    this.velocity = new Vector2(options.maxspeed, 0)
    this.acceleration = new Vector2(0, 0)
    this.worldPosition = new Vector2()
    this.angle = 0
    // Stored each frame for debug rendering
    this.debugFuture = new Vector2()
    this.debugTarget = new Vector2()
    this.updateWorldPosition()
  }

  applyForce(force) {
    this.acceleration.add(force)
  }

  seek(target) {
    const desired = target.clone().sub(this.position)
    desired.setLength(options.maxspeed)
    const steer = desired.sub(this.velocity)
    if (steer.length() > options.maxforce) steer.setLength(options.maxforce)
    this.applyForce(steer)
  }

  follow(path) {
    const future = this.position.clone().add(this.velocity.clone().setLength(options.lookAhead))
    this.debugFuture.copy(future)

    let target = null
    let worldRecord = Infinity

    for (let i = 0; i < path.points.length - 1; i++) {
      const a = path.points[i]
      const b = path.points[i + 1]
      const ab = b.clone().sub(a)
      const len2 = ab.dot(ab)
      // Clamp t so the projected point always lands on the segment
      const t = Math.max(0, Math.min(1, future.clone().sub(a).dot(ab) / len2))
      const projected = a.clone().add(ab.clone().multiplyScalar(t))
      const d = future.distanceTo(projected)

      if (d < worldRecord) {
        worldRecord = d
        // When clamped to the end of this segment, steer into the next one
        const nextB = path.points[i + 2]
        const dir = t >= 1 && nextB ? nextB.clone().sub(b) : ab
        target = projected.clone().add(dir.clone().setLength(options.lookAhead))
      }
    }

    this.debugTarget.copy(target ?? future)

    if (target && worldRecord > path.radius) {
      this.seek(target)
    }
  }

  update() {
    this.velocity.add(this.acceleration)
    if (this.velocity.length() > options.maxspeed) this.velocity.setLength(options.maxspeed)
    this.position.add(this.velocity)
    this.acceleration.set(0, 0)
    this.angle = Math.atan2(-this.velocity.y, this.velocity.x) - Math.PI / 2
    this.updateWorldPosition()
  }

  checkEdges() {
    if (this.position.x > width.value) this.position.x = 0
    else if (this.position.x < 0) this.position.x = width.value
    if (this.position.y > height.value) this.position.y = 0
    else if (this.position.y < 0) this.position.y = height.value
  }

  updateWorldPosition() {
    this.worldPosition.set(this.position.x - width.value / 2, height.value / 2 - this.position.y)
  }
}

// ── Path line geometry ────────────────────────────────────────────────────────

const pathLineMat = new LineBasicMaterial({ color: '#ffffff', opacity: 0.75, transparent: true })
const pathLineRef = shallowRef(null)

// Radius boundary shown as two parallel offset lines per segment
const radiusMat = new LineBasicMaterial({ color: '#446688', opacity: 0.9, transparent: true })
const radiusLinesRef = shallowRef(null)

function buildPathGeometry(path) {
  // Centerline
  const centerPositions = []
  for (const pt of path.points) {
    const w = toWorld(pt.x, pt.y)
    centerPositions.push(w.x, w.y, 0)
  }
  const centerGeo = new BufferGeometry()
  centerGeo.setAttribute('position', new Float32BufferAttribute(centerPositions, 3))
  if (pathLineRef.value) pathLineRef.value.geometry.dispose()
  pathLineRef.value = new Line(centerGeo, pathLineMat)

  // Radius boundary: for each segment, emit two offset lines
  const r = path.radius
  const radiusPositions = []
  for (let i = 0; i < path.points.length - 1; i++) {
    const a = toWorld(path.points[i].x, path.points[i].y)
    const b = toWorld(path.points[i + 1].x, path.points[i + 1].y)
    const ab = b.clone().sub(a).normalize()
    const perp = new Vector2(-ab.y, ab.x).multiplyScalar(r)

    // Left offset
    radiusPositions.push(a.x + perp.x, a.y + perp.y, 0, b.x + perp.x, b.y + perp.y, 0)
    // Right offset
    radiusPositions.push(a.x - perp.x, a.y - perp.y, 0, b.x - perp.x, b.y - perp.y, 0)
  }
  const radiusGeo = new BufferGeometry()
  radiusGeo.setAttribute('position', new Float32BufferAttribute(radiusPositions, 3))
  if (radiusLinesRef.value) radiusLinesRef.value.geometry.dispose()
  radiusLinesRef.value = new LineSegments(radiusGeo, radiusMat)
}

// ── Scene setup ───────────────────────────────────────────────────────────────

let path = generatePath()
buildPathGeometry(path)
let vehicle = new Vehicle(path.points[0])

// Debug mesh refs (small spheres)
const vehicleRef = shallowRef(null)
const futureRef = shallowRef(null)
const targetRef = shallowRef(null)

// ── Tweakpane ─────────────────────────────────────────────────────────────────

const pane = new Pane()
pane.addBinding(options, 'maxspeed', { min: 1, max: 10, step: 0.1, label: 'Max Speed' })
pane.addBinding(options, 'maxforce', { min: 0.01, max: 0.5, step: 0.01, label: 'Max Force' })
pane.addBinding(options, 'lookAhead', { min: 10, max: 150, step: 5, label: 'Look Ahead' })
pane
  .addBinding(options, 'pathRadius', { min: 10, max: 120, step: 5, label: 'Path Radius' })
  .on('change', ({ value }) => {
    path.radius = value
    buildPathGeometry(path)
  })
pane.addBinding(options, 'showDebug', { label: 'Show Debug' })
pane.addButton({ title: 'New Path' }).on('click', () => {
  path = generatePath()
  buildPathGeometry(path)
  vehicle = new Vehicle(path.points[0])
})

onUnmounted(() => {
  pane?.dispose()
  pathLineMat.dispose()
  radiusMat.dispose()
  if (pathLineRef.value) pathLineRef.value.geometry.dispose()
  if (radiusLinesRef.value) radiusLinesRef.value.geometry.dispose()
})

// ── Animation loop ────────────────────────────────────────────────────────────

const { onBeforeRender } = useLoop()
onBeforeRender(() => {
  vehicle.follow(path)
  vehicle.update()
  vehicle.checkEdges()

  if (vehicleRef.value) {
    vehicleRef.value.position.set(vehicle.worldPosition.x, vehicle.worldPosition.y, 0)
    vehicleRef.value.rotation.z = vehicle.angle
  }

  if (options.showDebug) {
    if (futureRef.value) {
      const fw = toWorld(vehicle.debugFuture.x, vehicle.debugFuture.y)
      futureRef.value.position.set(fw.x, fw.y, 0)
    }
    if (targetRef.value) {
      const tw = toWorld(vehicle.debugTarget.x, vehicle.debugTarget.y)
      targetRef.value.position.set(tw.x, tw.y, 0)
    }
  }
})
</script>

<template>
  <!-- Path -->
  <primitive v-if="radiusLinesRef" :object="radiusLinesRef" />
  <primitive v-if="pathLineRef" :object="pathLineRef" />

  <!-- Vehicle -->
  <TresMesh ref="vehicleRef">
    <TresConeGeometry :args="[8, 20, 3]" />
    <TresMeshLambertMaterial color="#e4e4e4" />
  </TresMesh>

  <!-- Debug: future position (cyan) and target (yellow) -->
  <TresMesh v-if="options.showDebug" ref="futureRef">
    <TresSphereGeometry :args="[6, 12, 12]" />
    <TresMeshBasicMaterial color="#00ccff" />
  </TresMesh>
  <TresMesh v-if="options.showDebug" ref="targetRef">
    <TresSphereGeometry :args="[6, 12, 12]" />
    <TresMeshBasicMaterial color="#ffcc00" />
  </TresMesh>

  <TresAmbientLight :intensity="1.5" />
  <TresDirectionalLight :position="[0, 10, 10]" :intensity="1" />
</template>
