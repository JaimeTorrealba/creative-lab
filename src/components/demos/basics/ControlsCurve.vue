<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { TransformControls, OrbitControls } from '@tresjs/cientos'
import { useLoop } from '@tresjs/core'
import {
  QuadraticBezierCurve3,
  CubicBezierCurve3,
  CatmullRomCurve3,
  Vector3,
  BufferGeometry,
  Line,
  LineBasicMaterial
} from 'three'
import { Pane } from 'tweakpane'

// ── Control points — stored as { id, pos } for stable v-for keys ──────────────
let _uid = 0
function mkPt(x, y, z) {
  return { id: _uid++, pos: [x, y, z] }
}

const controlPts = ref([mkPt(-3, 0, 0), mkPt(0, 3, 0), mkPt(3, 0, 0)])

// Parallel array of mesh refs indexed by controlPts order
const meshRefs = ref([])

const COLORS = ['#ff4444', '#44ff88', '#4488ff']
const DEFAULT_COLOR = '#ffaa00'
function getColor(i) {
  return COLORS[i] ?? DEFAULT_COLOR
}

// ── Curve ─────────────────────────────────────────────────────────────────────
const orbitEnabled = ref(true)
const params = { curveType: 'bezier', orbit: true }

function buildCurrentCurve() {
  const v = controlPts.value.map(({ pos }) => new Vector3(...pos))
  if (params.curveType === 'bezier') {
    if (v.length === 3) return new QuadraticBezierCurve3(v[0], v[1], v[2])
    if (v.length === 4) return new CubicBezierCurve3(v[0], v[1], v[2], v[3])
  }
  return new CatmullRomCurve3(v)
}

const lineGeo = new BufferGeometry().setFromPoints(buildCurrentCurve().getPoints(64))
const lineMat = new LineBasicMaterial({ color: 0x00e5ff })
const lineObj = new Line(lineGeo, lineMat)

function rebuildCurve() {
  lineObj.geometry.setFromPoints(buildCurrentCurve().getPoints(64))
}

// ── Sync mesh positions → pts every frame ─────────────────────────────────────
const { onBeforeRender } = useLoop()
onBeforeRender(() => {
  let dirty = false
  meshRefs.value.forEach((mesh, i) => {
    if (!mesh || !controlPts.value[i]) return
    const { x, y, z } = mesh.position
    const p = controlPts.value[i].pos
    if (x !== p[0] || y !== p[1] || z !== p[2]) {
      controlPts.value[i].pos = [x, y, z]
      dirty = true
    }
  })
  if (dirty) rebuildCurve()
})

// ── Add / remove points ───────────────────────────────────────────────────────
function addPoint() {
  const t = 0.3 + Math.random() * 0.4
  const pos = buildCurrentCurve().getPoint(t)
  const insertAt = Math.max(1, Math.round(t * (controlPts.value.length - 1)))
  controlPts.value.splice(insertAt, 0, mkPt(pos.x, pos.y, pos.z))
  meshRefs.value.splice(insertAt, 0, null)
  rebuildCurve()
  syncPaneState()
}

function removePoint() {
  if (controlPts.value.length <= 3) return
  const idx = controlPts.value.reduce((best, pt, i, arr) => (pt.id > arr[best].id ? i : best), 0)
  controlPts.value.splice(idx, 1)
  meshRefs.value.splice(idx, 1)
  rebuildCurve()
  syncPaneState()
}

// ── Tweakpane ─────────────────────────────────────────────────────────────────
let pane, curveTypeBinding, removeBtn

function syncPaneState() {
  if (!curveTypeBinding) return
  const tooMany = controlPts.value.length > 4
  curveTypeBinding.disabled = tooMany
  curveTypeBinding.label = tooMany ? 'type (bezier needs ≤4 pts)' : 'type'

  if (removeBtn) removeBtn.disabled = controlPts.value.length <= 3
}

onMounted(() => {
  pane = new Pane({ title: 'Curve' })

  curveTypeBinding = pane.addBinding(params, 'curveType', {
    label: 'type',
    options: { Bezier: 'bezier', CatmullRom: 'catmullrom' }
  })
  curveTypeBinding.on('change', rebuildCurve)

  pane.addBinding(params, 'orbit', { label: 'orbit controls' }).on('change', ({ value }) => {
    orbitEnabled.value = value
  })

  pane.addButton({ title: 'Add Point' }).on('click', addPoint)

  removeBtn = pane.addButton({ title: 'Remove Last Point', disabled: true })
  removeBtn.on('click', removePoint)
})

onUnmounted(() => pane?.dispose())
</script>

<template>
  <primitive :object="lineObj" />

  <template v-for="(pt, i) in controlPts" :key="pt.id">
    <TresMesh
      :ref="
        (el) => {
          if (el) meshRefs[i] = el
        }
      "
      :position="pt.pos"
    >
      <TresSphereGeometry :args="[0.18, 16, 16]" />
      <TresMeshStandardMaterial :color="getColor(i)" />
    </TresMesh>
    <TransformControls v-if="meshRefs[i]" :object="meshRefs[i]" />
  </template>

  <OrbitControls v-if="orbitEnabled" />

  <TresAmbientLight :intensity="1.5" />
  <TresDirectionalLight :position="[5, 10, 5]" :intensity="1" />
</template>
