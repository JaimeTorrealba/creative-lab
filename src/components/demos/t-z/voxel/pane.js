import { Pane } from 'tweakpane'
import { VOXEL_MODELS } from './models'

const toModelOptions = () => Object.fromEntries(VOXEL_MODELS.map(({ name }, index) => [name, index]))

export const createVoxelPane = ({ params, onModelChange, onGridChange, onBoxChange }) => {
  const pane = new Pane({ title: 'Voxelizer' })
  pane
    .addBinding(params, 'modelIndex', { label: 'model', options: toModelOptions() })
    .on('change', ({ value }) => onModelChange(value))
  // Re-voxelizing raycasts every cell of every model, so only run it on slider release
  pane
    .addBinding(params, 'gridSize', { label: 'grid size', min: 0.2, max: 0.6, step: 0.01 })
    .on('change', ({ last }) => last && onGridChange())
  pane
    .addBinding(params, 'boxSize', { label: 'box size', min: 0.05, max: 0.6, step: 0.01 })
    .on('change', onBoxChange)
  pane
    .addBinding(params, 'boxRoundness', { label: 'roundness', min: 0.001, max: 0.3, step: 0.001 })
    .on('change', onBoxChange)
  return pane
}
