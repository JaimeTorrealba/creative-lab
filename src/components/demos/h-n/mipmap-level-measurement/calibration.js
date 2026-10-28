import {
  Color,
  DataTexture,
  LinearFilter,
  LinearMipmapLinearFilter,
  NoColorSpace,
  RepeatWrapping
} from 'three/webgpu'
import { LEVEL_ALPHAS, LEVEL_COLORS, TEXTURE_ANISOTROPY } from './constants'

const getLevelRgba = (level) => {
  const index = Math.min(level, LEVEL_ALPHAS.length - 1)
  const { r, g, b } = new Color(LEVEL_COLORS[index])
  return [r * 255, g * 255, b * 255, LEVEL_ALPHAS[index]]
}

const createSolidMipLevel = (width, height, rgba) => {
  const data = new Uint8Array(width * height * 4)
  for (let texel = 0; texel < width * height; texel++) data.set(rgba, texel * 4)
  return { data, width, height }
}

// Same size as the real texture; every level is a flat colour whose alpha encodes the level,
// so trilinear filtering turns alpha into a continuous "which mip was sampled" value
export const createCalibrationTexture = (size) => {
  const mipmaps = []
  for (let level = 0; size >> level >= 1; level++) {
    const levelSize = size >> level
    mipmaps.push(createSolidMipLevel(levelSize, levelSize, getLevelRgba(level)))
  }
  const texture = new DataTexture(mipmaps[0].data, size, size)
  texture.mipmaps = mipmaps
  texture.generateMipmaps = false
  texture.wrapS = texture.wrapT = RepeatWrapping
  texture.minFilter = LinearMipmapLinearFilter
  texture.magFilter = LinearFilter
  texture.anisotropy = TEXTURE_ANISOTROPY
  texture.colorSpace = NoColorSpace
  texture.needsUpdate = true
  return texture
}
