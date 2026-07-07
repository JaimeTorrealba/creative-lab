import { Data3DTexture, RedFormat, LinearFilter, ClampToEdgeWrapping, RepeatWrapping } from 'three'
import { createNoise4D } from 'simplex-noise'
import alea from 'alea'

const smoothstep = (edge0, edge1, x) => {
  const t = Math.min(Math.max((x - edge0) / (edge1 - edge0), 0), 1)
  return t * t * (3 - 2 * t)
}

// Procedural stand-in for the GPU Gems video-derived fire volume: `frames` flame
// images stacked along z. Time is sampled on a circle in the noise's 3rd/4th
// dimensions so the last frame blends seamlessly back into the first, and the
// phase lags with height so flame features appear to travel upward.
export const createFireVolume = ({
  size = 64,
  frames = 64,
  octaves = 4,
  frequency = 2.5,
  turbulence = 0.6,
  flameWidth = 0.3,
  seed = 1
} = {}) => {
  const noise4D = createNoise4D(alea(seed))
  const data = new Uint8Array(size * size * frames)
  const loopRadius = 1.3
  const phaseLag = 3
  let i = 0

  for (let f = 0; f < frames; f++) {
    const frameAngle = (Math.PI * 2 * f) / frames
    for (let y = 0; y < size; y++) {
      const v = y / (size - 1)
      const angle = frameAngle - v * phaseLag
      const tc = Math.cos(angle) * loopRadius
      const ts = Math.sin(angle) * loopRadius
      for (let x = 0; x < size; x++) {
        const u = (x / (size - 1)) * 2 - 1

        let amplitude = 1
        let scale = 1
        let distort = 0
        for (let o = 0; o < octaves; o++) {
          distort +=
            amplitude *
            noise4D(u * frequency * scale, v * frequency * scale, tc * scale, ts * scale)
          amplitude *= 0.5
          scale *= 2
        }

        const uDistorted = u + distort * turbulence * (0.25 + 0.75 * v)
        const width = flameWidth * (1 - v * 0.8) + 0.03
        let heat = 1 - smoothstep(0, width, Math.abs(uDistorted))
        heat *= smoothstep(0, 0.08, v)
        heat *= 1 - smoothstep(0.55, 1, v + distort * 0.15)
        heat *= 1 - smoothstep(0.9, 1, v)
        heat *= 1 - smoothstep(0.8, 1, Math.abs(u))
        data[i++] = Math.round(255 * Math.min(Math.max(heat, 0), 1))
      }
    }
  }

  const texture = new Data3DTexture(data, size, size, frames)
  texture.format = RedFormat
  texture.minFilter = LinearFilter
  texture.magFilter = LinearFilter
  texture.wrapS = ClampToEdgeWrapping
  texture.wrapT = ClampToEdgeWrapping
  texture.wrapR = RepeatWrapping
  texture.unpackAlignment = 1
  texture.needsUpdate = true
  return texture
}
