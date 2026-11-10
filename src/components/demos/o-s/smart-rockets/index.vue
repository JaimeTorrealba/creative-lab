<script setup>
import { useLoop } from '@tresjs/core'
import { useEventListener } from '@vueuse/core'
import { Vector2 } from 'three'
import { onUnmounted, shallowRef } from 'vue'
import { Pane } from 'tweakpane'
import {
  createPopulation,
  livePopulation,
  evolvePopulation,
  countRocketsOnTarget
} from './Population'
import { TARGET_RADIUS } from './Rocket'
import { createRocketMesh, syncRocketMesh, disposeRocketMesh } from './RocketMesh'

const FIELD = { width: 640, height: 360 }
const MAX_POPULATION = 200
const DRAG_THRESHOLD = 5

const params = {
  populationSize: 50,
  mutationRate: 0.01,
  lifeSpan: 500,
  maxForce: 0.1,
  stepsPerFrame: 1
}
const stats = { generation: 0, cyclesLeft: params.lifeSpan, onTarget: 0 }

const startPosition = new Vector2(0, -FIELD.height / 2 + 20)
const target = new Vector2(0, FIELD.height / 2 - 24)
const targetPosition = shallowRef([target.x, target.y, -0.5])

const rocketMesh = createRocketMesh(MAX_POPULATION)
let population
let lifeCounter = 0

const restartPopulation = () => {
  population = createPopulation({ ...params, startPosition })
  lifeCounter = 0
}
restartPopulation()

const stepSimulation = () => {
  if (lifeCounter < params.lifeSpan) {
    livePopulation(population, target)
    lifeCounter++
    return
  }
  lifeCounter = 0
  evolvePopulation(population, target, params.mutationRate)
}

const updateStats = () => {
  stats.generation = population.generations
  stats.cyclesLeft = params.lifeSpan - lifeCounter
  stats.onTarget = countRocketsOnTarget(population)
}

const { onBeforeRender } = useLoop()
onBeforeRender(() => {
  for (let step = 0; step < params.stepsPerFrame; step++) stepSimulation()
  syncRocketMesh(rocketMesh, population.rockets)
  updateStats()
})

// Orbit drags also end in a click; capture-phase tracking lets us ignore those
const pointerDownAt = new Vector2()
const pointerLastAt = new Vector2()
useEventListener(window, 'pointerdown', (event) => {
  pointerDownAt.set(event.clientX, event.clientY)
  pointerLastAt.copy(pointerDownAt)
}, { capture: true })
useEventListener(window, 'pointermove', (event) => {
  pointerLastAt.set(event.clientX, event.clientY)
}, { capture: true })

const moveTargetToClick = (event) => {
  if (pointerDownAt.distanceTo(pointerLastAt) > DRAG_THRESHOLD) return
  target.set(event.point.x, event.point.y)
  targetPosition.value = [target.x, target.y, -0.5]
}

const pane = new Pane({ title: 'Smart Rockets' })

const addEvolutionBindings = () => {
  const restartOptions = [
    ['populationSize', { min: 2, max: MAX_POPULATION, step: 1, label: 'population' }],
    ['lifeSpan', { min: 100, max: 1000, step: 10, label: 'life span' }],
    ['maxForce', { min: 0.01, max: 0.5, step: 0.01, label: 'max force' }]
  ]
  restartOptions.forEach(([key, options]) => {
    pane.addBinding(params, key, options).on('change', restartPopulation)
  })
  pane.addBinding(params, 'mutationRate', { min: 0, max: 0.1, step: 0.001, label: 'mutation' })
  pane.addBinding(params, 'stepsPerFrame', { min: 1, max: 20, step: 1, label: 'speed' })
  pane.addButton({ title: 'Restart' }).on('click', restartPopulation)
}

const addStatsMonitors = () => {
  const folder = pane.addFolder({ title: 'Stats' })
  const monitorOptions = { readonly: true, format: (value) => value.toFixed(0) }
  folder.addBinding(stats, 'generation', monitorOptions)
  folder.addBinding(stats, 'cyclesLeft', { ...monitorOptions, label: 'cycles left' })
  folder.addBinding(stats, 'onTarget', { ...monitorOptions, label: 'on target' })
}

addEvolutionBindings()
addStatsMonitors()

onUnmounted(() => {
  pane.dispose()
  disposeRocketMesh(rocketMesh)
})
</script>

<template>
  <TresMesh :position="[0, 0, -1]" @click="moveTargetToClick">
    <TresPlaneGeometry :args="[FIELD.width, FIELD.height]" />
    <TresMeshBasicMaterial color="#1c1c1c" />
  </TresMesh>
  <TresMesh :position="targetPosition">
    <TresCircleGeometry :args="[TARGET_RADIUS, 32]" />
    <TresMeshBasicMaterial color="#ff4d6d" />
  </TresMesh>
  <primitive :object="rocketMesh" />
</template>
