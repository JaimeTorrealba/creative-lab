import {
  DataTexture,
  Group,
  LinearFilter,
  LinearMipmapLinearFilter,
  Mesh,
  MeshStandardNodeMaterial,
  RepeatWrapping,
  SRGBColorSpace
} from 'three/webgpu'
import { texture } from 'three/tsl'
import { LOWEST_RESIDENT_LEVEL, TEXTURE_ANISOTROPY } from './constants'
import { getMipChainBytes } from './mipChain'

// A texture holding only levels firstLevel..N: the evicted levels are never uploaded
const createChunkTexture = (mipChain, firstLevel) => {
  const mipmaps = mipChain.slice(firstLevel)
  const { data, width, height } = mipmaps[0]
  const chunkTexture = new DataTexture(data, width, height)
  chunkTexture.mipmaps = mipmaps
  chunkTexture.generateMipmaps = false
  chunkTexture.wrapS = chunkTexture.wrapT = RepeatWrapping
  chunkTexture.minFilter = LinearMipmapLinearFilter
  chunkTexture.magFilter = LinearFilter
  chunkTexture.anisotropy = TEXTURE_ANISOTROPY
  chunkTexture.colorSpace = SRGBColorSpace
  chunkTexture.needsUpdate = true
  return chunkTexture
}

const createTerrainMaterial = (colorNode) => {
  const material = new MeshStandardNodeMaterial({ roughness: 1, metalness: 0 })
  material.colorNode = colorNode
  return material
}

// Chunks start with only the coarsest resident level and stream up once measured
const createChunk = ({ geometry, chunkIndex, mipChain }) => {
  const textureNode = texture(createChunkTexture(mipChain, LOWEST_RESIDENT_LEVEL))
  const material = createTerrainMaterial(textureNode)
  const mesh = new Mesh(geometry, material)
  mesh.userData.chunkIndex = chunkIndex
  return { chunkIndex, mesh, material, textureNode, firstLevel: LOWEST_RESIDENT_LEVEL }
}

export const createStreamedTerrain = ({ geometries, mipChain, calibrationTexture }) => {
  const group = new Group()
  const chunks = geometries.map((geometry, chunkIndex) =>
    createChunk({ geometry, chunkIndex, mipChain })
  )
  chunks.forEach(({ mesh }) => group.add(mesh))
  const calibrationViewMaterial = createTerrainMaterial(texture(calibrationTexture).rgb)

  const setChunkFirstLevel = (chunk, firstLevel) => {
    if (chunk.firstLevel === firstLevel) return
    const evictedTexture = chunk.textureNode.value
    chunk.textureNode.value = createChunkTexture(mipChain, firstLevel)
    evictedTexture.dispose()
    chunk.firstLevel = firstLevel
  }

  const setCalibrationView = (isEnabled) => {
    chunks.forEach((chunk) => {
      chunk.mesh.material = isEnabled ? calibrationViewMaterial : chunk.material
    })
  }

  const getResidentBytes = () =>
    chunks.reduce((total, chunk) => total + getMipChainBytes(mipChain, chunk.firstLevel), 0)

  const getFullChainBytes = () => chunks.length * getMipChainBytes(mipChain, 0)

  const dispose = () => {
    chunks.forEach((chunk) => {
      chunk.textureNode.value.dispose()
      chunk.material.dispose()
      chunk.mesh.geometry.dispose()
    })
    calibrationViewMaterial.dispose()
  }

  return {
    group,
    chunks,
    setChunkFirstLevel,
    setCalibrationView,
    getResidentBytes,
    getFullChainBytes,
    dispose
  }
}
