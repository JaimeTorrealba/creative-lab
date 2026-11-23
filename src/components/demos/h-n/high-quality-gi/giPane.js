import { Pane } from 'tweakpane'
import * as EssentialsPlugin from '@tweakpane/plugin-essentials'
import { VIEW } from './pipeline'

const VIEW_OPTIONS = {
  'Final (two-pass)': VIEW.FINAL,
  'First pass only (vertices)': VIEW.FIRST_PASS,
  'Direct only': VIEW.DIRECT,
  'Indirect only': VIEW.INDIRECT,
  'Gathered irradiance': VIEW.IRRADIANCE,
  'Bundle depth layer': VIEW.LAYER
}

const RESOLUTION_OPTIONS = { 128: 128, 256: 256, 512: 512, 1024: 1024 }

const addSlider = (folder, params, key, label, [min, max, step]) =>
  folder.addBinding(params, key, { label, min, max, step })

const addBundleFolder = (pane, params) => {
  const folder = pane.addFolder({ title: 'Ray bundles' })
  addSlider(folder, params, 'directionsPerFrame', 'bundles / frame', [1, 64, 1])
  addSlider(folder, params, 'layers', 'depth layers', [2, 12, 1])
  folder.addBinding(params, 'bundleResolution', {
    label: 'rays / side',
    options: RESOLUTION_OPTIONS
  })
  addSlider(folder, params, 'bounces', 'bounces', [1, 5, 1])
  addSlider(folder, params, 'normalBias', 'normal bias', [0, 0.05, 0.001])
  addSlider(folder, params, 'slopeBias', 'slope bias', [0, 4, 0.05])
  addSlider(folder, params, 'peelEpsilon', 'peel epsilon', [0, 0.02, 0.0005])
  return folder
}

const addConvergenceFolder = (pane, params) => {
  const folder = pane.addFolder({ title: 'Convergence' })
  addSlider(folder, params, 'maxDirections', 'max bundles', [64, 4096, 64])
  addSlider(folder, params, 'directionsPerBounce', 'bundles / bounce', [32, 1024, 32])
  addSlider(folder, params, 'vertexDirectionsPerFrame', 'first pass / frame', [1, 128, 1])
  addSlider(folder, params, 'temporal', 'moving history', [0.5, 0.99, 0.01])
  addSlider(folder, params, 'warmup', 'first-pass fill', [0, 256, 8])
  return folder
}

const addLightFolder = (pane, params) => {
  const folder = pane.addFolder({ title: 'Light' })
  addSlider(folder, params, 'lightPower', 'power', [0, 30, 0.1])
  folder.addBinding(params, 'lightColor', { label: 'colour' })
  addSlider(folder, params, 'softness', 'shadow softness', [0, 0.02, 0.0005])
  addSlider(folder, params, 'shadowBias', 'shadow bias', [0, 0.02, 0.0005])
  addSlider(folder, params, 'shadowNormalOffset', 'normal offset (texels)', [0, 4, 0.1])
  folder.addBinding(params, 'swayLight', { label: 'sway light' })
  folder.addBinding(params, 'environmentColor', { label: 'environment' })
  addSlider(folder, params, 'environmentStrength', 'env strength', [0, 2, 0.01])
  return folder
}

const addSceneFolder = (pane, params, onSurfaceColor) => {
  const folder = pane.addFolder({ title: 'Scene' })
  folder.addBinding(params, 'animateSphere', { label: 'animate sphere' })
  addSlider(folder, params, 'sphereSpeed', 'sphere speed', [0.1, 3, 0.05])
  const colorKeys = { leftColor: 'left', rightColor: 'right', sphereColor: 'sphere' }
  Object.entries(colorKeys).forEach(([key, surface]) =>
    folder
      .addBinding(params, key, { label: `${surface} colour` })
      .on('change', ({ value }) => onSurfaceColor(surface, value))
  )
  return folder
}

const addAntialiasFolder = (pane, params) => {
  const folder = pane.addFolder({ title: 'Anti-aliasing (38.5.2)' })
  folder.addBinding(params, 'antialias', { label: 'jitter + average' })
  addSlider(folder, params, 'aaSamples', 'samples', [1, 64, 1])
  addSlider(folder, params, 'aaMovingBlend', 'moving blend', [0, 0.95, 0.05])
  return folder
}

const addViewFolder = (pane, params) => {
  const folder = pane.addFolder({ title: 'View' })
  folder.addBinding(params, 'view', { label: 'show', options: VIEW_OPTIONS })
  addSlider(folder, params, 'exposure', 'exposure', [0.1, 4, 0.05])
  addSlider(folder, params, 'resolutionScale', 'resolution', [0.25, 1, 0.05])
  addSlider(folder, params, 'debugDirection', 'layer bundle', [0, 255, 1])
  addSlider(folder, params, 'debugLayer', 'layer index', [0, 11, 1])
  return folder
}

const addStatsFolder = (pane, stats) => {
  const folder = pane.addFolder({ title: 'Stats' })
  const fpsGraph = folder.addBlade({ view: 'fpsgraph', label: 'fps', rows: 2 })
  const monitors = {
    screenDirections: 'final bundles',
    vertexPasses: 'first passes',
    raysPerFrame: 'rays / frame',
    aaSamples: 'aa samples'
  }
  Object.entries(monitors).forEach(([key, label]) =>
    folder.addBinding(stats, key, { label, readonly: true, format: (value) => value.toFixed(0) })
  )
  return fpsGraph
}

// Inputs that change the solution live in their own folders with a reset listener; display-only
// inputs restart just the antialiasing average, which is frozen once converged. The stats folder
// is kept apart because read-only monitors emit 'change' on every refresh.
export const createGiPane = ({ params, stats, onReset, onViewChange, onSurfaceColor }) => {
  const pane = new Pane({ title: 'High-Quality GI (GPU Gems 2 · 38)' })
  pane.registerPlugin(EssentialsPlugin)

  const resettingFolders = [
    addBundleFolder(pane, params),
    addConvergenceFolder(pane, params),
    addLightFolder(pane, params),
    addSceneFolder(pane, params, onSurfaceColor)
  ]
  resettingFolders.forEach((folder) => folder.on('change', onReset))

  const displayFolders = [addAntialiasFolder(pane, params), addViewFolder(pane, params)]
  displayFolders.forEach((folder) => folder.on('change', onViewChange))
  const fpsGraph = addStatsFolder(pane, stats)

  return { pane, fpsGraph }
}
