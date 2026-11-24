<script setup>
import { onUnmounted } from 'vue'
import { useLoop, useTres } from '@tresjs/core'
import { Mesh, MeshBasicMaterial, SphereGeometry } from 'three'
import { createOctreeWireframe, createSurfacePointer } from './octree'
import { createDonutMesh, createSurfaceUniforms, EXPORT_SHADERS, VIEW } from './donutMesh'
import { createOctreeSurface } from './octreeSurface'
import { createTextureExporter } from './textureExporter'
import { createDonutOrientation, createDonutTools, createLiquidSources } from './donutTools'
import { createTexturesPane, TOOL } from './texturesPane'

const params = {
  tool: TOOL.BRUSH,
  brushColor: '#ff6fae',
  brushRadius: 0.08,
  brushOpacity: 0.6,
  brushHardness: 0.45,
  erase: false,
  pourRate: 6,
  pourRadius: 0.12,
  rain: false,
  rainRate: 20,
  rainAmount: 0.5,
  gravityStrength: 1,
  pressure: 1.2,
  flow: 0.05,
  stick: 0.03,
  substeps: 3,
  drip: 0.04,
  dripThreshold: 0.35,
  absorb: 0.01,
  wetDecay: 0.08,
  tiltX: 0,
  tiltZ: 0,
  tumble: false,
  tumbleSpeed: 0.3,
  doughColor: '#d9a35f',
  liquidColor: '#5b3a24',
  liquidOpacity: 0.95,
  filmThickness: 0.18,
  bumpStrength: 0.04,
  depth: 7,
  trilinear: true,
  wireframeLevel: -1,
  view: VIEW.SHADED,
  bakeWidth: 2048
}
const stats = { nodes: 0, leaves: 0, mapSize: '', gpuBytes: 0, bakeMs: 0 }
const MAX_FRAME_TIME = 1 / 30

const { renderer, camera } = useTres()
const uniforms = createSurfaceUniforms()
const donut = createDonutMesh(uniforms)
const orientation = createDonutOrientation(donut)
const surface = createOctreeSurface({
  geometry: donut.geometry,
  renderer,
  uniforms,
  gravity: orientation.gravity
})
const exporter = createTextureExporter({ geometry: donut.geometry, uniforms, ...EXPORT_SHADERS })
const tools = createDonutTools({ params, surface })
const collectSources = createLiquidSources({ params, surface, tools, up: orientation.up })
const wireframe = createOctreeWireframe('#9fd3ff')
donut.add(wireframe.lines)

const cursor = new Mesh(
  new SphereGeometry(1, 20, 12),
  new MeshBasicMaterial({ color: '#ffffff', wireframe: true, transparent: true, opacity: 0.3 })
)
cursor.visible = false

const refreshWireframe = () => {
  wireframe.lines.visible = params.wireframeLevel >= 0
  if (wireframe.lines.visible) {
    wireframe.showLevel(surface.getTree(), surface.frame, params.wireframeLevel)
  }
}

const rebuildOctree = () => {
  surface.build(params.depth)
  Object.assign(stats, surface.getStats())
  refreshWireframe()
}

const bakeTexture = async (download) => {
  const start = performance.now()
  uniforms.uBakedMap.value = await exporter.bakeTexture(renderer, {
    width: params.bakeWidth,
    height: params.bakeWidth / 2,
    download
  })
  stats.bakeMs = performance.now() - start
  if (!download) params.view = VIEW.BAKED
  pane.refresh()
}

// The bake is a snapshot, so drawing on the donut switches back to the live surface.
const showLiveSurface = () => {
  if (params.view !== VIEW.BAKED) return
  params.view = VIEW.SHADED
  pane.refresh()
}

const { pane, fpsGraph } = createTexturesPane({
  params,
  stats,
  handlers: {
    onClearPaint: () => surface.clearPaint(),
    onClearLiquid: () => surface.clearLiquid(),
    onDepthChange: rebuildOctree,
    onWireframeChange: refreshWireframe,
    onBake: bakeTexture
  }
})

const pointer = createSurfacePointer({
  domElement: renderer.domElement,
  getCamera: () => camera.value,
  getMesh: () => donut,
  onHover: (surfaceHit) => {
    cursor.visible = Boolean(surfaceHit)
    if (surfaceHit) cursor.position.copy(surfaceHit.point)
  },
  onStroke: (surfaceHit, isStart) => {
    if (isStart) showLiveSurface()
    tools.handleStroke(surfaceHit, isStart)
  },
  onStrokeEnd: tools.endStroke
})

const syncUniforms = () => {
  uniforms.uTrilinear.value = params.trilinear
  uniforms.uView.value = params.view === VIEW.BAKED && !uniforms.uBakedMap.value ? VIEW.SHADED : params.view
  uniforms.uDoughColor.value.set(params.doughColor)
  uniforms.uLiquidColor.value.set(params.liquidColor)
  uniforms.uLiquidOpacity.value = params.liquidOpacity
  uniforms.uFilmThickness.value = params.filmThickness
  uniforms.uBumpStrength.value = params.bumpStrength
  surface.setFlowParameters({
    uGravityStrength: params.gravityStrength,
    uPressure: params.pressure,
    uFlow: params.flow,
    uStick: params.stick,
    uSourceRadius: params.pourRadius,
    uDrip: params.drip,
    uDripThreshold: params.dripThreshold,
    uAbsorb: params.absorb,
    uWetDecay: params.wetDecay
  })
  cursor.scale.setScalar(tools.cursorRadius())
}

rebuildOctree()

const { onBeforeRender, onRender } = useLoop()

onBeforeRender(({ delta }) => {
  fpsGraph.begin()
  const frameTime = Math.min(delta, MAX_FRAME_TIME)
  orientation.update(params, frameTime)
  syncUniforms()
  surface.advance({
    substeps: params.substeps,
    stepTime: frameTime / params.substeps,
    sources: collectSources(frameTime)
  })
})

onRender(() => fpsGraph.end())

onUnmounted(() => {
  pointer.dispose()
  pane.dispose()
  surface.dispose()
  exporter.dispose()
  wireframe.dispose()
  donut.geometry.dispose()
  donut.material.dispose()
  cursor.geometry.dispose()
  cursor.material.dispose()
})
</script>

<template>
  <primitive :object="donut" />
  <primitive :object="cursor" />
</template>
