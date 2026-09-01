import {
  BufferAttribute,
  BufferGeometry,
  DataTexture,
  FloatType,
  Matrix4,
  NearestFilter,
  RGBAFormat,
  Sphere,
  Vector3
} from 'three'
import { mergeGeometries, mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js'

// GLTF exporters split a vertex at every uv and normal seam. Left alone that hands the solver a pile
// of coincident disks, and a pair at r -> 0 shadows itself into a black speck, so the model is welded
// on position first. The chapter represents one element per surface point, not per vertex stream entry.
const WELD_TOLERANCE = 1e-3

// Flattens every mesh under root into a single welded geometry in root-local space, so the whole
// model is one rigid body that the transform pass can move with a single matrix.
export const flattenModel = (root) => {
  root.updateMatrixWorld(true)
  const toLocal = new Matrix4().copy(root.matrixWorld).invert()
  const parts = []

  root.traverse((child) => {
    if (!child.isMesh || !child.geometry?.attributes.position) return
    const part = child.geometry.index ? child.geometry.toNonIndexed() : child.geometry.clone()
    for (const name of Object.keys(part.attributes)) {
      if (name !== 'position') part.deleteAttribute(name)
    }
    // Blend shapes survive both clone() and toNonIndexed(), and mergeGeometries refuses any set of
    // parts whose morph targets disagree — which is every rigged GLTF, since the exporter only puts
    // them on the primitives that need them. The solve wants the bind-pose surface, so they go.
    part.morphAttributes = {}
    part.morphTargetsRelative = false
    part.clearGroups()
    part.applyMatrix4(new Matrix4().multiplyMatrices(toLocal, child.matrixWorld))
    parts.push(part)
  })

  if (!parts.length) return null

  const merged = parts.length === 1 ? parts[0] : mergeGeometries(parts)
  if (parts.length > 1) parts.forEach((part) => part.dispose())
  if (!merged) return null

  const welded = mergeVertices(merged, WELD_TOLERANCE)
  if (welded !== merged) merged.dispose()
  welded.computeVertexNormals()
  welded.center()
  return welded
}

// Element area is a third of every triangle sharing the vertex, straight out of section 14.2.
const accumulateAreas = (geometry) => {
  const position = geometry.attributes.position
  const index = geometry.index
  const areas = new Float32Array(position.count)
  const a = new Vector3()
  const b = new Vector3()
  const c = new Vector3()
  const triangles = index ? index.count / 3 : position.count / 3

  for (let t = 0; t < triangles; t++) {
    const o = t * 3
    const i0 = index ? index.getX(o) : o
    const i1 = index ? index.getX(o + 1) : o + 1
    const i2 = index ? index.getX(o + 2) : o + 2

    a.fromBufferAttribute(position, i0)
    b.fromBufferAttribute(position, i1).sub(a)
    c.fromBufferAttribute(position, i2).sub(a)

    const third = b.cross(c).length() / 6
    areas[i0] += third
    areas[i1] += third
    areas[i2] += third
  }

  return areas
}

const spread = (value) => {
  let n = value & 0x3ff
  n = (n ^ (n << 16)) & 0xff0000ff
  n = (n ^ (n << 8)) & 0x0300f00f
  n = (n ^ (n << 4)) & 0x030c30c3
  n = (n ^ (n << 2)) & 0x09249249
  return n
}

// A cluster is a contiguous run of texels, so the shader walks its children as an index range with no
// indirection table. Morton order is what makes a contiguous run also a tight blob in space, which is
// the only reason a single parent disk can stand in for one.
const mortonOrder = (geometry) => {
  geometry.computeBoundingBox()
  const box = geometry.boundingBox
  const size = new Vector3().subVectors(box.max, box.min)
  const scale = new Vector3(
    size.x > 1e-6 ? 1023 / size.x : 0,
    size.y > 1e-6 ? 1023 / size.y : 0,
    size.z > 1e-6 ? 1023 / size.z : 0
  )

  const position = geometry.attributes.position
  const codes = new Uint32Array(position.count)
  const p = new Vector3()

  for (let i = 0; i < position.count; i++) {
    p.fromBufferAttribute(position, i).sub(box.min)
    codes[i] =
      spread(Math.round(p.x * scale.x)) |
      (spread(Math.round(p.y * scale.y)) << 1) |
      (spread(Math.round(p.z * scale.z)) << 2)
  }

  const order = new Array(position.count)
  for (let i = 0; i < order.length; i++) order[i] = i
  order.sort((a, b) => codes[a] - codes[b])
  return order
}

const createDataTexture = (data, size) => {
  const texture = new DataTexture(data, size, size, RGBAFormat, FloatType)
  texture.minFilter = NearestFilter
  texture.magFilter = NearestFilter
  texture.generateMipmaps = false
  texture.needsUpdate = true
  return texture
}

// A point cloud that reads its position out of the element texture, for the debug view that shows the
// disks themselves rather than what they do.
export const createSurfelGeometry = (side, padded) => {
  const geometry = new BufferGeometry()
  const uv = new Float32Array(padded * 2)

  for (let i = 0; i < padded; i++) {
    uv[i * 2] = ((i % side) + 0.5) / side
    uv[i * 2 + 1] = (Math.floor(i / side) + 0.5) / side
  }

  geometry.setAttribute('position', new BufferAttribute(new Float32Array(padded * 3), 3))
  geometry.setAttribute('aSurfelUv', new BufferAttribute(uv, 2))
  // Every point is placed by the vertex shader, so the CPU-side bounds carry no information and are
  // only here to keep the frustum culler from dropping the whole cloud.
  geometry.boundingSphere = new Sphere(new Vector3(), 1e4)
  return geometry
}

// objects: [{ geometry }] in object-id order. Each geometry gains an aSurfelUv attribute pointing at
// its own element, and is expected to be rendered under a single rigid transform.
export const buildElements = (objects, clusterSize) => {
  const layout = objects.map((object) => {
    const count = object.geometry.attributes.position.count
    const clusters = Math.ceil(count / clusterSize)
    return { object, count, clusters, slots: clusters * clusterSize }
  })

  const padded = layout.reduce((sum, entry) => sum + entry.slots, 0)
  const clusterCount = layout.reduce((sum, entry) => sum + entry.clusters, 0)
  const count = layout.reduce((sum, entry) => sum + entry.count, 0)
  const side = Math.max(1, Math.ceil(Math.sqrt(padded)))
  const parentSide = Math.max(1, Math.ceil(Math.sqrt(clusterCount)))

  const posData = new Float32Array(side * side * 4)
  const nrmData = new Float32Array(side * side * 4)
  const parentPosData = new Float32Array(parentSide * parentSide * 4)
  const parentNrmData = new Float32Array(parentSide * parentSide * 4)

  const center = new Vector3()
  const axis = new Vector3()
  const tmp = new Vector3()

  let base = 0
  let clusterBase = 0

  layout.forEach(({ object, count: objectCount, clusters, slots }, objectId) => {
    const geometry = object.geometry
    const position = geometry.attributes.position
    const normal = geometry.attributes.normal
    const areas = accumulateAreas(geometry)
    const order = mortonOrder(geometry)
    const surfelUv = new Float32Array(objectCount * 2)

    for (let rank = 0; rank < objectCount; rank++) {
      const vertex = order[rank]
      const element = base + rank
      const o = element * 4

      posData[o] = position.getX(vertex)
      posData[o + 1] = position.getY(vertex)
      posData[o + 2] = position.getZ(vertex)
      posData[o + 3] = areas[vertex]

      nrmData[o] = normal.getX(vertex)
      nrmData[o + 1] = normal.getY(vertex)
      nrmData[o + 2] = normal.getZ(vertex)
      nrmData[o + 3] = objectId

      surfelUv[vertex * 2] = ((element % side) + 0.5) / side
      surfelUv[vertex * 2 + 1] = (Math.floor(element / side) + 0.5) / side
    }

    geometry.setAttribute('aSurfelUv', new BufferAttribute(surfelUv, 2))

    // Slots past objectCount are padding, marked with a negative object id. Area alone would not
    // identify them: a vertex the index never references also ends up with zero area, and that one
    // is a real receiver that still needs its accessibility solved.
    for (let rank = objectCount; rank < slots; rank++) {
      nrmData[(base + rank) * 4 + 3] = -1
    }

    for (let c = 0; c < clusters; c++) {
      const first = c * clusterSize
      const last = Math.min(first + clusterSize, objectCount)

      let area = 0
      center.set(0, 0, 0)
      axis.set(0, 0, 0)

      for (let rank = first; rank < last; rank++) {
        const vertex = order[rank]
        const weight = areas[vertex]
        area += weight
        center.addScaledVector(tmp.fromBufferAttribute(position, vertex), weight)
        axis.addScaledVector(tmp.fromBufferAttribute(normal, vertex), weight)
      }

      if (area > 0) center.divideScalar(area)
      // A cluster wrapping a thin sheet can cancel its own normals out; fall back to a member normal.
      if (axis.lengthSq() < 1e-12) axis.fromBufferAttribute(normal, order[first])
      axis.normalize()

      let radius = 0
      for (let rank = first; rank < last; rank++) {
        const vertex = order[rank]
        const reach =
          tmp.fromBufferAttribute(position, vertex).distanceTo(center) +
          Math.sqrt(areas[vertex] / Math.PI)
        if (reach > radius) radius = reach
      }

      const o = (clusterBase + c) * 4
      parentPosData[o] = center.x
      parentPosData[o + 1] = center.y
      parentPosData[o + 2] = center.z
      parentPosData[o + 3] = area

      parentNrmData[o] = axis.x
      parentNrmData[o + 1] = axis.y
      parentNrmData[o + 2] = axis.z
      parentNrmData[o + 3] = radius
    }

    base += slots
    clusterBase += clusters
  })

  const basePos = createDataTexture(posData, side)
  const baseNrm = createDataTexture(nrmData, side)
  const parentBasePos = createDataTexture(parentPosData, parentSide)
  const parentBaseNrm = createDataTexture(parentNrmData, parentSide)

  return {
    count,
    padded,
    side,
    parentSide,
    clusterCount,
    clusterSize,
    basePos,
    baseNrm,
    parentBasePos,
    parentBaseNrm,
    dispose() {
      basePos.dispose()
      baseNrm.dispose()
      parentBasePos.dispose()
      parentBaseNrm.dispose()
    }
  }
}
