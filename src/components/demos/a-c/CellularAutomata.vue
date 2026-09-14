<script setup>
import { PlaneGeometry, MeshBasicMaterial, Mesh } from 'three'
import { useLoop } from '@tresjs/core'
import { useWindowSize } from '@vueuse/core'
import { onMounted, onUnmounted, shallowRef, reactive, watch } from 'vue'
import { Pane } from 'tweakpane'

const { width, height } = useWindowSize()
const wrapperRef = shallowRef(null)

const options = reactive({
  rule: 90,
  cellSize: 8,
  stepsPerFrame: 1,
  color: '#e0e0ff'
})

let cellGeometry = new PlaneGeometry(options.cellSize, options.cellSize)
const cellMaterial = new MeshBasicMaterial({ color: options.color })

let cells = [],
  generation = 0,
  maxGenerations = 0,
  cols = 0

function computeRuleBit(ruleNumber, l, m, r) {
  return (ruleNumber >> ((l << 2) | (m << 1) | r)) & 1
}

function restart() {
  if (!wrapperRef.value) return
  cellGeometry.dispose()
  cellGeometry = new PlaneGeometry(options.cellSize, options.cellSize)
  cellMaterial.color.set(options.color)
  wrapperRef.value.clear()
  cols = Math.floor(width.value / options.cellSize)
  maxGenerations = Math.floor(height.value / options.cellSize)
  cells = new Array(cols).fill(0)
  cells[Math.floor(cols / 2)] = 1
  generation = 0
}

watch(
  () => options.color,
  (val) => cellMaterial.color.set(val)
)

onMounted(() => restart())

const pane = new Pane()
pane.addBinding(options, 'rule', { min: 0, max: 255, step: 1, label: 'Rule (0–255)' })
pane.addBinding(options, 'cellSize', { min: 4, max: 20, step: 1, label: 'Cell Size (px)' })
pane.addBinding(options, 'stepsPerFrame', { min: 1, max: 10, step: 1, label: 'Speed' })
pane.addBinding(options, 'color', { label: 'Cell Color' })
pane.addButton({ title: 'Restart' }).on('click', restart)

onUnmounted(() => {
  pane?.dispose()
  cellGeometry.dispose()
  cellMaterial.dispose()
})

let frameCount = 0
const { onBeforeRender } = useLoop()
onBeforeRender(() => {
  if (!wrapperRef.value || generation >= maxGenerations) return
  frameCount++
  if (frameCount % options.stepsPerFrame !== 0) return

  for (let i = 1; i < cols - 1; i++) {
    if (cells[i] === 1) {
      const mesh = new Mesh(cellGeometry, cellMaterial)
      mesh.position.x = i * options.cellSize - width.value / 2 + options.cellSize / 2
      mesh.position.y = height.value / 2 - generation * options.cellSize - options.cellSize / 2
      wrapperRef.value.add(mesh)
    }
  }

  const next = new Array(cols).fill(0)
  for (let i = 1; i < cols - 1; i++) {
    next[i] = computeRuleBit(options.rule, cells[i - 1], cells[i], cells[i + 1])
  }
  cells = next
  generation++
})
</script>

<template>
  <TresGroup ref="wrapperRef" />
</template>
