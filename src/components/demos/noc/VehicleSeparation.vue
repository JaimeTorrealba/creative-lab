<script setup>
import { useLoop } from '@tresjs/core'
import { useMouse, useWindowSize } from '@vueuse/core'
import { Vector2, InstancedMesh, ConeGeometry, MeshLambertMaterial, Object3D } from 'three'
import { reactive, onUnmounted } from 'vue'
import { Pane } from 'tweakpane'

const { width, height } = useWindowSize()
const { x: mouseX, y: mouseY } = useMouse()

const options = reactive({
  maxspeed: 4,
  maxforce: 0.15,
  separationFactor: 2
})

// ── Vehicle ───────────────────────────────────────────────────────────────────

const r = 10

class Vehicle {
  constructor() {
    this.position = new Vector2(Math.random() * width.value, Math.random() * height.value)
    this.velocity = new Vector2((Math.random() - 0.5) * 4, (Math.random() - 0.5) * 4)
    this.acceleration = new Vector2(0, 0)
    this.r = r
    this.worldPosition = new Vector2()
    this.angle = 0
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

  separate(vehicles) {
    const desiredSeparation = this.r * options.separationFactor
    const sum = new Vector2(0, 0)
    let count = 0
    for (const other of vehicles) {
      const d = this.position.distanceTo(other.position)
      if (other !== this && d < desiredSeparation) {
        const diff = this.position.clone().sub(other.position)
        diff.setLength(1 / d)
        sum.add(diff)
        count++
      }
    }
    if (count > 0) {
      sum.setLength(options.maxspeed)
      const steer = sum.sub(this.velocity)
      if (steer.length() > options.maxforce) steer.setLength(options.maxforce)
      this.applyForce(steer)
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

// ── Scene objects ─────────────────────────────────────────────────────────────

const COUNT = 80
const geometry = new ConeGeometry(r, r * 2.5, 3)
const material = new MeshLambertMaterial({ color: '#9b9b9b' })
const instancedMesh = new InstancedMesh(geometry, material, COUNT)
instancedMesh.instanceMatrix.setUsage(35048) // DynamicDrawUsage

const dummy = new Object3D()
const vehicles = Array.from({ length: COUNT }, () => new Vehicle())

// ── Tweakpane ─────────────────────────────────────────────────────────────────

const pane = new Pane()
pane.addBinding(options, 'maxspeed', { min: 1, max: 10, step: 0.1, label: 'Max Speed' })
pane.addBinding(options, 'maxforce', { min: 0.01, max: 0.5, step: 0.01, label: 'Max Force' })
pane.addBinding(options, 'separationFactor', {
  min: 1,
  max: 5,
  step: 0.1,
  label: 'Separation Radius'
})

onUnmounted(() => pane?.dispose())

// ── Animation loop ────────────────────────────────────────────────────────────

const { onBeforeRender } = useLoop()
onBeforeRender(() => {
  const target = new Vector2(mouseX.value, mouseY.value)
  for (let i = 0; i < vehicles.length; i++) {
    const v = vehicles[i]
    v.seek(target)
    v.separate(vehicles)
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
  <TresAmbientLight :intensity="1.5" />
  <TresDirectionalLight :position="[0, 10, 10]" :intensity="1" />
</template>
