import { Vector3 } from 'three'

// 37.3: the mesh is scaled uniformly so its bounding box fits the unit cube [0,1]^3, the domain
// of the octree. `fill` < 1 leaves a margin so padded cells never fall outside the cube.
export const createOctreeFrame = (geometry, fill = 0.9) => {
  geometry.computeBoundingBox()
  const size = geometry.boundingBox.getSize(new Vector3())
  const center = geometry.boundingBox.getCenter(new Vector3())
  const scale = fill / Math.max(size.x, size.y, size.z)
  const offset = new Vector3(0.5, 0.5, 0.5).addScaledVector(center, -scale)

  const toOctreeSpace = (point, target = new Vector3()) =>
    target.copy(point).multiplyScalar(scale).add(offset)

  const toObjectSpace = (point, target = new Vector3()) =>
    target.copy(point).sub(offset).divideScalar(scale)

  return { scale, offset, toOctreeSpace, toObjectSpace }
}

const readVertex = (position, vertexIndex, frame, triangles, target) => {
  const scaled = (value, axis) => value * frame.scale + frame.offset.getComponent(axis)
  triangles[target] = scaled(position.getX(vertexIndex), 0)
  triangles[target + 1] = scaled(position.getY(vertexIndex), 1)
  triangles[target + 2] = scaled(position.getZ(vertexIndex), 2)
}

// Area-weighted face normal (un-normalised cross product), summed later per leaf.
const writeFaceNormal = (triangles, triangleId, faceNormals) => {
  const t = triangleId * 9
  const ax = triangles[t + 3] - triangles[t]
  const ay = triangles[t + 4] - triangles[t + 1]
  const az = triangles[t + 5] - triangles[t + 2]
  const bx = triangles[t + 6] - triangles[t]
  const by = triangles[t + 7] - triangles[t + 1]
  const bz = triangles[t + 8] - triangles[t + 2]
  faceNormals[triangleId * 3] = ay * bz - az * by
  faceNormals[triangleId * 3 + 1] = az * bx - ax * bz
  faceNormals[triangleId * 3 + 2] = ax * by - ay * bx
}

export const extractOctreeTriangles = (geometry, frame) => {
  const position = geometry.attributes.position
  const index = geometry.index
  const count = (index ? index.count : position.count) / 3
  const triangles = new Float32Array(count * 9)
  const faceNormals = new Float32Array(count * 3)
  for (let triangleId = 0; triangleId < count; triangleId++) {
    for (let corner = 0; corner < 3; corner++) {
      const slot = triangleId * 3 + corner
      const vertexIndex = index ? index.getX(slot) : slot
      readVertex(position, vertexIndex, frame, triangles, slot * 3)
    }
    writeFaceNormal(triangles, triangleId, faceNormals)
  }
  return { triangles, faceNormals, count }
}
