import * as THREE from 'three/webgpu'

// Procedural pyroclastic smoke puff baked into a Data3DTexture.
//
// Density is stored normalized in [0, 1] (r8unorm), so it stays filterable on
// every WebGPU device. The shader multiplies by a density-scale uniform, and
// `maxDensity * densityScale` is a valid majorant for ratio tracking because
// trilinear interpolation can never exceed the stored maximum.

// --- deterministic 3D value noise -----------------------------------------

function hash3(x, y, z) {
  let h = (x | 0) * 374761393 + (y | 0) * 668265263 + (z | 0) * 2147483647
  h = Math.imul(h ^ (h >>> 13), 1274126177)
  h ^= h >>> 16
  return (h >>> 0) / 4294967296
}

function quintic(t) {
  return t * t * t * (t * (t * 6 - 15) + 10)
}

function noise3(x, y, z) {
  const xi = Math.floor(x)
  const yi = Math.floor(y)
  const zi = Math.floor(z)
  const tx = quintic(x - xi)
  const ty = quintic(y - yi)
  const tz = quintic(z - zi)

  const c000 = hash3(xi, yi, zi)
  const c100 = hash3(xi + 1, yi, zi)
  const c010 = hash3(xi, yi + 1, zi)
  const c110 = hash3(xi + 1, yi + 1, zi)
  const c001 = hash3(xi, yi, zi + 1)
  const c101 = hash3(xi + 1, yi, zi + 1)
  const c011 = hash3(xi, yi + 1, zi + 1)
  const c111 = hash3(xi + 1, yi + 1, zi + 1)

  const x00 = c000 + (c100 - c000) * tx
  const x10 = c010 + (c110 - c010) * tx
  const x01 = c001 + (c101 - c001) * tx
  const x11 = c011 + (c111 - c011) * tx
  const y0 = x00 + (x10 - x00) * ty
  const y1 = x01 + (x11 - x01) * ty
  return y0 + (y1 - y0) * tz
}

function fbm(x, y, z, octaves = 4) {
  let sum = 0
  let amp = 0.5
  let norm = 0
  let f = 1
  for (let o = 0; o < octaves; o++) {
    sum += amp * noise3(x * f, y * f, z * f)
    norm += amp
    amp *= 0.55
    f *= 2.02
  }
  return sum / norm // roughly in [0, 1]
}

// --- pyroclastic puff -------------------------------------------------------

const BASE_LOBES = [
  // [cx, cy, cz, radius] — a cauliflower-ish union of spheres
  [0.0, -0.22, 0.0, 0.58],
  [0.34, 0.18, 0.14, 0.4],
  [-0.32, 0.22, -0.16, 0.38],
  [0.04, 0.5, 0.2, 0.3],
  [-0.1, 0.05, 0.35, 0.34]
]

function clamp01(v) {
  return v < 0 ? 0 : v > 1 ? 1 : v
}

// splitmix32 — small, fast, good-enough deterministic PRNG for a seed.
function makeRng(seed) {
  let s = seed >>> 0
  return () => {
    s = (s + 0x9e3779b9) >>> 0
    let z = s
    z = Math.imul(z ^ (z >>> 16), 0x21f0aaad)
    z = Math.imul(z ^ (z >>> 15), 0x735a2d97)
    z = (z ^ (z >>> 15)) >>> 0
    return z / 4294967296
  }
}

function bakeSmokeDensity(resolution, seed) {
  const n = resolution
  const data = new Uint8Array(n * n * n)
  let maxDensity = 0

  const rng = makeRng(seed)
  // per-seed lobe jitter (varies the puff silhouette) and noise-space offset
  // (varies the surface detail), drawn from the same seeded stream
  const lobes = BASE_LOBES.map(([cx, cy, cz, r]) => [
    cx + (rng() - 0.5) * 0.3,
    cy + (rng() - 0.5) * 0.3,
    cz + (rng() - 0.5) * 0.3,
    r * (0.85 + rng() * 0.3)
  ])
  const noiseOffsetX = rng() * 1000
  const noiseOffsetY = rng() * 1000
  const noiseOffsetZ = rng() * 1000

  const noiseFreq = 2.6
  const noiseAmp = 0.42
  const sharpness = 5.0

  let idx = 0
  for (let z = 0; z < n; z++) {
    const qz = (z / (n - 1)) * 2 - 1
    for (let y = 0; y < n; y++) {
      const qy = (y / (n - 1)) * 2 - 1
      for (let x = 0; x < n; x++, idx++) {
        const qx = (x / (n - 1)) * 2 - 1

        // signed field: positive inside the union of lobes
        let field = -1e9
        for (const [cx, cy, cz, r] of lobes) {
          const dx = qx - cx
          const dy = qy - cy
          const dz = qz - cz
          field = Math.max(field, r - Math.sqrt(dx * dx + dy * dy + dz * dz))
        }
        if (field < -noiseAmp) continue // early out, keeps density 0

        const disp = fbm(
          qx * noiseFreq + noiseOffsetX,
          qy * noiseFreq + noiseOffsetY,
          qz * noiseFreq + noiseOffsetZ
        )
        let d = clamp01((field + (disp - 0.42) * noiseAmp) * sharpness)

        // force zero at the volume boundary so clamp-to-edge is safe
        const edge =
          clamp01((0.96 - Math.abs(qx)) * 12) *
          clamp01((0.96 - Math.abs(qy)) * 12) *
          clamp01((0.96 - Math.abs(qz)) * 12)
        d *= edge

        if (d > maxDensity) maxDensity = d
        data[idx] = (d * 255 + 0.5) | 0
      }
    }
  }

  // quantized max as stored in the texture
  maxDensity = Math.ceil(maxDensity * 255) / 255

  return { data, maxDensity }
}

export function createSmokeVolume(resolution = 128, seed = 0) {
  const { data, maxDensity } = bakeSmokeDensity(resolution, seed)

  const texture = new THREE.Data3DTexture(data, resolution, resolution, resolution)
  texture.format = THREE.RedFormat
  texture.type = THREE.UnsignedByteType
  texture.minFilter = THREE.LinearFilter
  texture.magFilter = THREE.LinearFilter
  texture.wrapS = THREE.ClampToEdgeWrapping
  texture.wrapT = THREE.ClampToEdgeWrapping
  texture.wrapR = THREE.ClampToEdgeWrapping
  texture.unpackAlignment = 1
  texture.needsUpdate = true

  return { texture, maxDensity, resolution }
}

// Rebakes with a new seed into the same `Data3DTexture` instance (so the
// shader graph, which holds a reference to that texture, keeps working
// without a pipeline rebuild) and returns the new majorant.
export function regenerateSmokeVolume(volume, seed) {
  const { data, maxDensity } = bakeSmokeDensity(volume.resolution, seed)
  volume.texture.image.data = data
  volume.texture.needsUpdate = true
  volume.maxDensity = maxDensity
  return maxDensity
}
