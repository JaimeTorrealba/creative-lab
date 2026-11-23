import { FloatType, NearestFilter, RGBAFormat, WebGLRenderTarget } from 'three'

export const createFloatTarget = (width, height, { depth = false, count = 1 } = {}) =>
  new WebGLRenderTarget(width, height, {
    type: FloatType,
    format: RGBAFormat,
    minFilter: NearestFilter,
    magFilter: NearestFilter,
    depthBuffer: depth,
    stencilBuffer: false,
    generateMipmaps: false,
    count
  })

export const clearTarget = (renderer, target) => {
  renderer.setRenderTarget(target)
  renderer.setClearColor(0x000000, 0)
  renderer.clear(true, true, false)
}

// A set of points that gathers through the bundles: the camera's visible pixels, or the mesh
// vertices of the first pass. `hits` is buffer E of 38.4 (nearest hit of the current bundle),
// `frame` sums this frame's bundles, and the two history targets ping-pong the running estimate.
export const createGatherSet = (width, height) => {
  const hits = createFloatTarget(width, height)
  const frame = createFloatTarget(width, height)
  const history = [createFloatTarget(width, height), createFloatTarget(width, height)]

  const set = {
    width,
    height,
    hits,
    frame,
    history,
    readIndex: 0,
    directions: 0,
    pendingReset: true,
    positions: null,
    normals: null
  }

  set.getHistory = () => history[set.readIndex]
  set.getNextHistory = () => history[1 - set.readIndex]
  set.swapHistory = () => (set.readIndex = 1 - set.readIndex)

  set.reset = () => {
    set.pendingReset = true
    set.directions = 0
  }

  set.dispose = () => [hits, frame, ...history].forEach((target) => target.dispose())

  return set
}
