import { triangleOverlapsBox } from './triangleBoxOverlap'

export const EMPTY_CELL = -1
export const encodeLeafLink = (leafId) => -leafId - 2
export const decodeLeafLink = (link) => -link - 2
export const isLeafLink = (link) => link <= -2

const cellOffset = (cell) => [cell & 1, (cell >> 1) & 1, cell >> 2]

const createTreeBuffers = () => ({
  children: [],
  nodeLevels: [],
  nodeOrigins: [],
  leafCoords: [],
  leafNormals: [],
  leafCells: []
})

const sumLeafNormal = (faceNormals, triangleIds) => {
  let x = 0
  let y = 0
  let z = 0
  triangleIds.forEach((id) => {
    x += faceNormals[id * 3]
    y += faceNormals[id * 3 + 1]
    z += faceNormals[id * 3 + 2]
  })
  const length = Math.hypot(x, y, z)
  return length > 0 ? [x / length, y / length, z / length] : [0, 1, 0]
}

const isInsideUnitCube = ({ x, y, z }) => x >= 0 && y >= 0 && z >= 0 && x < 1 && y < 1 && z < 1

// Example 37-2, built once at a fixed painting depth: every child box touching a polygon is
// created, the others are left empty, and all leaves sit at the same depth. Boxes are enlarged by
// `padding` leaf cells (37.3, "Linear interpolation") so the 8 samples of trilinear filtering
// around any surface point are always stored in the tree.
export const buildSurfaceOctree = ({ triangles, faceNormals, count, depth, padding = 1 }) => {
  const resolution = 2 ** depth
  const pad = padding / resolution
  const buffers = createTreeBuffers()
  const center = new Float64Array(3)
  const half = new Float64Array(3)

  const overlappingTriangles = (triangleIds, x, y, z, size) => {
    half.fill(size / 2 + pad)
    center[0] = x + size / 2
    center[1] = y + size / 2
    center[2] = z + size / 2
    return triangleIds.filter((id) => triangleOverlapsBox(triangles, id, center, half))
  }

  const addLeaf = (nodeId, cell, x, y, z, triangleIds) => {
    const leafId = buffers.leafCells.length
    buffers.leafCells.push(nodeId * 8 + cell)
    buffers.leafCoords.push(Math.round(x * resolution), Math.round(y * resolution), Math.round(z * resolution))
    buffers.leafNormals.push(...sumLeafNormal(faceNormals, triangleIds))
    return encodeLeafLink(leafId)
  }

  const buildNode = (level, ox, oy, oz, triangleIds) => {
    const nodeId = buffers.nodeLevels.length
    buffers.nodeLevels.push(level)
    buffers.nodeOrigins.push(ox, oy, oz)
    const base = buffers.children.length
    for (let cell = 0; cell < 8; cell++) buffers.children.push(EMPTY_CELL)
    const size = 2 ** -(level + 1)
    for (let cell = 0; cell < 8; cell++) {
      const [cx, cy, cz] = cellOffset(cell)
      const [x, y, z] = [ox + cx * size, oy + cy * size, oz + cz * size]
      const subset = overlappingTriangles(triangleIds, x, y, z, size)
      if (!subset.length) continue
      buffers.children[base + cell] =
        level + 1 === depth
          ? addLeaf(nodeId, cell, x, y, z, subset)
          : buildNode(level + 1, x, y, z, subset)
    }
    return nodeId
  }

  buildNode(0, 0, 0, 0, Array.from({ length: count }, (_, id) => id))

  return {
    depth,
    resolution,
    nodeCount: buffers.nodeLevels.length,
    leafCount: buffers.leafCells.length,
    children: Int32Array.from(buffers.children),
    nodeLevels: Uint8Array.from(buffers.nodeLevels),
    nodeOrigins: Float32Array.from(buffers.nodeOrigins),
    leafCoords: Int32Array.from(buffers.leafCoords),
    leafNormals: Float32Array.from(buffers.leafNormals),
    leafCells: Int32Array.from(buffers.leafCells)
  }
}

const distanceToCell = (point, x, y, z, size) => {
  const dx = Math.max(x - point.x, 0, point.x - x - size)
  const dy = Math.max(y - point.y, 0, point.y - y - size)
  const dz = Math.max(z - point.z, 0, point.z - z - size)
  return Math.hypot(dx, dy, dz)
}

// The CPU copy of the tree (37.3, "brush"): walk only the cells the sphere touches and report
// every leaf whose centre lies inside it, with its distance to the centre.
export const forEachLeafInSphere = (tree, point, radius, visitLeaf) => {
  const leafHalf = 0.5 / tree.resolution
  const visitNode = (nodeId) => {
    const level = tree.nodeLevels[nodeId]
    const size = 2 ** -(level + 1)
    for (let cell = 0; cell < 8; cell++) {
      const link = tree.children[nodeId * 8 + cell]
      if (link === EMPTY_CELL) continue
      const [cx, cy, cz] = cellOffset(cell)
      const x = tree.nodeOrigins[nodeId * 3] + cx * size
      const y = tree.nodeOrigins[nodeId * 3 + 1] + cy * size
      const z = tree.nodeOrigins[nodeId * 3 + 2] + cz * size
      if (!isLeafLink(link)) {
        if (distanceToCell(point, x, y, z, size) <= radius) visitNode(link)
        continue
      }
      const distance = Math.hypot(x + leafHalf - point.x, y + leafHalf - point.y, z + leafHalf - point.z)
      if (distance <= radius) visitLeaf(decodeLeafLink(link), distance)
    }
  }
  visitNode(0)
}

// Descend from the root to the leaf holding `point` (in [0,1)^3); -1 if that cell is empty.
export const findLeafAtPoint = (tree, point) => {
  if (!isInsideUnitCube(point)) return -1
  let nodeId = 0
  for (let level = 0; level < tree.depth; level++) {
    const scale = 2 ** (level + 1)
    const cx = Math.floor(point.x * scale) & 1
    const cy = Math.floor(point.y * scale) & 1
    const cz = Math.floor(point.z * scale) & 1
    const link = tree.children[nodeId * 8 + cx + cy * 2 + cz * 4]
    if (link === EMPTY_CELL) return -1
    if (isLeafLink(link)) return decodeLeafLink(link)
    nodeId = link
  }
  return -1
}
