import {
  ClampToEdgeWrapping,
  Data3DTexture,
  LinearFilter,
  RedFormat,
  RepeatWrapping,
  Vector3
} from 'three'

// Bakes the 3D distance map that GPU Gems 2, chapter 8 ray-marches. Each voxel stores the
// distance to the nearest point of the displaced surface, normalized by the texture depth,
// so the shader can sphere-trace: read a distance, stride exactly that far, repeat.

// Finite rather than Infinity on purpose: the lower-envelope maths below subtracts two of
// these, and 1e20 - 1e20 is 0 while Infinity - Infinity is NaN.
const INF = 1e20

// The other four shaders in this demo march `depth` downward from the surface and stop at
// `depth >= height`, i.e. they read white as deep rather than tall. The volume has to agree
// with them, or this plane's bumps come out inverted next to its neighbours.
const HEIGHT_IS_DEPTH = true

// Squared 1D Euclidean distance transform (Felzenszwalb & Huttenlocher): the lower envelope
// of the parabolas rooted at each sample. Linear time, and separable — running it along x,
// then y, then z yields the exact 3D transform.
const transform1D = (f, n, d, v, z) => {
  let k = 0
  v[0] = 0
  z[0] = -INF
  z[1] = INF

  for (let q = 1; q < n; q++) {
    let s = (f[q] + q * q - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k])
    while (s <= z[k]) {
      k--
      s = (f[q] + q * q - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k])
    }
    k++
    v[k] = q
    z[k] = s
    z[k + 1] = INF
  }

  k = 0
  for (let q = 0; q < n; q++) {
    while (z[k + 1] < q) k++
    const dq = q - v[k]
    d[q] = dq * dq + f[v[k]]
  }
}

const readHeightMap = (heightTexture, width, height) => {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height

  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  ctx.drawImage(heightTexture.image, 0, 0, width, height)
  const { data } = ctx.getImageData(0, 0, width, height)

  const heights = new Float32Array(width * height)
  for (let y = 0; y < height; y++) {
    // Textures load with flipY, so canvas row 0 is v = 1. Undo it here or the volume ends
    // up mirrored against the colour and normal maps the same shader samples.
    const row = width * (height - 1 - y)
    for (let x = 0; x < width; x++) {
      heights[x + width * y] = data[(row + x) * 4] / 255
    }
  }
  return heights
}

// Depth resolution is what limits quality once the bump depth gets large — the displaced
// surface is only ever as smooth as the number of slices. The bake is linear in voxel count
// and runs once, at load.
export const createDistanceField = (
  heightTexture,
  { width = 128, height = 128, depth = 64 } = {}
) => {
  const heights = readHeightMap(heightTexture, width, height)
  const slice = width * height

  // Seed the volume: solid voxels are the zeroes the transform grows outward from. z = 1 is
  // the outer surface plane and z = 0 the base, matching the ray that starts at z = 1.
  const sq = new Float32Array(slice * depth)
  for (let zi = 0; zi < depth; zi++) {
    const zNorm = (zi + 0.5) / depth
    for (let i = 0; i < slice; i++) {
      const h = heights[i]
      const surface = HEIGHT_IS_DEPTH ? 1 - h : h
      sq[i + slice * zi] = zNorm <= surface ? 0 : INF
    }
  }

  const maxLen = Math.max(width * 3, height * 3, depth)
  const f = new Float32Array(maxLen)
  const d = new Float32Array(maxLen)
  const v = new Int32Array(maxLen)
  const z = new Float32Array(maxLen + 1)

  // x and y wrap: the map tiles, so transform a 3x-tiled line and keep the middle copy.
  // Transforming the bare line instead leaves wrong distances at the borders, which show up
  // as seams wherever a ray walks outside [0, 1].
  for (let zi = 0; zi < depth; zi++) {
    for (let y = 0; y < height; y++) {
      const row = width * y + slice * zi
      for (let x = 0; x < width; x++) {
        const val = sq[row + x]
        f[x] = val
        f[x + width] = val
        f[x + width * 2] = val
      }
      transform1D(f, width * 3, d, v, z)
      for (let x = 0; x < width; x++) sq[row + x] = d[x + width]
    }
  }

  for (let zi = 0; zi < depth; zi++) {
    for (let x = 0; x < width; x++) {
      const col = x + slice * zi
      for (let y = 0; y < height; y++) {
        const val = sq[col + width * y]
        f[y] = val
        f[y + height] = val
        f[y + height * 2] = val
      }
      transform1D(f, height * 3, d, v, z)
      for (let y = 0; y < height; y++) sq[col + width * y] = d[y + height]
    }
  }

  // Depth genuinely does not wrap.
  for (let i = 0; i < slice; i++) {
    for (let zi = 0; zi < depth; zi++) f[zi] = sq[i + slice * zi]
    transform1D(f, depth, d, v, z)
    for (let zi = 0; zi < depth; zi++) sq[i + slice * zi] = d[zi]
  }

  const data = new Uint8Array(slice * depth)
  for (let i = 0; i < data.length; i++) {
    // Distances come out in voxels and are normalized by the depth in voxels, which is what
    // makes normalizationFactor below the correct conversion into texture-coordinate steps.
    data[i] = Math.round(255 * Math.min(Math.sqrt(sq[i]) / depth, 1))
  }

  const texture = new Data3DTexture(data, width, height, depth)
  texture.format = RedFormat
  texture.minFilter = LinearFilter
  texture.magFilter = LinearFilter
  texture.wrapS = RepeatWrapping
  texture.wrapT = RepeatWrapping
  texture.wrapR = ClampToEdgeWrapping
  texture.unpackAlignment = 1
  texture.needsUpdate = true

  return { texture, normalizationFactor: new Vector3(depth / width, depth / height, 1) }
}
