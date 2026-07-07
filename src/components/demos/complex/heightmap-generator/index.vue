<script setup>
import { shallowRef, reactive, ref, watch, onMounted, onUnmounted } from 'vue'
import * as THREE from 'three'
import { Pane } from 'tweakpane'
import vertex from './vertex.glsl'
import fragment from './fragment.glsl'

function hexToVec3(hex) {
  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255
  return new THREE.Vector3(r, g, b)
}

function diamondSquare(size, roughness) {
  const grid = new Float32Array(size * size)
  const idx = (x, y) => y * size + x
  const clamp = (v) => Math.max(0, Math.min(1, v))
  const get = (x, y) => grid[idx((x + size) % size, (y + size) % size)]
  const set = (x, y, v) => {
    grid[idx(x, y)] = clamp(v)
  }
  const last = size - 1

  set(0, 0, Math.random())
  set(last, 0, Math.random())
  set(0, last, Math.random())
  set(last, last, Math.random())

  let step = last
  let r = roughness

  while (step > 1) {
    const half = step >> 1
    for (let y = 0; y < last; y += step)
      for (let x = 0; x < last; x += step) {
        const avg = (get(x, y) + get(x + step, y) + get(x, y + step) + get(x + step, y + step)) / 4
        set(x + half, y + half, avg + (Math.random() * 2 - 1) * r)
      }
    for (let y = 0; y <= last; y += half)
      for (let x = (y + half) % step; x <= last; x += step) {
        const avg = (get(x - half, y) + get(x + half, y) + get(x, y - half) + get(x, y + half)) / 4
        set(x, y, avg + (Math.random() * 2 - 1) * r)
      }
    step = half
    r *= 0.55
  }

  return grid
}

function buildTexture(size, roughness) {
  const data = diamondSquare(size, roughness)
  const pixels = new Uint8Array(size * size * 4)
  for (let i = 0; i < data.length; i++) {
    const v = Math.floor(data[i] * 255)
    pixels[i * 4 + 0] = v
    pixels[i * 4 + 1] = v
    pixels[i * 4 + 2] = v
    pixels[i * 4 + 3] = 255
  }
  const tex = new THREE.DataTexture(pixels, size, size, THREE.RGBAFormat)
  tex.needsUpdate = true
  return tex
}

// Valid sizes: 2^n + 1
const SIZES = { '65 (fast)': 65, 129: 129, 257: 257, '513 (slow)': 513 }

const params = reactive({
  gridSize: '257',
  roughness: 0.6,
  segments: 256,
  geoSize: 10,
  meshScale: 1.0,
  displacement: 3.0,
  lowColor: '#0d3366',
  midColor: '#4d8c34',
  highColor: '#e6e6e6'
})

const uniforms = reactive({
  uHeightmap: { value: buildTexture(257, 0.6) },
  uDisplacement: { value: params.displacement },
  uLowColor: { value: hexToVec3(params.lowColor) },
  uMidColor: { value: hexToVec3(params.midColor) },
  uHighColor: { value: hexToVec3(params.highColor) }
})

// Key forces TresPlaneGeometry to remount when segments or gridSize changes
const geoKey = ref(0)
const meshRef = shallowRef()

function regenerate() {
  const size = SIZES[params.gridSize] ?? 257
  uniforms.uHeightmap.value.dispose()
  uniforms.uHeightmap.value = buildTexture(size, params.roughness)
}

watch(
  () => params.displacement,
  (v) => {
    uniforms.uDisplacement.value = v
  }
)
watch(
  () => params.lowColor,
  (v) => {
    uniforms.uLowColor.value = hexToVec3(v)
  }
)
watch(
  () => params.midColor,
  (v) => {
    uniforms.uMidColor.value = hexToVec3(v)
  }
)
watch(
  () => params.highColor,
  (v) => {
    uniforms.uHighColor.value = hexToVec3(v)
  }
)
watch(
  () => meshRef.value,
  (mesh) => {
    if (mesh) mesh.scale.setScalar(params.meshScale)
  }
)

let pane
onMounted(() => {
  pane = new Pane({ title: 'Heightmap Controls' })

  const terrain = pane.addFolder({ title: 'Terrain Generation' })
  terrain
    .addBinding(params, 'gridSize', {
      label: 'grid size',
      options: Object.fromEntries(Object.keys(SIZES).map((k) => [k, k]))
    })
    .on('change', () => {
      geoKey.value++
      regenerate()
    })
  terrain
    .addBinding(params, 'roughness', { label: 'roughness', min: 0.1, max: 1.5, step: 0.01 })
    .on('change', regenerate)
  terrain.addButton({ title: 'New seed' }).on('click', regenerate)

  const geometry = pane.addFolder({ title: 'Geometry' })
  geometry
    .addBinding(params, 'segments', {
      label: 'segments',
      options: { 64: 64, 128: 128, 256: 256, 512: 512 }
    })
    .on('change', () => {
      geoKey.value++
    })
  geometry
    .addBinding(params, 'geoSize', { label: 'geo size', min: 1, max: 50, step: 0.5 })
    .on('change', () => {
      geoKey.value++
    })
  geometry
    .addBinding(params, 'meshScale', { label: 'mesh scale', min: 0.1, max: 5.0, step: 0.01 })
    .on('change', (e) => {
      if (meshRef.value) meshRef.value.scale.setScalar(e.value)
    })

  const shading = pane.addFolder({ title: 'Shading' })
  shading.addBinding(params, 'displacement', { label: 'displacement', min: 0, max: 10, step: 0.01 })
  shading.addBinding(params, 'lowColor', { label: 'low color' })
  shading.addBinding(params, 'midColor', { label: 'mid color' })
  shading.addBinding(params, 'highColor', { label: 'high color' })
})

onUnmounted(() => {
  pane?.dispose()
  uniforms.uHeightmap.value?.dispose()
})
</script>

<template>
  <TresMesh ref="meshRef" :rotation="[-Math.PI / 2, 0, 0]">
    <TresPlaneGeometry
      :key="geoKey"
      :args="[params.geoSize, params.geoSize, params.segments, params.segments]"
    />
    <TresShaderMaterial :vertex-shader="vertex" :fragment-shader="fragment" :uniforms="uniforms" />
  </TresMesh>
  <TresAmbientLight :intensity="0.5" />
  <TresDirectionalLight :position="[5, 10, 5]" :intensity="1.5" />
</template>
