<script setup>
import { reactive, onUnmounted } from 'vue'
import { GLSL3, MeshBasicMaterial, PlaneGeometry, ShaderMaterial, Vector3 } from 'three'
import { Pane } from 'tweakpane'
import vertex from './vertex.glsl'
import fragment from './fragment.glsl'
import { buildTileAtlas, buildIndirectionTexture } from './wangTiles'

const PLANE_SIZE = 20
const FLAT = [-Math.PI / 2, 0, 0]

const params = reactive({
  mode: 1,
  uvScale: 1,
  outputTiles: 16,
  seed: 1,
  edgeColors: 2,
  tileSize: 64,
  detail: 0.42,
  normalStrength: 1.0,
  azimuth: 45,
  elevation: 40,
  showBorders: false,
  tintTiles: false,
  showAtlas: true,
  showIndex: false
})

let tileSetSeed = 1

let atlas = buildTileAtlas({
  edgeColors: params.edgeColors,
  tileSize: params.tileSize,
  detail: params.detail,
  seed: tileSetSeed
})

let indexTexture = buildIndirectionTexture({
  edgeColors: params.edgeColors,
  outputTiles: params.outputTiles,
  seed: params.seed
})

// The ground plane never leaves its tangent frame, so the light is simply given in it: x and y
// run along uv, z points out of the surface.
const lightDir = new Vector3()
const updateLight = () => {
  const azimuth = (params.azimuth * Math.PI) / 180
  const elevation = (params.elevation * Math.PI) / 180
  lightDir.set(
    Math.cos(azimuth) * Math.cos(elevation),
    Math.sin(azimuth) * Math.cos(elevation),
    Math.sin(elevation)
  )
}
updateLight()

const groundGeometry = new PlaneGeometry(PLANE_SIZE, PLANE_SIZE)
const panelGeometry = new PlaneGeometry(4, 4)

const material = new ShaderMaterial({
  glslVersion: GLSL3,
  uniforms: {
    uTilesColor: { value: atlas.colorTexture },
    uTilesNormal: { value: atlas.normalTexture },
    uIndex: { value: indexTexture },
    uAtlasTiles: { value: atlas.tilesAcross },
    uOutputTiles: { value: params.outputTiles },
    uEdgeColors: { value: params.edgeColors },
    uSeed: { value: params.seed },
    uUvScale: { value: params.uvScale },
    uNormalStrength: { value: params.normalStrength },
    uLightDir: { value: lightDir },
    uMode: { value: params.mode },
    uShowBorders: { value: 0 },
    uTintTiles: { value: 0 }
  },
  vertexShader: vertex,
  fragmentShader: fragment
})

const atlasPreviewMaterial = new MeshBasicMaterial({ map: atlas.colorTexture })

// The index texture holds raw tile coordinates, so its bytes only ever run 0..8 and it shows up
// black next to the atlas. This spreads them back over the visible range.
const indexPreviewMaterial = new ShaderMaterial({
  uniforms: {
    uIndex: { value: indexTexture },
    uAtlasTiles: { value: atlas.tilesAcross }
  },
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: /* glsl */ `
    uniform sampler2D uIndex;
    uniform float uAtlasTiles;
    varying vec2 vUv;
    void main() {
      vec2 tile = floor(texture2D(uIndex, vUv).rg * 255.0 + 0.5);
      gl_FragColor = vec4(tile / max(uAtlasTiles - 1.0, 1.0), 0.35, 1.0);
    }
  `
})

const rebuildAtlas = () => {
  atlas.colorTexture.dispose()
  atlas.normalTexture.dispose()
  atlas = buildTileAtlas({
    edgeColors: params.edgeColors,
    tileSize: params.tileSize,
    detail: params.detail,
    seed: tileSetSeed
  })
  material.uniforms.uTilesColor.value = atlas.colorTexture
  material.uniforms.uTilesNormal.value = atlas.normalTexture
  material.uniforms.uAtlasTiles.value = atlas.tilesAcross
  atlasPreviewMaterial.map = atlas.colorTexture
  atlasPreviewMaterial.needsUpdate = true
  indexPreviewMaterial.uniforms.uAtlasTiles.value = atlas.tilesAcross
}

const rebuildIndex = () => {
  indexTexture.dispose()
  indexTexture = buildIndirectionTexture({
    edgeColors: params.edgeColors,
    outputTiles: params.outputTiles,
    seed: params.seed
  })
  material.uniforms.uIndex.value = indexTexture
  material.uniforms.uOutputTiles.value = params.outputTiles
  indexPreviewMaterial.uniforms.uIndex.value = indexTexture
}

const pane = new Pane({ title: 'Tile-Based Texture Mapping' })

pane
  .addBinding(params, 'mode', {
    label: 'technique',
    options: {
      'Single tile (naive repeat)': 0,
      'Wang - indirection texture (12.4)': 1,
      'Wang - procedural hash': 2
    }
  })
  .on('change', ({ value }) => (material.uniforms.uMode.value = value))

const tilingFolder = pane.addFolder({ title: 'Tiling' })
tilingFolder
  .addBinding(params, 'uvScale', { label: 'uv scale', min: 0.5, max: 24, step: 0.5 })
  .on('change', ({ value }) => (material.uniforms.uUvScale.value = value))
tilingFolder
  .addBinding(params, 'outputTiles', {
    label: 'cells across',
    options: { 16: 16, 32: 32, 64: 64, 128: 128 }
  })
  .on('change', rebuildIndex)
tilingFolder
  .addBinding(params, 'seed', { label: 'seed', min: 0, max: 64, step: 1 })
  .on('change', ({ value }) => {
    material.uniforms.uSeed.value = value
    rebuildIndex()
  })
tilingFolder.addButton({ title: 'New tiling' }).on('click', () => {
  params.seed = (params.seed + 1) % 65
  material.uniforms.uSeed.value = params.seed
  rebuildIndex()
  pane.refresh()
})

const tileSetFolder = pane.addFolder({ title: 'Tile set' })
tileSetFolder
  .addBinding(params, 'edgeColors', {
    label: 'edge colours',
    options: { '2 (16 tiles)': 2, '3 (81 tiles)': 3 }
  })
  .on('change', ({ value }) => {
    material.uniforms.uEdgeColors.value = value
    rebuildAtlas()
    rebuildIndex()
  })
tileSetFolder
  .addBinding(params, 'tileSize', { label: 'tile pixels', options: { 32: 32, 64: 64, 128: 128 } })
  .on('change', rebuildAtlas)
tileSetFolder
  .addBinding(params, 'detail', { label: 'detail', min: 0, max: 0.8, step: 0.01 })
  .on('change', rebuildAtlas)
tileSetFolder.addButton({ title: 'New tile set' }).on('click', () => {
  tileSetSeed++
  rebuildAtlas()
})

const shadingFolder = pane.addFolder({ title: 'Shading' })
shadingFolder
  .addBinding(params, 'normalStrength', { label: 'relief', min: 0, max: 3, step: 0.05 })
  .on('change', ({ value }) => (material.uniforms.uNormalStrength.value = value))
shadingFolder
  .addBinding(params, 'azimuth', { label: 'light azimuth', min: 0, max: 360, step: 1 })
  .on('change', updateLight)
shadingFolder
  .addBinding(params, 'elevation', { label: 'light elevation', min: 5, max: 90, step: 1 })
  .on('change', updateLight)

const debugFolder = pane.addFolder({ title: 'Debug' })
debugFolder
  .addBinding(params, 'showBorders', { label: 'tile borders' })
  .on('change', ({ value }) => (material.uniforms.uShowBorders.value = value ? 1 : 0))
debugFolder
  .addBinding(params, 'tintTiles', { label: 'tint by tile' })
  .on('change', ({ value }) => (material.uniforms.uTintTiles.value = value ? 1 : 0))
debugFolder.addBinding(params, 'showAtlas', { label: 'atlas panel' })
debugFolder.addBinding(params, 'showIndex', { label: 'index panel' })

onUnmounted(() => {
  pane?.dispose()
  atlas.colorTexture.dispose()
  atlas.normalTexture.dispose()
  indexTexture.dispose()
  groundGeometry.dispose()
  panelGeometry.dispose()
  material.dispose()
  atlasPreviewMaterial.dispose()
  indexPreviewMaterial.dispose()
})
</script>

<template>
  <TresMesh :geometry="groundGeometry" :material="material" :rotation="FLAT" />
  <TresMesh
    :geometry="panelGeometry"
    :material="atlasPreviewMaterial"
    :position="[-3.2, 2.6, -11]"
    :visible="params.showAtlas"
  />
  <TresMesh
    :geometry="panelGeometry"
    :material="indexPreviewMaterial"
    :position="[3.2, 2.6, -11]"
    :visible="params.showIndex"
  />
</template>
