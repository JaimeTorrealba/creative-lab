import { Pane } from 'tweakpane'
import { PARTICLE_COUNTS, SHAPES } from './constants'

const addParticlesFolder = (pane, params, { onRebuild, onColorChange }) => {
  const folder = pane.addFolder({ title: 'Particles' })
  const shapeOptions = Object.fromEntries(Object.keys(SHAPES).map((name) => [name, name]))

  folder
    .addBinding(params, 'shape', { label: 'shape', options: shapeOptions })
    .on('change', onRebuild)
  folder
    .addBinding(params, 'textureSize', { label: 'count', options: PARTICLE_COUNTS })
    .on('change', onRebuild)
  folder.addBinding(params, 'color', { label: 'color' }).on('change', onColorChange)
  folder.addBinding(params, 'size', { label: 'size', min: 1, max: 10, step: 0.1 })
  folder.addBinding(params, 'minAlpha', { label: 'min alpha', min: 0, max: 1, step: 0.01 })
  folder.addBinding(params, 'maxAlpha', { label: 'max alpha', min: 0, max: 1, step: 0.01 })
}

const addSimulationFolder = (pane, params, { onRebuild }) => {
  const folder = pane.addFolder({ title: 'GPGPU simulation' })

  folder.addBinding(params, 'force', { label: 'velocity keep', min: 0, max: 0.95, step: 0.01 })
  folder.addBinding(params, 'attraction', { label: 'attraction', min: 0, max: 0.1, step: 0.001 })
  folder.addBinding(params, 'mouseRadius', { label: 'mouse radius', min: 0, max: 0.5 })
  folder.addBinding(params, 'mouseStrength', { label: 'mouse push', min: 0, max: 0.05 })
  folder.addBinding(params, 'mouseDecay', { label: 'mouse decay', min: 0.5, max: 0.99 })
  folder.addButton({ title: 'Resample particles' }).on('click', onRebuild)
}

const addBloomFolder = (pane, bloom) => {
  const folder = pane.addFolder({ title: 'Motion bloom' })
  const direction = { x: { min: -5, max: 5 }, y: { min: -5, max: 5 } }

  folder.addBinding(bloom, 'threshold', { label: 'threshold', min: 0, max: 1 })
  folder.addBinding(bloom, 'strength', { label: 'strength', min: 0, max: 3 })
  folder.addBinding(bloom, 'radius', { label: 'radius', min: 0, max: 1 })
  folder.addBinding(bloom, 'directionX', { label: 'blur dir 1', ...direction })
  folder.addBinding(bloom, 'directionY', { label: 'blur dir 2', ...direction })
}

export const createDreamyParticlesPane = (params, bloom, handlers) => {
  const pane = new Pane({ title: 'Dreamy Particles' })

  addParticlesFolder(pane, params, handlers)
  addSimulationFolder(pane, params, handlers)
  addBloomFolder(pane, bloom)

  return pane
}
