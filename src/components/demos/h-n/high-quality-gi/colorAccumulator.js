import { Vector2 } from 'three'
import { getRadicalInverse } from './bundleDirections'
import { createFloatTarget } from './targets'

// Antialiasing as 38.5.2 describes it: jitter the near plane by a sub-pixel offset from a QMC
// sequence and average the resulting images. Averaging happens after tone mapping, so a bright
// emitter against a dark ceiling still resolves to a smooth edge instead of a hard bright one.

export const createColorAccumulator = ({ materials, quad }) => {
  const jitter = new Vector2()
  const state = { samples: 0, readIndex: 0 }
  let targets = []

  const reset = () => (state.samples = 0)

  const setSize = (width, height) => {
    targets.forEach((target) => target.dispose())
    targets = [createFloatTarget(width, height), createFloatTarget(width, height)]
    reset()
  }

  const getTargetSamples = (settings) => (settings.antialias ? settings.aaSamples : 1)

  const isConverged = (settings, changing) =>
    !changing && state.samples >= getTargetSamples(settings)

  // Offsets in pixels, in [-0.5, 0.5]. Halton (2, 3) covers the pixel evenly at every count.
  const getJitter = (settings) => {
    if (!settings.antialias) return jitter.set(0, 0)
    const index = (state.samples % 256) + 1
    return jitter.set(getRadicalInverse(index, 2) - 0.5, getRadicalInverse(index, 3) - 0.5)
  }

  // A running mean while nothing changes. While the scene moves or the GI is still converging,
  // the mean is floored to an exponential blend so new frames keep showing through.
  const getBlendWeight = (settings, changing) => {
    if (!settings.antialias) return 1
    const mean = 1 / (state.samples + 1)
    return changing ? Math.max(mean, 1 - settings.aaMovingBlend) : mean
  }

  const getPreviousTexture = () => targets[state.readIndex].texture
  const getNextTarget = () => targets[1 - state.readIndex]

  const commit = () => {
    state.readIndex = 1 - state.readIndex
    state.samples++
  }

  const present = (renderer) => {
    materials.present.uniforms.uColor.value = targets[state.readIndex].texture
    quad.material = materials.present
    renderer.setRenderTarget(null)
    quad.render(renderer)
  }

  const dispose = () => targets.forEach((target) => target.dispose())

  return {
    reset,
    setSize,
    isConverged,
    getJitter,
    getBlendWeight,
    getPreviousTexture,
    getNextTarget,
    commit,
    present,
    getSamples: () => state.samples,
    dispose
  }
}
