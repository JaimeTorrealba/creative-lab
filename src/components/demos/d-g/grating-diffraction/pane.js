import { Pane } from 'tweakpane'

// Track pitch is what separates the formats: tighter tracks push the rainbow to grazing angles
export const DISC_PRESETS = {
  'CD (aluminium)': { pitch: 1600, tint: '#d9dde3' },
  'CD-R (gold)': { pitch: 1600, tint: '#e3c16f' },
  'CD-R (azo blue)': { pitch: 1600, tint: '#6f8ee0' },
  DVD: { pitch: 740, tint: '#d4d8de' },
  'Blu-ray': { pitch: 320, tint: '#c9ced6' }
}

const toListOptions = (names) => Object.fromEntries(names.map((name) => [name, name]))

const addDiscFolder = (pane, uniforms, params) => {
  const folder = pane.addFolder({ title: 'Disc' })
  const applyPreset = (name) => {
    const preset = DISC_PRESETS[name]
    uniforms.pitch.value = preset.pitch
    params.tint = preset.tint
    uniforms.tint.value.set(preset.tint)
    pane.refresh()
  }
  folder
    .addBinding(params, 'preset', { options: toListOptions(Object.keys(DISC_PRESETS)) })
    .on('change', ({ value }) => applyPreset(value))
  folder
    .addBinding(params, 'tint', { label: 'reflector' })
    .on('change', ({ value }) => uniforms.tint.value.set(value))
  folder.addBinding(uniforms.dataEnd, 'value', {
    label: 'data end',
    min: 0.5,
    max: 1.18,
    step: 0.01
  })
}

const addGratingFolder = (pane, uniforms) => {
  const folder = pane.addFolder({ title: 'Grating' })
  folder.addBinding(uniforms.pitch, 'value', { label: 'pitch (nm)', min: 200, max: 3000, step: 10 })
  folder.addBinding(uniforms.orders, 'value', { label: 'orders', min: 1, max: 4, step: 1 })
  folder.addBinding(uniforms.spread, 'value', { label: 'spread', min: 0.01, max: 0.4, step: 0.005 })
  folder.addBinding(uniforms.intensity, 'value', { label: 'intensity', min: 0, max: 5, step: 0.05 })
}

const addLightFolder = (pane, params, onLightColorChange) => {
  const folder = pane.addFolder({ title: 'Light' })
  folder.addBinding(params, 'orbitLight', { label: 'orbit' })
  folder.addBinding(params, 'orbitSpeed', { label: 'speed', min: 0, max: 2, step: 0.01 })
  folder.addBinding(params, 'orbitRadius', { label: 'radius', min: 0.2, max: 2.5, step: 0.01 })
  folder
    .addBinding(params, 'lightColor', { label: 'color' })
    .on('change', ({ value }) => onLightColorChange(value))
}

const addMotionFolder = (pane, params) => {
  const folder = pane.addFolder({ title: 'Motion' })
  folder.addBinding(params, 'wobble')
  folder.addBinding(params, 'spinSpeed', { label: 'spin', min: 0, max: 3, step: 0.01 })
}

export const createGratingPane = ({ uniforms, params, onLightColorChange }) => {
  const pane = new Pane({ title: 'Grating Diffraction' })
  addDiscFolder(pane, uniforms, params)
  addGratingFolder(pane, uniforms)
  addLightFolder(pane, params, onLightColorChange)
  addMotionFolder(pane, params)
  return pane
}
