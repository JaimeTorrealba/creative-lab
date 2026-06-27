<script setup>
import { useLoop } from '@tresjs/core'
import { useMouse, useWindowSize } from '@vueuse/core'
import { Vector2 } from 'three'
import { shallowRef, reactive, onUnmounted } from 'vue'
import { Pane } from 'tweakpane'

const { width, height } = useWindowSize()
const { x: mouseX, y: mouseY } = useMouse()
const meshRef = shallowRef(null)

const options = reactive({ maxspeed: 4, maxforce: 0.15 })

class Vehicle {
  constructor() {
    this.position = new Vector2(width.value / 2, height.value / 2)
    this.velocity = new Vector2(2, 0)
    this.acceleration = new Vector2(0, 0)
    this.r = 25
    this.worldPosition = new Vector2()
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

  update() {
    this.velocity.add(this.acceleration)
    if (this.velocity.length() > options.maxspeed) this.velocity.setLength(options.maxspeed)
    this.position.add(this.velocity)
    this.acceleration.set(0, 0)
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

const vehicle = new Vehicle()

const pane = new Pane()
pane.addBinding(options, 'maxspeed', { min: 1, max: 10, step: 0.1, label: 'Max Speed' })
pane.addBinding(options, 'maxforce', { min: 0.01, max: 0.5, step: 0.01, label: 'Max Force' })

onUnmounted(() => pane?.dispose())

const { onBeforeRender } = useLoop()
onBeforeRender(() => {
  vehicle.seek(new Vector2(mouseX.value, mouseY.value))
  vehicle.update()
  vehicle.checkEdges()

  if (meshRef.value) {
    meshRef.value.position.set(vehicle.worldPosition.x, vehicle.worldPosition.y, 0)
    meshRef.value.rotation.z = Math.atan2(-vehicle.velocity.y, vehicle.velocity.x) - Math.PI / 2
  }
})
</script>

<template>
  <TresMesh ref="meshRef">
    <TresConeGeometry :args="[vehicle.r, vehicle.r * 2.5, 3]" />
    <TresMeshLambertMaterial color="#7f7f7f" />
  </TresMesh>
  <TresAmbientLight :intensity="1.5" />
  <TresDirectionalLight :position="[0, 10, 10]" :intensity="1" />
</template>
