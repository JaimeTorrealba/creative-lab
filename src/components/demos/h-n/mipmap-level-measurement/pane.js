import { Pane } from 'tweakpane'
import { CHUNK_COUNT, MEASURED_LEVELS, REFERENCE_SLOT } from './constants'
import { getFirstVisibleLevel } from './streaming'

const LEVEL_KEYS = Array.from({ length: MEASURED_LEVELS }, (_, level) => `level ${level}`)

const createEmptyStats = () => ({
  memory: { 'full chains': '-', resident: '-', saved: '-' },
  chunksPerLevel: Object.fromEntries(LEVEL_KEYS.map((key) => [key, 0])),
  selection: {
    chunk: 'click a chunk',
    reference: '-',
    ...Object.fromEntries(LEVEL_KEYS.map((key) => [key, '-'])),
    'first level': '-'
  }
})

const formatMegabytes = (bytes) => `${(bytes / 1024 / 1024).toFixed(2)} MB`

const formatShare = (count, reference) =>
  reference === 0 ? '0 (0%)' : `${count} (${((count / reference) * 100).toFixed(1)}%)`

const addMonitors = (folder, target) => {
  Object.keys(target).forEach((key) => folder.addBinding(target, key, { readonly: true }))
}

const addSettingsFolder = (pane, params, callbacks) => {
  const folder = pane.addFolder({ title: 'Measurement' })
  folder
    .addBinding(params, 'threshold', { min: 0, max: 0.5, step: 0.01 })
    .on('change', callbacks.onThresholdChange)
  folder.addBinding(params, 'chunksPerCycle', {
    label: 'chunks / cycle',
    min: 1,
    max: CHUNK_COUNT,
    step: 1
  })
  folder
    .addBinding(params, 'calibrationView', { label: 'calibration view' })
    .on('change', ({ value }) => callbacks.onCalibrationViewChange(value))
}

export const createMeasurementPane = ({ params, isWebGPU, ...callbacks }) => {
  const pane = new Pane({ title: 'Mipmap Level Measurement' })
  const stats = createEmptyStats()
  if (!isWebGPU) {
    const warning = { status: 'WebGPU required (atomic counters)' }
    pane.addBinding(warning, 'status', { readonly: true })
  }
  addSettingsFolder(pane, params, callbacks)
  addMonitors(pane.addFolder({ title: 'Texture memory' }), stats.memory)
  addMonitors(pane.addFolder({ title: 'Chunks per first level' }), stats.chunksPerLevel)
  addMonitors(pane.addFolder({ title: 'Selected chunk' }), stats.selection)
  return { pane, stats }
}

const refreshMemoryStats = (memory, terrain) => {
  const fullChainBytes = terrain.getFullChainBytes()
  const residentBytes = terrain.getResidentBytes()
  memory['full chains'] = formatMegabytes(fullChainBytes)
  memory.resident = formatMegabytes(residentBytes)
  memory.saved = `${((1 - residentBytes / fullChainBytes) * 100).toFixed(1)}%`
}

const refreshLevelStats = (chunksPerLevel, terrain) => {
  LEVEL_KEYS.forEach((key) => (chunksPerLevel[key] = 0))
  terrain.chunks.forEach((chunk) => (chunksPerLevel[LEVEL_KEYS[chunk.firstLevel]] += 1))
}

const refreshSelectionStats = (selection, counts, chunkIndex, threshold) => {
  selection.chunk = `#${chunkIndex}`
  if (!counts) return
  const reference = counts[REFERENCE_SLOT]
  selection.reference = `${reference}`
  LEVEL_KEYS.forEach((key, level) => (selection[key] = formatShare(counts[level], reference)))
  selection['first level'] = `${getFirstVisibleLevel(counts, threshold)}`
}

export const refreshMeasurementStats = ({ stats, terrain, streaming, params, chunkIndex }) => {
  refreshMemoryStats(stats.memory, terrain)
  refreshLevelStats(stats.chunksPerLevel, terrain)
  if (chunkIndex === null) return
  const counts = streaming.getChunkCounts(chunkIndex)
  refreshSelectionStats(stats.selection, counts, chunkIndex, params.threshold)
}
