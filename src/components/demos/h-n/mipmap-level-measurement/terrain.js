import { BufferAttribute, BufferGeometry } from 'three/webgpu'
import {
  CHUNK_SEGMENTS,
  CHUNK_SIZE,
  CHUNKS_PER_SIDE,
  HEIGHT_SCALE,
  TERRAIN_SIZE,
  TILE_WORLD_SIZE
} from './constants'

const readHeightTexel = ({ data, width, height }, x, y) => {
  const clampedX = Math.min(Math.max(x, 0), width - 1)
  const clampedY = Math.min(Math.max(y, 0), height - 1)
  return data[(clampedY * width + clampedX) * 4] / 255
}

const sampleHeightBilinear = (heightData, u, v) => {
  const x = u * (heightData.width - 1)
  const y = v * (heightData.height - 1)
  const x0 = Math.floor(x)
  const y0 = Math.floor(y)
  const fx = x - x0
  const fy = y - y0
  const top =
    readHeightTexel(heightData, x0, y0) * (1 - fx) + readHeightTexel(heightData, x0 + 1, y0) * fx
  const bottom =
    readHeightTexel(heightData, x0, y0 + 1) * (1 - fx) +
    readHeightTexel(heightData, x0 + 1, y0 + 1) * fx
  return top * (1 - fy) + bottom * fy
}

export const getTerrainHeightAt = (heightData, x, z) =>
  sampleHeightBilinear(heightData, x / TERRAIN_SIZE + 0.5, z / TERRAIN_SIZE + 0.5) * HEIGHT_SCALE

const getTerrainNormalAt = (heightData, x, z, step) => {
  const heightAt = (sampleX, sampleZ) => getTerrainHeightAt(heightData, sampleX, sampleZ)
  const nx = heightAt(x - step, z) - heightAt(x + step, z)
  const ny = 2 * step
  const nz = heightAt(x, z - step) - heightAt(x, z + step)
  const length = Math.hypot(nx, ny, nz)
  return [nx / length, ny / length, nz / length]
}

const createGridIndices = () => {
  const row = CHUNK_SEGMENTS + 1
  const indices = []
  for (let j = 0; j < CHUNK_SEGMENTS; j++) {
    for (let i = 0; i < CHUNK_SEGMENTS; i++) {
      const a = j * row + i
      const b = a + 1
      const c = a + row
      const d = c + 1
      indices.push(a, c, b, b, c, d)
    }
  }
  return indices
}

// Vertices live in world space and UVs come from world XZ, so the tiling is seamless across chunks
export const createChunkGeometry = (heightData, chunkX, chunkZ) => {
  const row = CHUNK_SEGMENTS + 1
  const step = CHUNK_SIZE / CHUNK_SEGMENTS
  const originX = -TERRAIN_SIZE / 2 + chunkX * CHUNK_SIZE
  const originZ = -TERRAIN_SIZE / 2 + chunkZ * CHUNK_SIZE
  const positions = new Float32Array(row * row * 3)
  const normals = new Float32Array(row * row * 3)
  const uvs = new Float32Array(row * row * 2)
  for (let j = 0; j < row; j++) {
    for (let i = 0; i < row; i++) {
      const vertex = j * row + i
      const x = originX + i * step
      const z = originZ + j * step
      positions.set([x, getTerrainHeightAt(heightData, x, z), z], vertex * 3)
      normals.set(getTerrainNormalAt(heightData, x, z, step), vertex * 3)
      uvs.set([x / TILE_WORLD_SIZE, z / TILE_WORLD_SIZE], vertex * 2)
    }
  }
  const geometry = new BufferGeometry()
  geometry.setAttribute('position', new BufferAttribute(positions, 3))
  geometry.setAttribute('normal', new BufferAttribute(normals, 3))
  geometry.setAttribute('uv', new BufferAttribute(uvs, 2))
  geometry.setIndex(createGridIndices())
  geometry.computeBoundingBox()
  geometry.computeBoundingSphere()
  return geometry
}

export const createChunkGeometries = (heightData) => {
  const geometries = []
  for (let chunkZ = 0; chunkZ < CHUNKS_PER_SIDE; chunkZ++) {
    for (let chunkX = 0; chunkX < CHUNKS_PER_SIDE; chunkX++) {
      geometries.push(createChunkGeometry(heightData, chunkX, chunkZ))
    }
  }
  return geometries
}
