import {
  DataTexture,
  LinearFilter,
  LinearMipmapLinearFilter,
  NearestFilter,
  RGBAFormat,
  RepeatWrapping,
  SRGBColorSpace
} from 'three'

// Listing 12-1. Places the tile whose two opposing edges are (e1, e2) along one axis of the
// atlas. For n edge colours this is a bijection onto [0, n*n), so the complete set of n^4 Wang
// tiles packs into an n^2 x n^2 atlas.
//
// The ordering is Eulerian: the tile in column k already shares an edge colour with the tile in
// column k + 1, and the last column wraps back to the first. That is why the chapter packs the
// atlas with no padding at all — bilinear filtering straight across an atlas seam lands on a
// matching edge, so it reads the right thing.
export const tileIndex1D = (e1, e2) => {
  if (e1 < e2) return 2 * e1 + e2 * e2
  if (e1 === e2) return e1 > 0 ? (e1 + 1) * (e1 + 1) - 2 : 0
  if (e2 > 0) return e1 * e1 + 2 * e2 - 1
  return (e1 + 1) * (e1 + 1) - 1
}

// e = [south, east, north, west], matching the chapter's x/y/z/w packing.
export const tileIndex2D = (e) => [tileIndex1D(e[3], e[1]), tileIndex1D(e[0], e[2])]

const pairsByIndex = (edgeColors) => {
  const pairs = new Array(edgeColors * edgeColors)
  for (let e1 = 0; e1 < edgeColors; e1++) {
    for (let e2 = 0; e2 < edgeColors; e2++) {
      pairs[tileIndex1D(e1, e2)] = [e1, e2]
    }
  }
  return pairs
}

const mulberry32 = (seed) => {
  let a = seed | 0
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const smoothstep01 = (t) => t * t * (3 - 2 * t)

// Used for the detail taper, where flat-at-the-ends is not quite enough. The normal map samples
// at texel centres rather than at the border, and smoothstep's derivative has already climbed to
// ~0.7 half a texel in — enough to leave a crease. Smootherstep is flat to second order, so the
// first texel is genuinely flat.
const smootherstep01 = (t) => t * t * t * (t * (t * 6 - 15) + 10)

const hashLattice = (x, y, seed) => {
  let h = Math.imul(x, 374761393) + Math.imul(y, 668265263) + Math.imul(seed, 1274126177)
  h = Math.imul(h ^ (h >>> 13), 1274126177)
  h ^= h >>> 16
  return (h >>> 0) / 4294967296
}

const valueNoise = (x, y, seed) => {
  const xi = Math.floor(x)
  const yi = Math.floor(y)
  const u = smoothstep01(x - xi)
  const v = smoothstep01(y - yi)
  const a = hashLattice(xi, yi, seed)
  const b = hashLattice(xi + 1, yi, seed)
  const c = hashLattice(xi, yi + 1, seed)
  const d = hashLattice(xi + 1, yi + 1, seed)
  return (a + (b - a) * u) * (1 - v) + (c + (d - c) * u) * v
}

// Ridged rather than plain fbm: folding the noise about zero leaves creases along the zero set,
// which read as grain and cracks. Plain fbm gives smooth blobs, and smooth blobs are exactly what
// lets the eye pick the tile lattice back out of the result.
const ridgedNoise = (x, y, seed) => {
  let sum = 0
  let amp = 0.5
  let freq = 1
  let total = 0
  for (let o = 0; o < 5; o++) {
    const n = 1 - Math.abs(valueNoise(x * freq, y * freq, seed + o * 101) * 2 - 1)
    sum += amp * n * n
    total += amp
    amp *= 0.5
    freq *= 2
  }
  return (sum / total) * 2 - 1
}

// The interior detail carries most of the look, and the edge profiles only a gentle tonal drift.
// Weighting it the other way round is what produces a plaid: the Coons patch can only interpolate
// its boundary, so any large-scale structure it carries is boundary-shaped and lines up tile to
// tile no matter how the tiling is shuffled.
const BASE_LEVEL = 0.5
const PROFILE_AMPLITUDE = 0.12
const SLOPE_AMPLITUDE = 0.55
const HARMONICS = 8
const DETAIL_FREQUENCY = 7
const TAPER_BAND = 0.1

// Cubic Hermite basis. H00/H01 carry the endpoint values, H10/H11 the endpoint slopes.
const h00 = (t) => t * t * (2 * t - 3) + 1
const h10 = (t) => t * (t * (t - 2) + 1)
const h01 = (t) => t * t * (3 - 2 * t)
const h11 = (t) => t * t * (t - 1)

// Every tile using edge colour c shares these profiles along that edge, so any two tiles abutting
// on c are pattern-continuous by construction rather than by hand-authoring. Two families are
// built: one for the value along the edge, one for the slope *across* it.
//
// The basis is (1 - cos(2*pi*k*t)) / 2, zero at both ends and flat at both ends. That pins every
// value profile to BASE_LEVEL at its endpoints and every slope profile to zero, which is exactly
// the corner compatibility a Coons patch needs — all four corner values agree, all corner slopes
// and twists vanish, and the bicubic correction term collapses to the single constant BASE_LEVEL.
const buildProfileFamily = ({ edgeColors, tileSize, seed, amplitude, base }) => {
  const family = []
  for (let c = 0; c < edgeColors; c++) {
    const rand = mulberry32(seed + c * 7919)
    const coefficients = []
    let total = 0
    for (let k = 1; k <= HARMONICS; k++) {
      // Leaning each colour on a different harmonic keeps two profiles visibly apart even when
      // there are only two of them.
      const a = (rand() * 2 - 1) * (k === c + 1 ? 1 : 0.45)
      coefficients.push(a)
      total += Math.abs(a)
    }
    const norm = amplitude / (total || 1)
    const samples = new Float32Array(tileSize)
    for (let i = 0; i < tileSize; i++) {
      const t = (i + 0.5) / tileSize
      let v = 0
      for (let k = 1; k <= HARMONICS; k++) {
        v += coefficients[k - 1] * (1 - Math.cos(2 * Math.PI * k * t)) * 0.5
      }
      samples[i] = base + v * norm
    }
    family.push(samples)
  }
  return family
}

// Fades the per-tile detail out at the tile border. It has to reach zero with a zero derivative:
// the gradient of detail * taper at the border is detail * taper', so a taper that merely reaches
// zero would still leave a gradient jump across the seam, and the normal map would crease along
// every tile boundary even though the colour matched.
const taperAt = (t) =>
  smootherstep01(Math.min(t / TAPER_BAND, 1)) * smootherstep01(Math.min((1 - t) / TAPER_BAND, 1))

const RAMP = [
  [0.0, 32, 30, 30],
  [0.3, 76, 72, 66],
  [0.55, 116, 110, 99],
  [0.8, 158, 152, 140],
  [1.0, 205, 200, 190]
]

const sampleRamp = (t, out) => {
  let k = 0
  while (k < RAMP.length - 2 && t > RAMP[k + 1][0]) k++
  const a = RAMP[k]
  const b = RAMP[k + 1]
  const f = Math.min(Math.max((t - a[0]) / (b[0] - a[0]), 0), 1)
  out[0] = a[1] + (b[1] - a[1]) * f
  out[1] = a[2] + (b[2] - a[2]) * f
  out[2] = a[3] + (b[3] - a[3]) * f
}

export const buildTileAtlas = ({ edgeColors, tileSize, detail, seed }) => {
  const tilesAcross = edgeColors * edgeColors
  const size = tilesAcross * tileSize
  const field = new Float32Array(size * size)
  const values = buildProfileFamily({
    edgeColors,
    tileSize,
    seed,
    amplitude: PROFILE_AMPLITUDE,
    base: BASE_LEVEL
  })
  const slopes = buildProfileFamily({
    edgeColors,
    tileSize,
    seed: seed + 31337,
    amplitude: SLOPE_AMPLITUDE,
    base: 0
  })
  const pairs = pairsByIndex(edgeColors)

  const b00 = new Float32Array(tileSize)
  const b10 = new Float32Array(tileSize)
  const b01 = new Float32Array(tileSize)
  const b11 = new Float32Array(tileSize)
  const taper = new Float32Array(tileSize)
  for (let i = 0; i < tileSize; i++) {
    const t = (i + 0.5) / tileSize
    b00[i] = h00(t)
    b10[i] = h10(t)
    b01[i] = h01(t)
    b11[i] = h11(t)
    taper[i] = taperAt(t)
  }

  for (let row = 0; row < tilesAcross; row++) {
    const [south, north] = pairs[row]
    const S = values[south]
    const N = values[north]
    const Qs = slopes[south]
    const Qn = slopes[north]
    for (let col = 0; col < tilesAcross; col++) {
      const [west, east] = pairs[col]
      const W = values[west]
      const E = values[east]
      const Pw = slopes[west]
      const Pe = slopes[east]
      const tileSeed = seed + row * 104729 + col * 7919
      for (let j = 0; j < tileSize; j++) {
        const taperV = taper[j]
        const v = (j + 0.5) / tileSize
        const base = (row * tileSize + j) * size + col * tileSize
        for (let i = 0; i < tileSize; i++) {
          const u = (i + 0.5) / tileSize
          // Hermite Coons patch. Interpolating only the four edge *values* would force the slope
          // across every border to zero, which sounds harmless and is not: the field then has a
          // flat line along every seam with the tile curving away on both sides, and the tiling
          // reads as a plaid of ridges however the tiles are shuffled.
          //
          // Carrying a slope profile per edge colour as well removes it. At u = 0 the patch is
          // exactly W(v) and its u-derivative is exactly Pw(v) — both functions of the west
          // colour alone, so the tile on the other side of that seam arrives at the same value
          // *and* the same gradient, and there is nothing to see.
          const uPart = b00[i] * W[j] + b01[i] * E[j] + b10[i] * Pw[j] + b11[i] * Pe[j]
          const vPart = b00[j] * S[i] + b01[j] * N[i] + b10[j] * Qs[i] + b11[j] * Qn[i]
          field[base + i] =
            uPart +
            vPart -
            BASE_LEVEL +
            detail *
              taper[i] *
              taperV *
              ridgedNoise(u * DETAIL_FREQUENCY, v * DETAIL_FREQUENCY, tileSeed)
        }
      }
    }
  }

  // Stretch the whole atlas onto [0, 1] so the ramp is actually used end to end — a Coons patch
  // of four profiles spends most of its time near BASE_LEVEL, and left alone the result comes out
  // as one flat midtone. Affine and applied to every texel alike, so it cannot disturb the seams.
  let lowest = Infinity
  let highest = -Infinity
  for (let i = 0; i < field.length; i++) {
    if (field[i] < lowest) lowest = field[i]
    if (field[i] > highest) highest = field[i]
  }
  const span = highest - lowest || 1
  for (let i = 0; i < field.length; i++) field[i] = (field[i] - lowest) / span

  const color = new Uint8Array(size * size * 4)
  const normal = new Uint8Array(size * size * 4)
  const rgb = [0, 0, 0]
  // A central difference spans two texels, so this turns it back into a slope measured against
  // the tile rather than against the resolution — changing tile size then leaves the relief alone.
  const slopeScale = tileSize * 0.5
  const wrap = (v) => (v + size) % size

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const o = (y * size + x) * 4
      sampleRamp(field[y * size + x], rgb)
      color[o] = rgb[0]
      color[o + 1] = rgb[1]
      color[o + 2] = rgb[2]
      color[o + 3] = 255

      // The atlas is itself a valid Wang tiling and wraps in both axes, so central differences
      // taken straight across a tile border are reading a genuine neighbour.
      const dx = field[y * size + wrap(x + 1)] - field[y * size + wrap(x - 1)]
      const dy = field[wrap(y + 1) * size + x] - field[wrap(y - 1) * size + x]
      const nx = -dx * slopeScale
      const ny = -dy * slopeScale
      const inv = 1 / Math.sqrt(nx * nx + ny * ny + 1)
      normal[o] = (nx * inv * 0.5 + 0.5) * 255
      normal[o + 1] = (ny * inv * 0.5 + 0.5) * 255
      normal[o + 2] = (inv * 0.5 + 0.5) * 255
      normal[o + 3] = 255
    }
  }

  const colorTexture = new DataTexture(color, size, size, RGBAFormat)
  colorTexture.colorSpace = SRGBColorSpace
  const normalTexture = new DataTexture(normal, size, size, RGBAFormat)

  // Repeat, not clamp: the atlas wraps, so the outermost seam has to blend against column zero
  // the same way every interior seam blends against its neighbour.
  for (const texture of [colorTexture, normalTexture]) {
    texture.wrapS = RepeatWrapping
    texture.wrapT = RepeatWrapping
    texture.magFilter = LinearFilter
    texture.minFilter = LinearMipmapLinearFilter
    texture.generateMipmaps = true
    texture.anisotropy = 8
    texture.needsUpdate = true
  }

  return { colorTexture, normalTexture, tilesAcross }
}

// Section 12.4. Walks the output grid in scanline order taking west from the left neighbour's
// east and south from the neighbour below's north, then picking the two free edges at random.
// The tile set holds every one of the n^4 combinations, so this never paints itself into a
// corner — which also means the last row and column can be pinned back to the first, and the
// index map tiles seamlessly under RepeatWrapping.
export const buildIndirectionTexture = ({ edgeColors, outputTiles, seed }) => {
  const rand = mulberry32(seed)
  const pick = () => Math.min(Math.floor(rand() * edgeColors), edgeColors - 1)

  const westOfFirstColumn = new Uint8Array(outputTiles)
  const southOfFirstRow = new Uint8Array(outputTiles)
  for (let k = 0; k < outputTiles; k++) {
    westOfFirstColumn[k] = pick()
    southOfFirstRow[k] = pick()
  }

  const northBelow = Uint8Array.from(southOfFirstRow)
  const data = new Uint8Array(outputTiles * outputTiles * 4)

  for (let j = 0; j < outputTiles; j++) {
    let eastOfPrevious = westOfFirstColumn[j]
    for (let i = 0; i < outputTiles; i++) {
      const west = eastOfPrevious
      const south = northBelow[i]
      const east = i === outputTiles - 1 ? westOfFirstColumn[j] : pick()
      const north = j === outputTiles - 1 ? southOfFirstRow[i] : pick()

      const [col, row] = tileIndex2D([south, east, north, west])
      const o = (j * outputTiles + i) * 4
      data[o] = col
      data[o + 1] = row
      data[o + 3] = 255

      eastOfPrevious = east
      northBelow[i] = north
    }
  }

  const texture = new DataTexture(data, outputTiles, outputTiles, RGBAFormat)
  texture.wrapS = RepeatWrapping
  texture.wrapT = RepeatWrapping
  texture.magFilter = NearestFilter
  texture.minFilter = NearestFilter
  texture.generateMipmaps = false
  texture.needsUpdate = true
  return texture
}
