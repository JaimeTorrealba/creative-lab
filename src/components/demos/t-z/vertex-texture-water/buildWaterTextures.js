import alea from 'alea'
import { createNoise4D } from 'simplex-noise'
import {
  DataTexture,
  DataUtils,
  HalfFloatType,
  LinearFilter,
  LinearMipmapLinearFilter,
  RGBAFormat,
  RepeatWrapping,
  UnsignedByteType
} from 'three'

const TAU = Math.PI * 2

// Sampling 4D noise along two circles makes the field periodic in both u and v, so the map tiles
// seamlessly no matter how far the grid slides underneath it.
const createHeightField = ({ size, seed, octaves, frequency }) => {
  const noise = createNoise4D(alea(seed))
  const height = new Float32Array(size * size)

  for (let y = 0; y < size; y++) {
    const v = (y / size) * TAU
    const cv = Math.cos(v)
    const sv = Math.sin(v)
    for (let x = 0; x < size; x++) {
      const u = (x / size) * TAU
      const cu = Math.cos(u)
      const su = Math.sin(u)
      let amp = 1
      let freq = frequency
      let sum = 0
      let norm = 0
      for (let o = 0; o < octaves; o++) {
        const r = freq / TAU
        sum += amp * noise(cu * r, su * r, cv * r, sv * r)
        norm += amp
        amp *= 0.5
        freq *= 2
      }
      height[y * size + x] = sum / norm
    }
  }

  // Range is taken from the stored float32s, not the float64 originals, so the rescale lands
  // exactly on 0 and 1.
  let min = Infinity
  let max = -Infinity
  for (const h of height) {
    if (h < min) min = h
    if (h > max) max = h
  }
  const span = max - min || 1
  for (let i = 0; i < height.length; i++) height[i] = (height[i] - min) / span

  return height
}

// Central differences per unit uv, wrapping at the edges because the field is periodic.
const gradients = (height, size) => {
  const out = new Float32Array(size * size * 2)
  const step = 2 / size
  const at = (x, y) => height[(((y % size) + size) % size) * size + (((x % size) + size) % size)]

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const o = (y * size + x) * 2
      out[o] = (at(x + 1, y) - at(x - 1, y)) / step
      out[o + 1] = (at(x, y + 1) - at(x, y - 1)) / step
    }
  }
  return out
}

// Half float rather than full float because linear filtering of RGBA16F is core in WebGL2, while
// RGBA32F needs OES_texture_float_linear.
const toHalf = (src) => {
  const out = new Uint16Array(src.length)
  for (let i = 0; i < src.length; i++) out[i] = DataUtils.toHalfFloat(src[i])
  return out
}

export function buildWaterTextures({ size = 256, seed = 'vertex-texture-water' } = {}) {
  // --- swell: fetched in the vertex shader, so it carries the height as well as its slope.
  // Storing the gradients rather than differencing the height in the shader costs 1 fetch instead
  // of 5 per octave, and keeps the normal consistent with the geometry: the central difference of
  // a bilinearly filtered height is not the derivative of that bilinear surface, and the mismatch
  // is piecewise constant inside each texel, which reads as faceting on a smooth swell.
  const swellHeight = createHeightField({ size, seed: `${seed}-swell`, octaves: 5, frequency: 2 })
  const swellGrad = gradients(swellHeight, size)

  const swellData = new Float32Array(size * size * 4)
  for (let i = 0; i < size * size; i++) {
    swellData[i * 4] = swellGrad[i * 2]
    swellData[i * 4 + 1] = swellGrad[i * 2 + 1]
    swellData[i * 4 + 2] = swellHeight[i]
    swellData[i * 4 + 3] = 1
  }

  const swell = new DataTexture(toHalf(swellData), size, size, RGBAFormat, HalfFloatType)
  swell.wrapS = RepeatWrapping
  swell.wrapT = RepeatWrapping
  swell.minFilter = LinearFilter
  swell.magFilter = LinearFilter
  // a vertex fetch has no derivatives to select a mip level with
  swell.generateMipmaps = false
  swell.needsUpdate = true

  // --- detail: fetched per fragment for the high-frequency lighting the chapter gets from a
  // normal map. Eight bits and no height, because generateMipmap on RGBA16F needs a
  // colour-renderable format and throws INVALID_OPERATION on some drivers — and the mips are the
  // point. A gradient field averages toward zero, which is a flat normal at the horizon for free;
  // averaging a normal map instead shortens the vector, and renormalising it back is wrong.
  const detailHeight = createHeightField({ size, seed: `${seed}-detail`, octaves: 6, frequency: 4 })
  const detailGrad = gradients(detailHeight, size)

  let gMax = 0
  for (const g of detailGrad) gMax = Math.max(gMax, Math.abs(g))
  const gScale = gMax > 0 ? 1 / gMax : 1

  const detailData = new Uint8Array(size * size * 4)
  for (let i = 0; i < size * size; i++) {
    // normalised to +-1 here; the per-octave amplitude uniform carries the physical scale
    detailData[i * 4] = Math.round((detailGrad[i * 2] * gScale * 0.5 + 0.5) * 255)
    detailData[i * 4 + 1] = Math.round((detailGrad[i * 2 + 1] * gScale * 0.5 + 0.5) * 255)
    detailData[i * 4 + 3] = 255
  }

  const detail = new DataTexture(detailData, size, size, RGBAFormat, UnsignedByteType)
  detail.wrapS = RepeatWrapping
  detail.wrapT = RepeatWrapping
  detail.minFilter = LinearMipmapLinearFilter
  detail.magFilter = LinearFilter
  detail.generateMipmaps = true
  detail.anisotropy = 8
  detail.needsUpdate = true

  return { swell, detail }
}
