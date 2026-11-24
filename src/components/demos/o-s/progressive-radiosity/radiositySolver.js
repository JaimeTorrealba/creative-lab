import { Color, Mesh, OrthographicCamera, Scene, Vector3 } from 'three'
import { FullScreenQuad } from 'three/examples/jsm/postprocessing/Pass.js'
import { createAtlasLayout, createShooterCells } from './atlasLayout'
import { createRadiosityMaterials } from './materials'
import {
  renderDisplay,
  renderItemBuffers,
  renderItemInset,
  runEmissionPass,
  runReconstructPass,
  runReducePass
} from './radiosityPasses'
import {
  createItemAtlas,
  createShooterBatch,
  createShooterGrid,
  createSolutionTargets,
  writeShooters
} from './radiosityTargets'
import { createItemGeometry, createSurfaceGeometry } from './sceneGeometry'
import {
  computeAmbient,
  createResidualSummary,
  createSelection,
  scanResidual
} from './shooterSelection'

const createMeshScene = (geometry, material) => {
  const mesh = new Mesh(geometry, material)
  mesh.frustumCulled = false
  const scene = new Scene()
  scene.add(mesh)
  return { scene, mesh }
}

const computeReflectance = (polygons, palette) => {
  const color = new Color()
  const sum = [0, 0, 0]
  let area = 0
  polygons.forEach((polygon) => {
    const polygonArea = polygon.width * polygon.height
    color.set(palette[polygon.colorKey])
    sum[0] += color.r * polygonArea
    sum[1] += color.g * polygonArea
    sum[2] += color.b * polygonArea
    area += polygonArea
  })
  return sum.map((value) => value / area)
}

export const createRadiositySolver = (radiosityScene) => {
  const { polygons } = radiosityScene
  const materials = createRadiosityMaterials()
  const camera = new OrthographicCamera()
  const quad = new FullScreenQuad()
  const item = createItemGeometry(polygons)
  const itemScene = createMeshScene(item.geometry, materials.item).scene
  const batch = createShooterBatch()
  const selection = createSelection()
  const summary = createResidualSummary()
  const lightEmission = new Color()

  const context = { materials, camera, quad, itemScene, batch, ambient: new Vector3() }
  const keys = { layout: '', item: '', scene: '' }
  const status = { shots: 0, converged: false, fresh: false, pendingReset: true }
  const energy = { initial: 0, unshot: 0, reflectance: [0, 0, 0] }
  let surface = null
  let cells = null

  const disposeLayout = () => {
    if (!surface) return
    surface.geometry.dispose()
    context.solution.dispose()
    context.grid.target.dispose()
  }

  const buildLayout = ({ density, shooterBlock }) => {
    disposeLayout()
    const layout = createAtlasLayout(polygons, density, shooterBlock)
    cells = createShooterCells(polygons, layout)
    surface = createSurfaceGeometry(polygons, layout)
    const atlas = createMeshScene(surface.geometry, materials.emission)
    context.layout = layout
    context.atlasScene = atlas.scene
    context.atlasMesh = atlas.mesh
    context.displayScene = createMeshScene(surface.geometry, materials.display).scene
    context.solution = createSolutionTargets(layout)
    context.grid = createShooterGrid(layout)
    keys.scene = ''
  }

  const buildItemAtlas = ({ shotsPerBatch, itemResolution }) => {
    context.itemAtlas?.target.dispose()
    context.itemAtlas = createItemAtlas(shotsPerBatch, itemResolution)
  }

  const applyScene = (settings, sceneState) => {
    radiosityScene.setPlacements(sceneState)
    item.updatePlacement()
    surface.updatePlacement()
    lightEmission.set(settings.lightColor).multiplyScalar(settings.lightPower)
    surface.updateMaterials(settings.palette, lightEmission)
    energy.reflectance = computeReflectance(polygons, settings.palette)
  }

  const reset = () => (status.pendingReset = true)

  // Structural settings rebuild buffers; anything that changes the answer restarts it.
  const sync = (settings, sceneState) => {
    const layoutKey = `${settings.density}|${settings.shooterBlock}`
    const itemKey = `${settings.shotsPerBatch}|${settings.itemResolution}`
    const { palette, lightColor, lightPower, depthTolerance, softVisibility } = settings
    const solutionKey = JSON.stringify([
      sceneState,
      palette,
      lightColor,
      lightPower,
      depthTolerance,
      softVisibility
    ])

    if (layoutKey !== keys.layout) {
      buildLayout(settings)
      keys.layout = layoutKey
      reset()
    }
    if (itemKey !== keys.item) {
      const resolutionChanged = !keys.item.endsWith(`|${settings.itemResolution}`)
      buildItemAtlas(settings)
      keys.item = itemKey
      status.fresh = false
      if (resolutionChanged) reset()
    }
    if (solutionKey !== keys.scene) {
      applyScene(settings, sceneState)
      keys.scene = solutionKey
      reset()
    }
  }

  const restart = (renderer) => {
    runEmissionPass(renderer, context)
    Object.assign(status, { shots: 0, converged: false, fresh: false, pendingReset: false })
    energy.initial = 0
  }

  // Mipmap-style reduction, read back to pick the next shooters and to track convergence.
  const scan = (renderer, settings) => {
    runReducePass(renderer, { ...context, block: settings.shooterBlock })
    const { pixels } = context.grid
    const limit = settings.shotsPerBatch
    scanResidual({ cells, pixels, selection, summary, limit, minPower: 0 })
    if (energy.initial === 0) energy.initial = summary.power
    energy.unshot = summary.power
    const stopPower = (settings.stopUnshot / 100) * energy.initial
    status.fresh = true
    status.converged = selection.count === 0 || summary.power <= stopPower
    status.convergedAt = settings.stopUnshot
  }

  const shootBatch = (renderer, settings) => {
    writeShooters({ batch, selection, cells, polygons, itemAtlas: context.itemAtlas })
    renderItemBuffers(renderer, context)
    runReconstructPass(renderer, context, settings)
    status.shots += batch.count
    status.fresh = false
  }

  const step = (renderer, settings) => {
    renderer.autoClear = false
    if (status.pendingReset) restart(renderer)
    if (status.converged && settings.stopUnshot < status.convergedAt) status.fresh = false

    // Each scan reads back the residual left by the previous batch, so batches never shoot
    // stale energy; a converged solution skips all of it and only redraws.
    for (let pass = 0; pass < settings.batchesPerFrame && !status.converged; pass++) {
      if (!status.fresh) scan(renderer, settings)
      if (status.converged) break
      shootBatch(renderer, settings)
    }
    if (!status.fresh) scan(renderer, settings)
  }

  const render = (renderer, view, settings) => {
    if (settings.ambientTerm) {
      const { reflectance } = energy
      const { totalArea } = cells
      computeAmbient({ summary, totalArea, reflectance, target: context.ambient })
    } else context.ambient.set(0, 0, 0)
    renderDisplay(renderer, context, view)
    if (settings.showItemBuffer) renderItemInset(renderer, context)
  }

  const getStats = () => ({
    elements: context.layout.texelCount,
    shooters: cells.count,
    shots: status.shots,
    unshot: energy.initial > 0 ? (energy.unshot / energy.initial) * 100 : 0,
    converged: status.converged
  })

  const dispose = () => {
    disposeLayout()
    context.itemAtlas?.target.dispose()
    item.geometry.dispose()
    batch.dispose()
    quad.dispose()
    materials.dispose()
  }

  return { sync, step, render, reset, getStats, dispose }
}
