import { Pane } from 'tweakpane'
import * as EssentialsPlugin from '@tweakpane/plugin-essentials'

export const VIEW = { RADIOSITY: 0, ELEMENTS: 1, RESIDUAL: 2, SHOOTERS: 3 }

const VIEW_OPTIONS = {
  'Radiosity (bilinear)': VIEW.RADIOSITY,
  'Elements (texels)': VIEW.ELEMENTS,
  'Unshot residual': VIEW.RESIDUAL,
  'Recent shooters': VIEW.SHOOTERS
}
const DENSITY_OPTIONS = { 16: 16, 24: 24, 32: 32, 48: 48, 64: 64 }
const BLOCK_OPTIONS = {
  '1 × 1 texel': 1,
  '2 × 2 texels': 2,
  '4 × 4 texels': 4,
  '8 × 8 texels': 8
}
const ITEM_OPTIONS = { 128: 128, 256: 256, 512: 512 }

const addSlider = (folder, params, key, label, [min, max, step]) =>
  folder.addBinding(params, key, { label, min, max, step })

const addSolverFolder = (pane, params, onRestart) => {
  const folder = pane.addFolder({ title: 'Progressive refinement' })
  addSlider(folder, params, 'shotsPerBatch', 'shooters / batch', [1, 64, 1])
  addSlider(folder, params, 'batchesPerFrame', 'batches / frame', [1, 8, 1])
  addSlider(folder, params, 'stopUnshot', 'stop at unshot %', [0, 5, 0.05])
  folder.addBinding(params, 'ambientTerm', { label: 'ambient term' })
  folder.addButton({ title: 'Restart solution' }).on('click', onRestart)
}

const addElementsFolder = (pane, params) => {
  const folder = pane.addFolder({ title: 'Elements' })
  folder.addBinding(params, 'density', { label: 'texels / unit', options: DENSITY_OPTIONS })
  folder.addBinding(params, 'shooterBlock', { label: 'shooter size', options: BLOCK_OPTIONS })
}

const addVisibilityFolder = (pane, params) => {
  const folder = pane.addFolder({ title: 'Visibility (item buffer)' })
  folder.addBinding(params, 'itemResolution', { label: 'resolution', options: ITEM_OPTIONS })
  folder.addBinding(params, 'softVisibility', { label: '3 × 3 taps' })
  addSlider(folder, params, 'depthTolerance', 'depth tolerance', [0, 4, 0.1])
  folder.addBinding(params, 'showItemBuffer', { label: 'show item buffers' })
}

const addLightFolder = (pane, params) => {
  const folder = pane.addFolder({ title: 'Light' })
  addSlider(folder, params, 'lightPower', 'power', [0, 120, 0.5])
  folder.addBinding(params, 'lightColor', { label: 'colour' })
  addSlider(folder, params, 'lightX', 'x', [-0.65, 0.65, 0.01])
  addSlider(folder, params, 'lightZ', 'z', [-0.7, 0.7, 0.01])
  folder.addBinding(params, 'swayLight', { label: 'sway' })
}

const addSceneFolder = (pane, params) => {
  const folder = pane.addFolder({ title: 'Scene' })
  addSlider(folder, params, 'boxX', 'short box x', [-0.55, 0.55, 0.01])
  addSlider(folder, params, 'boxZ', 'short box z', [-0.55, 0.55, 0.01])
  addSlider(folder, params, 'boxRotation', 'short box turn', [-Math.PI, Math.PI, 0.01])
  folder.addBinding(params, 'animateBox', { label: 'animate box' })
  addSlider(folder, params, 'animationSpeed', 'speed', [0.1, 3, 0.05])
  folder.addBinding(params, 'whiteColor', { label: 'white walls' })
  folder.addBinding(params, 'leftColor', { label: 'left wall' })
  folder.addBinding(params, 'rightColor', { label: 'right wall' })
}

const addViewFolder = (pane, params) => {
  const folder = pane.addFolder({ title: 'View' })
  folder.addBinding(params, 'view', { label: 'show', options: VIEW_OPTIONS })
  addSlider(folder, params, 'exposure', 'exposure', [0.1, 4, 0.05])
  addSlider(folder, params, 'residualGain', 'residual gain', [1, 50, 1])
}

const addStatsFolder = (pane, stats) => {
  const folder = pane.addFolder({ title: 'Stats' })
  const fpsGraph = folder.addBlade({ view: 'fpsgraph', label: 'fps', rows: 2 })
  const integer = (value) => value.toFixed(0)
  folder.addBinding(stats, 'elements', { label: 'elements', readonly: true, format: integer })
  folder.addBinding(stats, 'shooters', { label: 'shooters', readonly: true, format: integer })
  folder.addBinding(stats, 'shots', { label: 'shots', readonly: true, format: integer })
  folder.addBinding(stats, 'unshot', {
    label: 'unshot %',
    readonly: true,
    format: (value) => value.toFixed(2)
  })
  folder.addBinding(stats, 'state', { label: 'state', readonly: true })
  return fpsGraph
}

// No change listeners: the solver compares settings every frame and restarts on its own.
export const createRadiosityPane = ({ params, stats, onRestart }) => {
  const pane = new Pane({ title: 'Progressive Radiosity (GPU Gems 2 · 39)' })
  pane.registerPlugin(EssentialsPlugin)
  addSolverFolder(pane, params, onRestart)
  addElementsFolder(pane, params)
  addVisibilityFolder(pane, params)
  addLightFolder(pane, params)
  addSceneFolder(pane, params)
  addViewFolder(pane, params)
  const fpsGraph = addStatsFolder(pane, stats)
  return { pane, fpsGraph }
}
