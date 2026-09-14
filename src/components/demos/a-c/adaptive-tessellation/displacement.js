import { createNoise4D } from 'simplex-noise'

const TAU = Math.PI * 2

const mulberry32 = (seed) => {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// Sampling 4D noise along two circles makes the field periodic in both u and v, which a torus
// needs: texel 0 and texel `size` are the same point on the surface.
export const createDisplacementField = ({ size = 256, seed = 1, octaves = 5, frequency = 3 }) => {
  const noise = createNoise4D(mulberry32(seed))
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

  // Packed as (dh/du, dh/dv, h, 1). The gradients are stored per unit uv rather than baked into a
  // normal map so the fragment shader can rebuild the perturbed normal at whatever displacement
  // scale the slider is currently on.
  const surface = new Float32Array(size * size * 4)
  const step = 2 / size
  const at = (x, y) =>
    height[(((y % size) + size) % size) * size + (((x % size) + size) % size)]

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const o = (y * size + x) * 4
      surface[o] = (at(x + 1, y) - at(x - 1, y)) / step
      surface[o + 1] = (at(x, y + 1) - at(x, y - 1)) / step
      surface[o + 2] = height[y * size + x]
      surface[o + 3] = 1
    }
  }

  return { size, height, surface }
}

// The "precomputed maximum displacement table" of ch.7.2.1: how much relief the displacement map
// adds inside each patch, so the flatness test can account for detail the control mesh does not
// have. One patch covers exactly one control-grid cell in uv, so the table has one entry per cell.
export const buildReliefTable = (field, gridX, gridY) => {
  const { size, height } = field
  const relief = new Float32Array(gridX * gridY)

  for (let j = 0; j < gridY; j++) {
    const y0 = Math.floor((j / gridY) * size) - 1
    const y1 = Math.ceil(((j + 1) / gridY) * size) + 1
    for (let i = 0; i < gridX; i++) {
      const x0 = Math.floor((i / gridX) * size) - 1
      const x1 = Math.ceil(((i + 1) / gridX) * size) + 1
      let lo = Infinity
      let hi = -Infinity
      for (let y = y0; y <= y1; y++) {
        const row = (((y % size) + size) % size) * size
        for (let x = x0; x <= x1; x++) {
          const h = height[row + (((x % size) + size) % size)]
          if (h < lo) lo = h
          if (h > hi) hi = h
        }
      }
      relief[j * gridX + i] = hi - lo
    }
  }
  return relief
}
