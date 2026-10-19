import { Pane } from 'tweakpane'

export const setupPane = (params, actions) => {
  const pane = new Pane({ title: 'Underwater Hair' })

  const hair = pane.addFolder({ title: 'Hair' })
  hair.addBinding(params, 'hairVisible', { label: 'visible' })
  hair.addBinding(params, 'rootColor', { label: 'root color' })
  hair.addBinding(params, 'tipColor', { label: 'tip color' })
  hair.addBinding(params, 'colorVariation', {
    label: 'color variation',
    min: 0,
    max: 0.6,
    step: 0.01
  })
  hair.addBinding(params, 'strandWidth', { label: 'width', min: 0.002, max: 0.05, step: 0.001 })
  hair.addBinding(params, 'tipTaper', { label: 'tip taper', min: 0, max: 1, step: 0.01 })
  hair.addBinding(params, 'roundness', { label: 'roundness', min: 0, max: 1.5, step: 0.01 })
  hair.addBinding(params, 'opacity', { label: 'opacity', min: 0.2, max: 1, step: 0.01 })
  hair.addBinding(params, 'curlAmount', { label: 'curl', min: 0, max: 0.6, step: 0.01 })
  hair.addBinding(params, 'curlFrequency', { label: 'curl freq', min: 0, max: 4, step: 0.01 })
  hair.addBinding(params, 'clumping', { label: 'clumping', min: 0, max: 1, step: 0.01 })

  const shading = pane.addFolder({ title: 'Shading', expanded: false })
  shading
    .addBinding(params, 'shadingModel', {
      label: 'model',
      options: { 'Scheuermann (2 lobes)': 0, 'Marschner (LUT)': 1 }
    })
    .on('change', actions.rebake)
  shading.addBinding(params, 'shine', { label: 'shine', min: 0, max: 4, step: 0.01 })
  shading.addBinding(params, 'specColor1', { label: 'primary spec' })
  shading.addBinding(params, 'specColor2', { label: 'secondary spec' })
  shading.addBinding(params, 'primaryShift', {
    label: 'primary shift',
    min: -0.5,
    max: 0.5,
    step: 0.01
  })
  shading.addBinding(params, 'secondaryShift', {
    label: 'secondary shift',
    min: -0.5,
    max: 0.5,
    step: 0.01
  })
  shading.addBinding(params, 'primaryExp', { label: 'primary width', min: 4, max: 256, step: 1 })
  shading.addBinding(params, 'secondaryExp', {
    label: 'secondary width',
    min: 2,
    max: 128,
    step: 1
  })
  shading.addBinding(params, 'diffuseWrap', { label: 'diffuse wrap', min: 0, max: 1, step: 0.01 })
  shading.addBinding(params, 'rootShadow', { label: 'self shadow', min: 0, max: 1, step: 0.01 })
  shading.addBinding(params, 'ambient', { label: 'ambient', min: 0, max: 1, step: 0.01 })

  const light = pane.addFolder({ title: 'Light', expanded: false })
  light.addBinding(params, 'lightPos', {
    label: 'position',
    x: { min: -20, max: 20, step: 0.1 },
    y: { min: -20, max: 20, step: 0.1 },
    z: { min: -20, max: 20, step: 0.1 }
  })
  light.addBinding(params, 'lightColor', { label: 'color' })
  light.addBinding(params, 'lightIntensity', { label: 'intensity', min: 0, max: 3, step: 0.01 })

  const sim = pane.addFolder({ title: 'Simulation', expanded: false })
  sim.addBinding(params, 'pause', { label: 'pause' })
  sim.addBinding(params, 'buoyancy', { label: 'gravity', min: -60, max: 20, step: 0.5 })
  sim.addBinding(params, 'waterDrag', { label: 'water drag', min: 0, max: 0.2, step: 0.001 })
  sim.addBinding(params, 'stiffness', { label: 'stiffness', min: 0, max: 0.6, step: 0.01 })
  sim.addBinding(params, 'iterations', { label: 'iterations', min: 1, max: 12, step: 1 })
  sim.addBinding(params, 'currentStrength', { label: 'current', min: 0, max: 6, step: 0.05 })
  sim.addBinding(params, 'currentScale', { label: 'current scale', min: 0.02, max: 1, step: 0.01 })
  sim.addBinding(params, 'currentSpeed', { label: 'current speed', min: 0, max: 2, step: 0.01 })
  sim.addButton({ title: 'Reset hair' }).on('click', actions.resetHair)

  const water = pane.addFolder({ title: 'Water', expanded: false })
  water.addBinding(params, 'waterColor', { label: 'water color' })
  water.addBinding(params, 'deepColor', { label: 'deep color' })
  water.addBinding(params, 'waterDensity', { label: 'extinction', min: 0, max: 0.12, step: 0.001 })
  water.addBinding(params, 'fogDensity', { label: 'fog density', min: 0, max: 0.12, step: 0.001 })
  water.addBinding(params, 'causticIntensity', { label: 'caustics', min: 0, max: 2, step: 0.01 })
  water.addBinding(params, 'causticScale', {
    label: 'caustic scale',
    min: 0.02,
    max: 1,
    step: 0.01
  })
  water.addBinding(params, 'causticSpeed', { label: 'caustic speed', min: 0, max: 2, step: 0.01 })
  water.addBinding(params, 'shaftIntensity', {
    label: 'light shafts',
    min: 0,
    max: 1.5,
    step: 0.01
  })
  water.addBinding(params, 'backdropVisible', { label: 'backdrop' })
  water.addBinding(params, 'snowVisible', { label: 'marine snow' })

  const head = pane.addFolder({ title: 'Head', expanded: false })
  head.addBinding(params, 'headVisible', { label: 'visible' })
  head.addBinding(params, 'headColor', { label: 'color' })
  head.addBinding(params, 'headRoughness', { label: 'roughness', min: 0, max: 1, step: 0.01 })
  head.addButton({ title: 'Reset position' }).on('click', actions.resetHead)

  // Marschner LUT shape. Baking 2 x 128^2 is about a millisecond, so these rebake live.
  const marschner = pane.addFolder({ title: 'Marschner LUT', expanded: false })
  const rebake = { label: '', min: -40, max: 40, step: 0.5 }
  marschner.addBinding(params, 'absorption', { label: 'absorption' })
  marschner
    .addBinding(params, 'iorHair', { label: 'IOR', min: 1.1, max: 2, step: 0.01 })
    .on('change', actions.rebake)
  marschner
    .addBinding(params, 'glintAngle', { label: 'glint angle', min: 10, max: 60, step: 0.5 })
    .on('change', actions.rebake)
  marschner
    .addBinding(params, 'shiftR', { ...rebake, label: 'shift R' })
    .on('change', actions.rebake)
  marschner
    .addBinding(params, 'shiftTT', { ...rebake, label: 'shift TT' })
    .on('change', actions.rebake)
  marschner
    .addBinding(params, 'shiftTRT', { ...rebake, label: 'shift TRT' })
    .on('change', actions.rebake)
  marschner
    .addBinding(params, 'widthR', { label: 'width R', min: 1, max: 40, step: 0.5 })
    .on('change', actions.rebake)
  marschner
    .addBinding(params, 'widthTT', { label: 'width TT', min: 1, max: 40, step: 0.5 })
    .on('change', actions.rebake)
  marschner
    .addBinding(params, 'widthTRT', { label: 'width TRT', min: 1, max: 40, step: 0.5 })
    .on('change', actions.rebake)

  // Opacity shadow maps, the chapter's 16 light-space density slices.
  const shadow = pane.addFolder({ title: 'Self shadow', expanded: false })
  shadow.addBinding(params, 'shadowEnabled', { label: 'opacity maps' })
  shadow.addBinding(params, 'shadowStrength', { label: 'strength', min: 0, max: 20, step: 0.1 })
  shadow.addBinding(params, 'shadowOpacity', {
    label: 'strand density',
    min: 0.005,
    max: 0.3,
    step: 0.005
  })
  shadow.addBinding(params, 'shadowWidthScale', {
    label: 'map strand width',
    min: 1,
    max: 12,
    step: 0.5
  })
  shadow
    .addBinding(params, 'shadowSize', {
      label: 'resolution',
      options: { '256': 256, '512': 512, '1024': 1024 }
    })
    .on('change', actions.resizeShadow)

  // Anything that changes the particle or strand counts has to rebuild the buffers.
  const density = pane.addFolder({ title: 'Density', expanded: false })
  density
    .addBinding(params, 'primitive', {
      label: 'primitive',
      options: { 'Ribbons': 'ribbon', 'Lines (as the paper)': 'line' }
    })
    .on('change', actions.rebuild)
  density
    .addBinding(params, 'guideCount', { label: 'control hairs', min: 32, max: 320, step: 8 })
    .on('change', actions.rebuild)
  density
    .addBinding(params, 'renderStrands', {
      label: 'rendered hairs',
      min: 200,
      max: 6000,
      step: 100
    })
    .on('change', actions.rebuild)
  density
    .addBinding(params, 'segments', { label: 'sim segments', min: 8, max: 28, step: 1 })
    .on('change', actions.rebuild)
  density
    .addBinding(params, 'tessellation', { label: 'tessellation', min: 8, max: 64, step: 1 })
    .on('change', actions.rebuild)

  const debug = pane.addFolder({ title: 'Debug', expanded: false })
  debug.addBinding(params, 'showGuides', { label: 'control hairs' })
  debug.addBinding(params, 'wireframe', { label: 'wireframe' })

  return pane
}
