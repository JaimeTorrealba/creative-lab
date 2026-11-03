import { BufferAttribute, BufferGeometry } from 'three'
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js'

const OVERLAY_ATTRIBUTES = ['position', 'skinIndex', 'skinWeight']
const WELD_TOLERANCE = 1e-4

const toPlainAttribute = (attribute) => {
  if (!attribute.isInterleavedBufferAttribute) return attribute
  const { count, itemSize, normalized } = attribute
  const array = new attribute.array.constructor(count * itemSize)
  const plain = new BufferAttribute(array, itemSize, normalized)
  for (let i = 0; i < count; i++) {
    for (let k = 0; k < itemSize; k++) plain.setComponent(i, k, attribute.getComponent(i, k))
  }
  return plain
}

// Hard edges (a box's faces, UV seams) duplicate vertices, so pushing the up-facing ones would
// just lift loose polygons. Dropping normals/UVs and welding lets the stretch pull real sheets.
export const createWeldedOverlayGeometry = (geometry) => {
  const stripped = new BufferGeometry()
  OVERLAY_ATTRIBUTES.forEach((name) => {
    const attribute = geometry.getAttribute(name)
    if (attribute) stripped.setAttribute(name, toPlainAttribute(attribute))
  })
  if (geometry.index) stripped.setIndex(geometry.index)

  const welded = mergeVertices(stripped, WELD_TOLERANCE)
  welded.computeVertexNormals()
  return welded
}
