<script setup>
import { useLoop } from '@tresjs/core'
import { useWindowSize } from '@vueuse/core'
import {
  Vector2,
  InstancedMesh, ConeGeometry, MeshLambertMaterial, Object3D,
  BufferGeometry, Float32BufferAttribute, LineSegments, LineBasicMaterial,
} from 'three'
import { createNoise2D } from 'simplex-noise'
import { shallowRef, reactive, onUnmounted } from 'vue'
import { Pane } from 'tweakpane'

const { width, height } = useWindowSize()

const options = reactive({
  count: 150,
  resolution: 40,
  maxspeed: 3,
  maxforce: 0.1,
  showField: false,
})

// ── FlowField ─────────────────────────────────────────────────────────────────

class FlowField {
  constructor(resolution) {
    this.resolution = resolution
    this.cols = Math.floor(width.value / resolution)
    this.rows = Math.floor(height.value / resolution)
    this.field = []
    this.init()
  }

  init() {
    const noise2D = createNoise2D()
    this.field = []
    let xoff = 0
    for (let i = 0; i < this.cols; i++) {
      this.field[i] = []
      let yoff = 0
      for (let j = 0; j < this.rows; j++) {
        const angle = ((noise2D(xoff, yoff) + 1) / 2) * Math.PI * 2
        this.field[i][j] = new Vector2(Math.cos(angle), Math.sin(angle))
        yoff += 0.1
      }
      xoff += 0.1
    }
  }

  lookup(position) {
    const col = Math.max(0, Math.min(Math.floor(position.x / this.resolution), this.cols - 1))
    const row = Math.max(0, Math.min(Math.floor(position.y / this.resolution), this.rows - 1))
    return this.field[col][row].clone()
  }
}

// ── Vehicle ───────────────────────────────────────────────────────────────────

class Vehicle {
  constructor() {
    this.position = new Vector2(Math.random() * width.value, Math.random() * height.value)
    this.velocity = new Vector2((Math.random() - 0.5) * 2, (Math.random() - 0.5) * 2)
    this.acceleration = new Vector2(0, 0)
    this.worldPosition = new Vector2()
    this.angle = 0
    this.updateWorldPosition()
  }

  applyForce(force) {
    this.acceleration.add(force)
  }

  follow(field) {
    const desired = field.lookup(this.position)
    desired.setLength(options.maxspeed)
    const steer = desired.sub(this.velocity)
    if (steer.length() > options.maxforce) steer.setLength(options.maxforce)
    this.applyForce(steer)
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
    this.worldPosition.set(
      this.position.x - width.value / 2,
      height.value / 2 - this.position.y
    )
  }
}

// ── Field arrow visualization ─────────────────────────────────────────────────

const fieldLinesRef = shallowRef(null)
const lineMaterial = new LineBasicMaterial({ color: '#ffffff', opacity: 0.25, transparent: true })

function buildFieldLines(field) {
  const positions = []
  const res = field.resolution
  const arrowLen = res * 0.38
  const headLen = arrowLen * 0.35

  for (let i = 0; i < field.cols; i++) {
    for (let j = 0; j < field.rows; j++) {
      // Cell center: screen → world (flip Y)
      const wx = (i + 0.5) * res - width.value / 2
      const wy = height.value / 2 - (j + 0.5) * res

      // Direction in world space (flip Y from screen-space field vector)
      const dir = field.field[i][j]
      const dx = dir.x * arrowLen
      const dy = -dir.y * arrowLen

      const ex = wx + dx
      const ey = wy + dy

      // Shaft
      positions.push(wx, wy, 0, ex, ey, 0)

      // Arrowhead: two lines branching back from the tip
      const a = Math.atan2(dy, dx)
      const a1 = a + Math.PI * 0.75
      const a2 = a - Math.PI * 0.75
      positions.push(ex, ey, 0, ex + Math.cos(a1) * headLen, ey + Math.sin(a1) * headLen, 0)
      positions.push(ex, ey, 0, ex + Math.cos(a2) * headLen, ey + Math.sin(a2) * headLen, 0)
    }
  }

  const geo = new BufferGeometry()
  geo.setAttribute('position', new Float32BufferAttribute(positions, 3))

  if (fieldLinesRef.value) fieldLinesRef.value.geometry.dispose()
  const lines = new LineSegments(geo, lineMaterial)
  lines.visible = options.showField
  fieldLinesRef.value = lines
}

// ── Scene objects ─────────────────────────────────────────────────────────────

const r = 8
const COUNT = options.count
const geometry = new ConeGeometry(r, r * 2.5, 3)
const material = new MeshLambertMaterial({ color: '#9b9b9b' })
const instancedMesh = new InstancedMesh(geometry, material, COUNT)
instancedMesh.instanceMatrix.setUsage(35048) // DynamicDrawUsage

const dummy = new Object3D()

let flowField = new FlowField(options.resolution)
buildFieldLines(flowField)

let vehicles = Array.from({ length: COUNT }, () => new Vehicle())

// ── Tweakpane ─────────────────────────────────────────────────────────────────

const pane = new Pane()
pane.addBinding(options, 'maxspeed', { min: 1, max: 10, step: 0.1, label: 'Max Speed' })
pane.addBinding(options, 'maxforce', { min: 0.01, max: 0.5, step: 0.01, label: 'Max Force' })
pane.addBinding(options, 'resolution', { min: 20, max: 120, step: 10, label: 'Resolution' })
pane.addBinding(options, 'showField', { label: 'Show Field' }).on('change', ({ value }) => {
  if (fieldLinesRef.value) fieldLinesRef.value.visible = value
})
pane.addButton({ title: 'Regenerate Field' }).on('click', () => {
  flowField = new FlowField(options.resolution)
  buildFieldLines(flowField)
})

onUnmounted(() => {
  pane?.dispose()
  lineMaterial.dispose()
  if (fieldLinesRef.value) fieldLinesRef.value.geometry.dispose()
})

// ── Animation loop ────────────────────────────────────────────────────────────

const { onBeforeRender } = useLoop()
onBeforeRender(() => {
  for (let i = 0; i < vehicles.length; i++) {
    const v = vehicles[i]
    v.follow(flowField)
    v.update()
    v.checkEdges()

    dummy.position.set(v.worldPosition.x, v.worldPosition.y, 0)
    dummy.rotation.z = v.angle
    dummy.updateMatrix()
    instancedMesh.setMatrixAt(i, dummy.matrix)
  }
  instancedMesh.instanceMatrix.needsUpdate = true
})
</script>

<template>
  <primitive :object="instancedMesh" />
  <primitive v-if="fieldLinesRef" :object="fieldLinesRef" />
  <TresAmbientLight :intensity="1.5" />
  <TresDirectionalLight :position="[0, 10, 10]" :intensity="1" />
</template>
