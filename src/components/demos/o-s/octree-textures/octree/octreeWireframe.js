import { BufferAttribute, BufferGeometry, LineBasicMaterial, LineSegments } from 'three'

const MAX_BOXES = 100000
const BOX_EDGES = [
  [0, 1], [2, 3], [4, 5], [6, 7],
  [0, 2], [1, 3], [4, 6], [5, 7],
  [0, 4], [1, 5], [2, 6], [3, 7]
]

const writeBoxEdges = (positions, start, [x, y, z], size) => {
  let cursor = start
  BOX_EDGES.forEach((edge) =>
    edge.forEach((corner) => {
      positions[cursor++] = x + (corner & 1) * size
      positions[cursor++] = y + ((corner >> 1) & 1) * size
      positions[cursor++] = z + (corner >> 2) * size
    })
  )
  return cursor
}

const collectNodesAtLevel = (tree, level) => {
  const nodeIds = []
  for (let nodeId = 0; nodeId < tree.nodeCount; nodeId++) {
    if (tree.nodeLevels[nodeId] === level) nodeIds.push(nodeId)
  }
  return nodeIds
}

// Outlines the indirection grids of one tree level, drawn in object space (the octree frame is
// undone with the inverse scale/offset). Very deep levels are skipped past MAX_BOXES.
export const createOctreeWireframe = (color = '#ffffff') => {
  const geometry = new BufferGeometry()
  const material = new LineBasicMaterial({ color, transparent: true, opacity: 0.35, depthWrite: false })
  const lines = new LineSegments(geometry, material)
  lines.frustumCulled = false

  const showLevel = (tree, frame, level) => {
    const nodeIds = collectNodesAtLevel(tree, level).slice(0, MAX_BOXES)
    const positions = new Float32Array(nodeIds.length * BOX_EDGES.length * 2 * 3)
    const size = 2 ** -level / frame.scale
    let cursor = 0
    nodeIds.forEach((nodeId) => {
      const origin = [0, 1, 2].map(
        (axis) => (tree.nodeOrigins[nodeId * 3 + axis] - frame.offset.getComponent(axis)) / frame.scale
      )
      cursor = writeBoxEdges(positions, cursor, origin, size)
    })
    geometry.setAttribute('position', new BufferAttribute(positions, 3))
    geometry.computeBoundingSphere()
    return nodeIds.length
  }

  const dispose = () => {
    geometry.dispose()
    material.dispose()
  }

  return { lines, showLevel, dispose }
}
