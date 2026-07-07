<script setup>
import { useLoop } from '@tresjs/core'
import { useWindowSize } from '@vueuse/core'
import { Vector2 } from 'three'
import { shallowRef, reactive } from 'vue'
import { Pane } from 'tweakpane'

const { width, height } = useWindowSize()
const sphereRef = shallowRef(null)

class BasicMover {
  constructor() {
    this.radius = 0
    this.position = new Vector2(width.value / 2, height.value / 2)
    this.velocity = new Vector2((Math.random() - 0.5) * 4, (Math.random() - 0.5) * 4)
    this.worldPosition = new Vector2()
  }
  update() {
    this.position.add(this.velocity)
    this.updateWorldPosition()
    this.checkEdges()
  }
  updateWorldPosition() {
    const centeredX = this.position.x - width.value / 2
    const centeredY = height.value / 2 - this.position.y // flip Y so +Y is up
    this.worldPosition.set(centeredX, centeredY)
  }
  checkEdges() {
    // Wrap within screen-space bounds [0, width] and [0, height]
    if (this.position.x > width.value) {
      this.position.x = 0
    } else if (this.position.x < 0) {
      this.position.x = width.value
    }
    if (this.position.y > height.value) {
      this.position.y = 0
    } else if (this.position.y < 0) {
      this.position.y = height.value
    }
  }
}

let mover = new BasicMover()

// const options = reactive({});

// const pane = new Pane();

const { onBeforeRender } = useLoop()

onBeforeRender(() => {
  mover.update()
  if (sphereRef.value) {
    sphereRef.value.position.set(mover.worldPosition.x, mover.worldPosition.y, 0)
  }
})
</script>
<template>
  <TresMesh ref="sphereRef">
    <TresSphereGeometry :args="[150, 48]" />
    <TresMeshLambertMaterial :color="'#f7f7f7'" :shininess="100" />
  </TresMesh>
</template>
