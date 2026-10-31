import { Box3, BufferAttribute, BufferGeometry, Mesh, Vector3 } from 'three'
import { MeshSurfaceSampler } from 'three/addons/math/MeshSurfaceSampler.js'
import { EXCLUDED_MESHES } from './constants'

const isTriangleInside = (positions, offset, { minY, maxAbsX }) => {
  const centerX = (positions[offset] + positions[offset + 3] + positions[offset + 6]) / 3
  const centerY = (positions[offset + 1] + positions[offset + 4] + positions[offset + 7]) / 3
  return centerY >= minY && Math.abs(centerX) <= maxAbsX
}

const collectShapeTriangles = (model, shape) => {
  const triangles = []

  model.traverse((child) => {
    if (!child.isMesh || EXCLUDED_MESHES.includes(child.name)) return
    const positions = child.geometry.toNonIndexed().getAttribute('position').array

    for (let offset = 0; offset < positions.length; offset += 9) {
      if (isTriangleInside(positions, offset, shape)) {
        triangles.push(...positions.subarray(offset, offset + 9))
      }
    }
  })

  return new Float32Array(triangles)
}

// Bind-pose positions are used as-is (all avatar mesh nodes have identity transforms)
const centerToUnitHeight = (geometry) => {
  const box = new Box3().setFromBufferAttribute(geometry.getAttribute('position'))
  const center = box.getCenter(new Vector3())
  const height = box.max.y - box.min.y

  geometry.translate(-center.x, -center.y, -center.z)
  geometry.scale(1 / height, 1 / height, 1 / height)
}

export const createShapeGeometry = (model, shape) => {
  const geometry = new BufferGeometry()
  geometry.setAttribute('position', new BufferAttribute(collectShapeTriangles(model, shape), 3))
  centerToUnitHeight(geometry)
  geometry.computeVertexNormals()
  geometry.computeBoundingSphere()
  return geometry
}

const createParticleUvs = (textureSize) => {
  const uvs = new Float32Array(textureSize * textureSize * 2)

  for (let row = 0; row < textureSize; row++) {
    for (let column = 0; column < textureSize; column++) {
      const index = row * textureSize + column
      uvs[2 * index] = (column + 0.5) / textureSize
      uvs[2 * index + 1] = (row + 0.5) / textureSize
    }
  }

  return uvs
}

// Fills the RGBA float texture data with random surface points and returns the matching
// Points geometry; each particle's uv addresses its own texel in the simulation textures.
export const sampleShapeSurface = (shapeGeometry, textureSize, positionData) => {
  const sampler = new MeshSurfaceSampler(new Mesh(shapeGeometry)).build()
  const count = textureSize * textureSize
  const positions = new Float32Array(count * 3)
  const point = new Vector3()

  for (let index = 0; index < count; index++) {
    sampler.sample(point)
    point.toArray(positions, index * 3)
    point.toArray(positionData, index * 4)
    positionData[index * 4 + 3] = 1
  }

  const geometry = new BufferGeometry()
  geometry.setAttribute('position', new BufferAttribute(positions, 3))
  geometry.setAttribute('uv', new BufferAttribute(createParticleUvs(textureSize), 2))
  return geometry
}
