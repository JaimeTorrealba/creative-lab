import { Pane } from 'tweakpane'
import * as EssentialsPlugin from '@tweakpane/plugin-essentials'
import { VIEW } from './donutMesh'

export const TOOL = { BRUSH: 'brush', POUR: 'pour' }
const TOOL_OPTIONS = { 'Paint brush': TOOL.BRUSH, 'Pour liquid': TOOL.POUR }
const DEPTH_OPTIONS = { '64³ (6)': 6, '128³ (7)': 7, '256³ (8)': 8 }
const VIEW_OPTIONS = { Shaded: VIEW.SHADED, 'Liquid height': VIEW.HEIGHT, 'Baked 2D texture': VIEW.BAKED }
const BAKE_OPTIONS = { '1024×512': 1024, '2048×1024': 2048, '4096×2048': 4096 }
const megabytes = (bytes) => `${(bytes / 1048576).toFixed(1)} MB`

const addSlider = (folder, params, key, label, [min, max, step]) =>
  folder.addBinding(params, key, { label, min, max, step })

const addToolFolder = (pane, params, handlers) => {
  const folder = pane.addFolder({ title: 'Tool (left-drag on the donut)' })
  folder.addBinding(params, 'tool', { label: 'tool', options: TOOL_OPTIONS })
  folder.addBinding(params, 'brushColor', { label: 'brush colour' })
  addSlider(folder, params, 'brushRadius', 'brush radius', [0.02, 0.4, 0.005])
  addSlider(folder, params, 'brushOpacity', 'brush opacity', [0.01, 1, 0.01])
  addSlider(folder, params, 'brushHardness', 'brush hardness', [0, 1, 0.01])
  folder.addBinding(params, 'erase', { label: 'erase paint' })
  addSlider(folder, params, 'pourRate', 'pour rate', [0.5, 20, 0.5])
  addSlider(folder, params, 'pourRadius', 'pour radius', [0.03, 0.4, 0.01])
  folder.addButton({ title: 'Clear paint' }).on('click', handlers.onClearPaint)
}

const addRainFolder = (pane, params) => {
  const folder = pane.addFolder({ title: 'Rain', expanded: false })
  folder.addBinding(params, 'rain', { label: 'rain' })
  addSlider(folder, params, 'rainRate', 'drops / s', [1, 120, 1])
  addSlider(folder, params, 'rainAmount', 'drop size', [0.05, 2, 0.05])
}

const addFlowFolder = (pane, params, handlers) => {
  const folder = pane.addFolder({ title: 'Flow (37.4 cellular automaton)', expanded: false })
  addSlider(folder, params, 'gravityStrength', 'gravity', [0, 4, 0.05])
  addSlider(folder, params, 'pressure', 'pressure', [0, 4, 0.05])
  addSlider(folder, params, 'flow', 'flow rate', [0.005, 0.2, 0.005])
  addSlider(folder, params, 'stick', 'sticky film', [0, 0.2, 0.005])
  addSlider(folder, params, 'substeps', 'steps / frame', [1, 12, 1])
  addSlider(folder, params, 'drip', 'drip', [0, 0.3, 0.005])
  addSlider(folder, params, 'dripThreshold', 'drip threshold', [0, 1.5, 0.01])
  addSlider(folder, params, 'absorb', 'absorption / s', [0, 0.2, 0.001])
  addSlider(folder, params, 'wetDecay', 'drying / s', [0, 1, 0.01])
  folder.addButton({ title: 'Dry the donut' }).on('click', handlers.onClearLiquid)
}

const addDonutFolder = (pane, params) => {
  const folder = pane.addFolder({ title: 'Donut', expanded: false })
  addSlider(folder, params, 'tiltX', 'tilt x°', [-180, 180, 1])
  addSlider(folder, params, 'tiltZ', 'tilt z°', [-180, 180, 1])
  folder.addBinding(params, 'tumble', { label: 'tumble' })
  addSlider(folder, params, 'tumbleSpeed', 'tumble speed', [0.05, 2, 0.05])
  folder.addBinding(params, 'doughColor', { label: 'dough' })
  folder.addBinding(params, 'liquidColor', { label: 'liquid' })
  addSlider(folder, params, 'liquidOpacity', 'liquid opacity', [0, 1, 0.01])
  addSlider(folder, params, 'filmThickness', 'film thickness', [0.02, 1, 0.01])
  addSlider(folder, params, 'bumpStrength', 'liquid bump', [0, 0.2, 0.002])
}

const addOctreeFolder = (pane, params, handlers) => {
  const folder = pane.addFolder({ title: 'Octree (37.2)', expanded: false })
  folder
    .addBinding(params, 'depth', { label: 'resolution', options: DEPTH_OPTIONS })
    .on('change', handlers.onDepthChange)
  folder.addBinding(params, 'trilinear', { label: 'trilinear (8 lookups)' })
  folder
    .addBinding(params, 'wireframeLevel', { label: 'grid level', min: -1, max: 7, step: 1 })
    .on('change', handlers.onWireframeChange)
  folder.addBinding(params, 'view', { label: 'show', options: VIEW_OPTIONS })
}

const addExportFolder = (pane, params, handlers) => {
  const folder = pane.addFolder({ title: 'Texture export (37.3)' })
  folder.addBinding(params, 'bakeWidth', { label: 'size', options: BAKE_OPTIONS })
  folder.addButton({ title: 'Bake to 2D texture' }).on('click', () => handlers.onBake(false))
  folder.addButton({ title: 'Bake + download PNG' }).on('click', () => handlers.onBake(true))
}

const addStatsFolder = (pane, stats) => {
  const folder = pane.addFolder({ title: 'Stats' })
  const fpsGraph = folder.addBlade({ view: 'fpsgraph', label: 'fps', rows: 2 })
  folder.addBinding(stats, 'nodes', { label: 'grids', readonly: true, format: (v) => v.toFixed(0) })
  folder.addBinding(stats, 'leaves', { label: 'leaves', readonly: true, format: (v) => v.toFixed(0) })
  folder.addBinding(stats, 'mapSize', { label: 'leaf maps', readonly: true })
  folder.addBinding(stats, 'gpuBytes', { label: 'gpu memory', readonly: true, format: megabytes })
  folder.addBinding(stats, 'bakeMs', { label: 'bake ms', readonly: true, format: (v) => v.toFixed(0) })
  return fpsGraph
}

// Stats sit in their own folder: read-only monitors emit 'change' on every refresh.
export const createTexturesPane = ({ params, stats, handlers }) => {
  const pane = new Pane({ title: 'Octree Textures (GPU Gems 2 · 37)' })
  pane.registerPlugin(EssentialsPlugin)
  addToolFolder(pane, params, handlers)
  addRainFolder(pane, params)
  addFlowFolder(pane, params, handlers)
  addDonutFolder(pane, params)
  addOctreeFolder(pane, params, handlers)
  addExportFolder(pane, params, handlers)
  const fpsGraph = addStatsFolder(pane, stats)
  return { pane, fpsGraph }
}
