import { HITTABLE_LIST_CAPACITY } from '@/utils/rtweekend/hittable_list'

// WGSL storage layouts (in 4-byte words) of the structs in src/utils/rtweekend:
// hittable_list = { size: u32 (padded to 16 bytes), objects: array<sphere> }
// sphere (64 B)  = center xyz, radius, mat.kind (u32), pad×3, mat.albedo xyz, mat.fuzz,
//                  mat.refraction_index, pad×3
// bvh_node (32 B) = bbox x.min x.max y.min y.max z.min z.max, left (i32), right (i32)
const HITTABLE_LIST_HEADER_WORDS = 4
const SPHERE_WORDS = 16
const BVH_NODE_WORDS = 8

const packSphereAt = (floats, uints, base, { center, radius, mat }) => {
  floats.set(center, base)
  floats[base + 3] = radius
  uints[base + 4] = mat.kind
  floats.set(mat.albedo, base + 8)
  floats[base + 11] = mat.fuzz
  floats[base + 12] = mat.refraction_index
}

export const packHittableList = ({ objects }) => {
  if (objects.length > HITTABLE_LIST_CAPACITY) {
    throw new Error(`World has ${objects.length} spheres; capacity is ${HITTABLE_LIST_CAPACITY}`)
  }
  const buffer = new ArrayBuffer((HITTABLE_LIST_HEADER_WORDS + objects.length * SPHERE_WORDS) * 4)
  const floats = new Float32Array(buffer)
  const uints = new Uint32Array(buffer)
  uints[0] = objects.length
  objects.forEach((object, index) =>
    packSphereAt(floats, uints, HITTABLE_LIST_HEADER_WORDS + index * SPHERE_WORDS, object)
  )
  return buffer
}

// Flattens the tree depth-first (root = node 0). Children that are spheres are stored as
// ~index into `objects`, which is what bvh_node_hit() expects.
const flattenBvhNodes = (root, objects) => {
  const objectIndices = new Map(objects.map((object, index) => [object, index]))
  const nodes = []
  const flattenChild = (child) => {
    if (!('left' in child)) return ~objectIndices.get(child)
    const node = { bbox: child.bbox }
    const index = nodes.push(node) - 1
    node.left = flattenChild(child.left)
    node.right = flattenChild(child.right)
    return index
  }
  flattenChild(root)
  return nodes
}

export const packBvhNodes = (root, objects) => {
  const nodes = flattenBvhNodes(root, objects)
  const buffer = new ArrayBuffer(nodes.length * BVH_NODE_WORDS * 4)
  const floats = new Float32Array(buffer)
  const ints = new Int32Array(buffer)
  nodes.forEach(({ bbox, left, right }, index) => {
    const base = index * BVH_NODE_WORDS
    floats.set([bbox.x.min, bbox.x.max, bbox.y.min, bbox.y.max, bbox.z.min, bbox.z.max], base)
    ints[base + 6] = left
    ints[base + 7] = right
  })
  return buffer
}
