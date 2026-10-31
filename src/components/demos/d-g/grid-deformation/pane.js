import { Pane } from 'tweakpane'

const addSimulationFolder = (pane, params, onGridRebuild) => {
  const folder = pane.addFolder({ title: 'GPGPU grid' })

  folder
    .addBinding(params, 'cells', { label: 'cells', min: 4, max: 128, step: 1 })
    .on('change', onGridRebuild)
  folder.addBinding(params, 'smooth', { label: 'smooth cells' }).on('change', onGridRebuild)
  folder.addBinding(params, 'relaxation', { label: 'relaxation', min: 0.5, max: 0.995 })
  folder.addBinding(params, 'radius', { label: 'radius (cells)', min: 0, max: 15 })
  folder.addBinding(params, 'strength', { label: 'strength', min: 0, max: 1 })
  folder.addButton({ title: 'Reset grid' }).on('click', onGridRebuild)
}

const addImageFolder = (pane, params) => {
  const folder = pane.addFolder({ title: 'Image' })

  folder.addBinding(params, 'displacement', { label: 'displacement', min: 0, max: 0.05 })
  folder.addBinding(params, 'rgbShift', { label: 'rgb shift', min: 0, max: 0.01 })
  folder.addBinding(params, 'fill', { label: 'fill', min: 0.3, max: 1 })
  folder.addBinding(params, 'showGrid', { label: 'grid map' })
}

export const createGridDeformationPane = (params, { onGridRebuild }) => {
  const pane = new Pane({ title: 'Grid Deformation' })

  addSimulationFolder(pane, params, onGridRebuild)
  addImageFolder(pane, params)

  return pane
}
