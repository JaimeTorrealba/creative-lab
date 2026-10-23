import { Pane } from 'tweakpane'
import { COMPOSITION } from './raycast'
import { PALETTES } from './palettes'

const toListOptions = (names) => Object.fromEntries(names.map((name) => [name, name]))

const addRenderingFolder = (pane, uniforms, params) => {
  const folder = pane.addFolder({ title: 'Rendering' })
  folder.addBinding(uniforms.composition, 'value', { label: 'composition', options: COMPOSITION })
  folder.addBinding(uniforms.samplingRate, 'value', {
    label: 'sampling rate',
    min: 0.1,
    max: 4,
    step: 0.1
  })
  folder.addBinding(uniforms.threshold, 'value', { label: 'threshold', min: 0, max: 1, step: 0.001 })
  folder.addBinding(uniforms.alphaScale, 'value', { label: 'alpha scale', min: 0, max: 2, step: 0.001 })
  folder.addBinding(params, 'shading', { label: 'iso shading' }).on('change', ({ value }) => {
    uniforms.shading.value = Number(value)
  })
}

const addColorFolder = (pane, uniforms, params, onPaletteChange) => {
  const folder = pane.addFolder({ title: 'Color' })
  folder
    .addBinding(params, 'palette', { options: toListOptions(Object.keys(PALETTES)) })
    .on('change', ({ value }) => onPaletteChange(value))
  folder.addBinding(params, 'invertColor', { label: 'invert color' }).on('change', ({ value }) => {
    uniforms.invertColor.value = Number(value)
  })
}

const addSceneFolder = (pane, params, onOutlineChange) => {
  const folder = pane.addFolder({ title: 'Scene' })
  folder.addBinding(params, 'autoRotate', { label: 'auto rotate' })
  folder.addBinding(params, 'rotationSpeed', { label: 'speed', min: 0, max: 2, step: 0.01 })
  folder
    .addBinding(params, 'showOutline', { label: 'outline' })
    .on('change', ({ value }) => onOutlineChange(value))
}

export const createVolumePane = ({ uniforms, params, onPaletteChange, onOutlineChange }) => {
  const pane = new Pane({ title: 'Pawpawsaurus' })
  addRenderingFolder(pane, uniforms, params)
  addColorFolder(pane, uniforms, params, onPaletteChange)
  addSceneFolder(pane, params, onOutlineChange)
  return pane
}
