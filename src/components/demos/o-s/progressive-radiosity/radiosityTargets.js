import {
  DataTexture,
  FloatType,
  HalfFloatType,
  NearestFilter,
  RGBAFormat,
  Vector3,
  WebGLRenderTarget
} from 'three'
import { MAX_SHOOTERS } from './shooterSelection'

const SHOOTER_ROWS = 4

export const createFloatTarget = (width, height, { count = 1, depth = false, type } = {}) =>
  new WebGLRenderTarget(width, height, {
    type: type ?? FloatType,
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

// Radiosity (accumulated) and residual (unshot) energy share one MRT, ping-ponged because the
// reconstruction pass reads the previous values of the texel it writes.
export const createSolutionTargets = (layout) => {
  const targets = [0, 1].map(() => createFloatTarget(layout.width, layout.height, { count: 2 }))
  let readIndex = 0
  return {
    read: () => targets[readIndex],
    write: () => targets[1 - readIndex],
    swap: () => (readIndex = 1 - readIndex),
    clear: (renderer) => targets.forEach((target) => clearTarget(renderer, target)),
    dispose: () => targets.forEach((target) => target.dispose())
  }
}

export const createShooterGrid = (layout) => {
  const { gridWidth, gridHeight } = layout
  return {
    target: createFloatTarget(gridWidth, gridHeight),
    pixels: new Float32Array(gridWidth * gridHeight * 4),
    width: gridWidth,
    height: gridHeight
  }
}

// One hemispherical item buffer per shooter of a batch, tiled into a single target. Half floats
// hold ids exactly up to 2048 and keep a 64-shooter, 512² batch near 130 MB.
export const createItemAtlas = (count, resolution) => {
  const columns = Math.ceil(Math.sqrt(count))
  const rows = Math.ceil(count / columns)
  const width = columns * resolution
  const height = rows * resolution
  const target = createFloatTarget(width, height, { depth: true, type: HalfFloatType })
  return { target, columns, resolution }
}

const createShooterSlot = () => ({
  position: new Vector3(),
  normal: new Vector3(),
  tangent: new Vector3(),
  bitangent: new Vector3(),
  tileX: 0,
  tileY: 0
})

export const createShooterBatch = () => {
  const data = new Float32Array(MAX_SHOOTERS * SHOOTER_ROWS * 4)
  const texture = new DataTexture(data, MAX_SHOOTERS, SHOOTER_ROWS, RGBAFormat, FloatType)
  texture.minFilter = NearestFilter
  texture.magFilter = NearestFilter
  return {
    data,
    texture,
    slots: Array.from({ length: MAX_SHOOTERS }, createShooterSlot),
    count: 0,
    dispose: () => texture.dispose()
  }
}

const writeTexel = (data, index, row, x, y, z, w) => {
  data.set([x, y, z, w], (row * MAX_SHOOTERS + index) * 4)
}

// Shooter k: centre + area, normal, tangent, then its grid cell and item-buffer tile.
export const writeShooters = ({ batch, selection, cells, polygons, itemAtlas }) => {
  const { data, slots } = batch
  const { columns, resolution } = itemAtlas
  for (let k = 0; k < selection.count; k++) {
    const cell = selection.indices[k]
    const polygon = polygons[cells.polygon[cell]]
    const slot = slots[k]
    slot.position
      .copy(polygon.origin)
      .addScaledVector(polygon.u, cells.s[cell])
      .addScaledVector(polygon.v, cells.t[cell])
    slot.normal.copy(polygon.normal)
    slot.tangent.copy(polygon.tangent)
    slot.bitangent.copy(polygon.bitangent)
    slot.tileX = (k % columns) * resolution
    slot.tileY = Math.floor(k / columns) * resolution

    const { position, normal, tangent } = slot
    writeTexel(data, k, 0, position.x, position.y, position.z, cells.area[cell])
    writeTexel(data, k, 1, normal.x, normal.y, normal.z, 0)
    writeTexel(data, k, 2, tangent.x, tangent.y, tangent.z, 0)
    writeTexel(data, k, 3, cells.gridX[cell], cells.gridY[cell], slot.tileX, slot.tileY)
  }
  batch.count = selection.count
  batch.texture.needsUpdate = true
}
