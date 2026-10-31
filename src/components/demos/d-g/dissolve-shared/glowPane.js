// Glow + spark controls shared by the three dissolve demos. Everything is a `{ value }` holder
// (plain uniform or TSL uniform), so the same bindings work for WebGL and WebGPU.
export const addGlowBindings = (pane, { glowColor, glowIntensity, particles }) => {
  const glow = pane.addFolder({ title: 'glow' })
  glow.addBinding(glowColor, 'value', { label: 'color', color: { type: 'float' } })
  glow.addBinding(glowIntensity, 'value', { label: 'intensity', min: 0, max: 12 })

  const sparks = pane.addFolder({ title: 'particles' })
  sparks.addBinding(particles.size, 'value', { label: 'size', min: 5, max: 80 })
  sparks.addBinding(particles.speed, 'value', { label: 'speed', min: 0.05, max: 2 })
  sparks.addBinding(particles.distance, 'value', { label: 'distance', min: 0.1, max: 2 })

  return glow
}
