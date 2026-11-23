import {
  BufferAttribute,
  DataTexture,
  FloatType,
  Matrix3,
  NearestFilter,
  RGBAFormat,
  Vector3
} from 'three'

// The chapter's first pass keeps its rough solution as vertex colours on a finely tessellated
// mesh. Every vertex of the box becomes one texel here, so the gather shader that runs over
// the camera's visible points can also run over the mesh vertices.

const createPointTexture = (data, side) => {
  const texture = new DataTexture(data, side, side, RGBAFormat, FloatType)
  texture.minFilter = NearestFilter
  texture.magFilter = NearestFilter
  texture.needsUpdate = true
  return texture
}

const assignPointUvs = (mesh, start, side) => {
  const count = mesh.geometry.getAttribute('position').count
  const uvs = new Float32Array(count * 2)
  for (let i = 0; i < count; i++) {
    const index = start + i
    uvs[i * 2] = ((index % side) + 0.5) / side
    uvs[i * 2 + 1] = (Math.floor(index / side) + 0.5) / side
  }
  mesh.geometry.setAttribute('pointUv', new BufferAttribute(uvs, 2))
  return count
}

const writeMeshPoints = ({ mesh, start }, positions, normals, isBuried) => {
  const position = mesh.geometry.getAttribute('position')
  const normal = mesh.geometry.getAttribute('normal')
  const normalMatrix = new Matrix3().getNormalMatrix(mesh.matrixWorld)
  const point = new Vector3()
  const direction = new Vector3()

  for (let i = 0; i < position.count; i++) {
    point.fromBufferAttribute(position, i).applyMatrix4(mesh.matrixWorld)
    direction.fromBufferAttribute(normal, i).applyMatrix3(normalMatrix).normalize()
    const offset = (start + i) * 4
    positions.set([point.x, point.y, point.z, isBuried(point) ? 0 : 1], offset)
    normals.set([direction.x, direction.y, direction.z, 1], offset)
  }
}

export const createPointSet = (meshes, isBuried = () => false) => {
  const total = meshes.reduce((sum, mesh) => sum + mesh.geometry.getAttribute('position').count, 0)
  const side = Math.ceil(Math.sqrt(total))

  let cursor = 0
  const ranges = meshes.map((mesh) => {
    const start = cursor
    cursor += assignPointUvs(mesh, start, side)
    return { mesh, start }
  })

  const positions = new Float32Array(side * side * 4)
  const normals = new Float32Array(side * side * 4)
  const positionTexture = createPointTexture(positions, side)
  const normalTexture = createPointTexture(normals, side)

  meshes.forEach((mesh) => mesh.updateMatrixWorld())
  ranges.forEach((range) => writeMeshPoints(range, positions, normals, isBuried))

  const dynamicRanges = ranges.filter(({ mesh }) => mesh.userData.dynamic)

  const refreshDynamic = () => {
    dynamicRanges.forEach((range) => writeMeshPoints(range, positions, normals, isBuried))
    positionTexture.needsUpdate = true
    normalTexture.needsUpdate = true
  }

  const dispose = () => {
    positionTexture.dispose()
    normalTexture.dispose()
  }

  return { side, count: total, positionTexture, normalTexture, refreshDynamic, dispose }
}
