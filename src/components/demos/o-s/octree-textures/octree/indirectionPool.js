import { Data3DTexture, NearestFilter, RGBAFormat, UnsignedByteType } from 'three'

// Alpha flags of 37.2: 1 = data, 0.5 = index of a child grid, 0 = empty.
const ALPHA_DATA = 255
const ALPHA_CHILD = 128
const MAX_GRIDS_PER_AXIS = 128

// Grids are packed in a box of S³ indirection grids (N = 2 cells each way, so 2S texels).
// 8-bit channels would allow 256 grids per axis, but WebGL2 only guarantees 256³ 3D textures.
const computePoolLayout = (nodeCount) => {
  const grids = Math.ceil(Math.cbrt(nodeCount))
  if (grids > MAX_GRIDS_PER_AXIS) throw new Error(`Octree too large: ${nodeCount} nodes`)
  return { grids, size: grids * 2 }
}

const createPoolTexture = (size) => {
  const texture = new Data3DTexture(new Uint8Array(size * size * size * 4), size, size, size)
  texture.format = RGBAFormat
  texture.type = UnsignedByteType
  texture.minFilter = NearestFilter
  texture.magFilter = NearestFilter
  texture.generateMipmaps = false
  texture.unpackAlignment = 1
  texture.needsUpdate = true
  return texture
}

// The indirection pool of 37.2: an 8-bit RGBA 3D texture, root grid at (0,0,0). Leaves hold a
// 24-bit index into the per-leaf maps (37.4) rather than a colour, so the pool never changes
// after the build and is uploaded once.
export const createIndirectionPool = (tree) => {
  const layout = computePoolLayout(tree.nodeCount)
  const texture = createPoolTexture(layout.size)
  const data = texture.image.data

  const gridOfNode = (nodeId) => [
    nodeId % layout.grids,
    Math.floor(nodeId / layout.grids) % layout.grids,
    Math.floor(nodeId / (layout.grids * layout.grids))
  ]

  const writeCell = (nodeId, cell, r, g, b, a) => {
    const [gx, gy, gz] = gridOfNode(nodeId)
    const x = gx * 2 + (cell & 1)
    const y = gy * 2 + ((cell >> 1) & 1)
    const z = gz * 2 + (cell >> 2)
    const offset = ((z * layout.size + y) * layout.size + x) * 4
    data[offset] = r
    data[offset + 1] = g
    data[offset + 2] = b
    data[offset + 3] = a
  }

  const writeChildPointers = () => {
    for (let slot = 0; slot < tree.children.length; slot++) {
      const link = tree.children[slot]
      if (link < 0) continue
      writeCell(Math.floor(slot / 8), slot % 8, ...gridOfNode(link), ALPHA_CHILD)
    }
  }

  const writeLeafIndices = () => {
    for (let leafId = 0; leafId < tree.leafCount; leafId++) {
      const slot = tree.leafCells[leafId]
      writeCell(Math.floor(slot / 8), slot % 8, leafId & 255, (leafId >> 8) & 255, (leafId >> 16) & 255, ALPHA_DATA)
    }
  }

  writeChildPointers()
  writeLeafIndices()

  return {
    texture,
    layout,
    byteLength: data.byteLength,
    upload: (renderer) => renderer.initTexture(texture),
    dispose: () => texture.dispose()
  }
}
