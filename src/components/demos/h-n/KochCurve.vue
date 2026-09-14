<script setup>
import { BufferAttribute, BufferGeometry, MathUtils, Vector3 } from 'three'
import { useLoop } from '@tresjs/core'
import { Pane } from 'tweakpane'
import { reactive, shallowRef, onUnmounted } from 'vue'

const params = reactive({
  iterations: 4,
  speed: 1,
  angle: 60,
  snowflake: false,
  color: '#4dd2ff'
})

const state = { currentGen: 1, t: 0, done: false }
const geometry = shallowRef(null)

const rotate2D = (v, angle) => {
  const cos = Math.cos(angle)
  const sin = Math.sin(angle)
  return new Vector3(v.x * cos - v.y * sin, v.x * sin + v.y * cos, 0)
}

// clockwise traversal so the bumps (rotated by +angle) point outward
const basePoints = () => {
  if (params.snowflake) {
    const radius = 2.2
    const vertexAt = (deg) => {
      const rad = MathUtils.degToRad(deg)
      return new Vector3(radius * Math.cos(rad), radius * Math.sin(rad), 0)
    }
    const top = vertexAt(90)
    return [top, vertexAt(-30), vertexAt(210), top.clone()]
  }
  return [new Vector3(-3, -1, 0), new Vector3(3, -1, 0)]
}

// each segment a→e becomes a,b,c,d,e — b and d sit on the segment,
// the apex c lerps from the segment midpoint up to full height with t
const subdivide = (points, angle, t) => {
  const next = []
  for (let i = 0; i < points.length - 1; i++) {
    const a = points[i]
    const e = points[i + 1]
    const third = e.clone().sub(a).multiplyScalar(1 / 3)
    const b = a.clone().add(third)
    const d = b.clone().add(third)
    const apex = b.clone().add(rotate2D(third, angle))
    const c = a.clone().lerp(e, 0.5).lerp(apex, t)
    next.push(a, b, c, d)
  }
  next.push(points[points.length - 1])
  return next
}

const easeInOutCubic = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2)

const buildPoints = () => {
  const angle = MathUtils.degToRad(params.angle)
  const growT = easeInOutCubic(Math.min(state.t, 1))
  let points = basePoints()
  for (let g = 1; g <= state.currentGen; g++) {
    points = subdivide(points, angle, g === state.currentGen ? growT : 1)
  }
  return points
}

const allocateGeometry = () => {
  geometry.value?.dispose()
  const maxSegments = (params.snowflake ? 3 : 1) * Math.pow(4, params.iterations)
  const geo = new BufferGeometry()
  geo.setAttribute('position', new BufferAttribute(new Float32Array((maxSegments + 1) * 3), 3))
  geometry.value = geo
}

const writePoints = () => {
  const points = buildPoints()
  const position = geometry.value.attributes.position
  points.forEach((point, i) => position.setXYZ(i, point.x, point.y, point.z))
  position.needsUpdate = true
  geometry.value.setDrawRange(0, points.length)
}

const restart = () => {
  state.currentGen = 1
  state.t = 0
  state.done = false
}

const rebuild = () => {
  allocateGeometry()
  restart()
  writePoints()
}

rebuild()

const { onBeforeRender } = useLoop()
onBeforeRender(({ delta }) => {
  if (state.done) return
  state.t += delta * params.speed
  if (state.t >= 1) {
    if (state.currentGen >= params.iterations) {
      state.t = 1
      state.done = true
    } else {
      state.currentGen++
      state.t = 0
    }
  }
  writePoints()
})

const pane = new Pane()
pane.addBinding(params, 'iterations', { min: 1, max: 6, step: 1 }).on('change', rebuild)
pane.addBinding(params, 'speed', { min: 0.1, max: 5 })
pane.addBinding(params, 'angle', { min: 10, max: 89 }).on('change', restart)
pane.addBinding(params, 'snowflake').on('change', rebuild)
pane.addBinding(params, 'color')
pane.addButton({ title: 'Replay' }).on('click', restart)

onUnmounted(() => {
  pane?.dispose()
  geometry.value?.dispose()
})
</script>

<template>
  <TresLine :geometry="geometry">
    <TresLineBasicMaterial :color="params.color" />
  </TresLine>
</template>
