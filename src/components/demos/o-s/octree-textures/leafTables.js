import { DataArrayTexture, FloatType, NearestFilter, RGBAFormat, Vector3 } from 'three'

export const NEIGHBOUR_COUNT = 26
const NEIGHBOUR_LAYERS = Math.ceil(NEIGHBOUR_COUNT / 4)
export const POSITION_LAYER = NEIGHBOUR_LAYERS
export const NORMAL_LAYER = NEIGHBOUR_LAYERS + 1
const LAYER_COUNT = NEIGHBOUR_LAYERS + 2

// Same order as neighbourOffset() in the simulation shaders: the 3×3×3 block minus its centre.
export const neighbourOffset = (k) => {
  const n = k < 13 ? k : k + 1
  return [(n % 3) - 1, (Math.floor(n / 3) % 3) - 1, Math.floor(n / 9) - 1]
}

const cellKey = (x, y, z, resolution) => x + resolution * (y + resolution * z)
const isInsideGrid = (x, y, z, resolution) =>
  x >= 0 && y >= 0 && z >= 0 && x < resolution && y < resolution && z < resolution

const findNeighbourLeaf = (lookup, x, y, z, resolution) =>
  isInsideGrid(x, y, z, resolution) ? lookup.get(cellKey(x, y, z, resolution)) ?? -1 : -1

const createLeafLookup = (tree) => {
  const lookup = new Map()
  for (let leafId = 0; leafId < tree.leafCount; leafId++) {
    const [x, y, z] = tree.leafCoords.subarray(leafId * 3, leafId * 3 + 3)
    lookup.set(cellKey(x, y, z, tree.resolution), leafId)
  }
  return lookup
}

const writeNeighbours = (data, layerStride, tree, lookup) => {
  const { resolution, leafCoords } = tree
  for (let leafId = 0; leafId < tree.leafCount; leafId++) {
    for (let k = 0; k < NEIGHBOUR_COUNT; k++) {
      const [dx, dy, dz] = neighbourOffset(k)
      const x = leafCoords[leafId * 3] + dx
      const y = leafCoords[leafId * 3 + 1] + dy
      const z = leafCoords[leafId * 3 + 2] + dz
      data[Math.floor(k / 4) * layerStride + leafId * 4 + (k % 4)] = findNeighbourLeaf(lookup, x, y, z, resolution)
    }
  }
}

const writePositionsAndNormals = (data, layerStride, tree, frame) => {
  const center = new Vector3()
  for (let leafId = 0; leafId < tree.leafCount; leafId++) {
    center.fromArray(tree.leafCoords, leafId * 3).addScalar(0.5).divideScalar(tree.resolution)
    frame.toObjectSpace(center, center)
    const positionSlot = POSITION_LAYER * layerStride + leafId * 4
    const normalSlot = NORMAL_LAYER * layerStride + leafId * 4
    data.set([center.x, center.y, center.z, 1], positionSlot)
    data.set([...tree.leafNormals.subarray(leafId * 3, leafId * 3 + 3), 1], normalSlot)
  }
}

const createTableTexture = (data, width, height) => {
  const texture = new DataArrayTexture(data, width, height, LAYER_COUNT)
  texture.format = RGBAFormat
  texture.type = FloatType
  texture.minFilter = NearestFilter
  texture.magFilter = NearestFilter
  texture.generateMipmaps = false
  texture.needsUpdate = true
  return texture
}

// 37.4: the liquid lives in a 2D density map with one texel per leaf, and "neighbour textures"
// give, for every leaf, the texel of each of its neighbours. Here the 26 neighbours are packed
// four per layer of one float array texture, followed by a position layer and a normal layer.
// Missing neighbours are -1, and texels past the last leaf keep w = 0.
export const createLeafTables = (tree, frame) => {
  const width = Math.ceil(Math.sqrt(tree.leafCount))
  const height = Math.ceil(tree.leafCount / width)
  const layerStride = width * height * 4
  const data = new Float32Array(layerStride * LAYER_COUNT)
  data.fill(-1, 0, NEIGHBOUR_LAYERS * layerStride)
  writeNeighbours(data, layerStride, tree, createLeafLookup(tree))
  writePositionsAndNormals(data, layerStride, tree, frame)

  const positions = data.subarray(POSITION_LAYER * layerStride, (POSITION_LAYER + 1) * layerStride)
  const normals = data.subarray(NORMAL_LAYER * layerStride, (NORMAL_LAYER + 1) * layerStride)

  const texture = createTableTexture(data, width, height)

  return {
    width,
    height,
    texture,
    positions,
    normals,
    byteLength: data.byteLength,
    dispose: () => texture.dispose()
  }
}
