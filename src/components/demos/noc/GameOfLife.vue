<script setup>
import { InstancedMesh, PlaneGeometry, MeshBasicMaterial, Matrix4, Color } from 'three'
import { useLoop } from '@tresjs/core'
import { useWindowSize } from '@vueuse/core'
import { onMounted, onUnmounted, shallowRef, reactive } from 'vue'
import { Pane } from 'tweakpane'

const { width, height } = useWindowSize()
const wrapperRef = shallowRef(null)

const options = reactive({
  cellSize: 6,
  stepsPerFrame: 1
})

let board = [],
  prev = [],
  cols = 0,
  rows = 0,
  iMesh = null
const mat4 = new Matrix4()
const color = new Color()

function create2DArray(c, r) {
  return Array.from({ length: c }, () => new Array(r).fill(0))
}

function generate() {
  const next = create2DArray(cols, rows)
  for (let i = 1; i < cols - 1; i++) {
    for (let j = 1; j < rows - 1; j++) {
      let neighborSum = 0
      for (let k = -1; k <= 1; k++) for (let l = -1; l <= 1; l++) neighborSum += board[i + k][j + l]
      neighborSum -= board[i][j]

      if (board[i][j] === 1 && neighborSum < 2) next[i][j] = 0 // loneliness
      else if (board[i][j] === 1 && neighborSum > 3) next[i][j] = 0 // overpopulation
      else if (board[i][j] === 0 && neighborSum === 3) next[i][j] = 1 // birth
      else next[i][j] = board[i][j] // stasis
    }
  }
  prev = board
  board = next
}

function updateColors() {
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      const idx = i * rows + j
      if (prev[i][j] === 0 && board[i][j] === 1) color.set('#3a86ff')
      else if (board[i][j] === 1) color.set('#f8f9fa')
      else if (prev[i][j] === 1 && board[i][j] === 0) color.set('#e63946')
      else color.set('#1f2937')
      iMesh.setColorAt(idx, color)
    }
  }
  iMesh.instanceColor.needsUpdate = true
}

function restart() {
  if (!wrapperRef.value) return

  if (iMesh) {
    iMesh.geometry.dispose()
    iMesh.material.dispose()
    wrapperRef.value.clear()
  }

  cols = Math.floor(width.value / options.cellSize)
  rows = Math.floor(height.value / options.cellSize)

  board = create2DArray(cols, rows)
  prev = create2DArray(cols, rows)
  for (let i = 0; i < cols; i++)
    for (let j = 0; j < rows; j++) board[i][j] = Math.random() > 0.5 ? 1 : 0

  iMesh = new InstancedMesh(
    new PlaneGeometry(options.cellSize - 1, options.cellSize - 1),
    new MeshBasicMaterial(),
    cols * rows
  )

  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      mat4.setPosition(
        i * options.cellSize - width.value / 2 + options.cellSize / 2,
        height.value / 2 - j * options.cellSize - options.cellSize / 2,
        0
      )
      iMesh.setMatrixAt(i * rows + j, mat4)
    }
  }
  iMesh.instanceMatrix.needsUpdate = true

  updateColors()
  wrapperRef.value.add(iMesh)
}

onMounted(() => restart())

const pane = new Pane()
pane.addBinding(options, 'cellSize', { min: 4, max: 20, step: 1, label: 'Cell Size (px)' })
pane.addBinding(options, 'stepsPerFrame', { min: 1, max: 10, step: 1, label: 'Speed' })
pane.addButton({ title: 'Restart' }).on('click', restart)
onUnmounted(() => pane?.dispose())

let frameCount = 0
const { onBeforeRender } = useLoop()
onBeforeRender(() => {
  if (!iMesh) return
  frameCount++
  if (frameCount % options.stepsPerFrame !== 0) return
  generate()
  updateColors()
})
</script>

<template>
  <TresGroup ref="wrapperRef" />
</template>
