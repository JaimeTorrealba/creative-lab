// CPU version of Listing 37-3: fill the empty texels around each UV island so filtering and
// mipmaps never bleed in the background. Covered texels have alpha 1, background alpha 0, so a
// plain average of RGBA is already premultiplied. Level 0 stays the Uint8 readback.
const halveLevel = ({ data, width, height, scale }) => {
  const halfWidth = Math.max(1, Math.ceil(width / 2))
  const halfHeight = Math.max(1, Math.ceil(height / 2))
  const half = new Float32Array(halfWidth * halfHeight * 4)
  for (let y = 0; y < halfHeight; y++) {
    for (let x = 0; x < halfWidth; x++) {
      let count = 0
      const target = (y * halfWidth + x) * 4
      for (let dy = 0; dy < 2; dy++) {
        for (let dx = 0; dx < 2; dx++) {
          const sx = x * 2 + dx
          const sy = y * 2 + dy
          if (sx >= width || sy >= height) continue
          const source = (sy * width + sx) * 4
          for (let channel = 0; channel < 4; channel++) half[target + channel] += data[source + channel] * scale
          count++
        }
      }
      for (let channel = 0; channel < 4; channel++) half[target + channel] /= count
    }
  }
  return { data: half, width: halfWidth, height: halfHeight, scale: 1 }
}

const buildPyramid = (pixels, width, height) => {
  const levels = [{ data: pixels, width, height, scale: 1 / 255 }]
  while (levels.at(-1).width > 1 || levels.at(-1).height > 1) levels.push(halveLevel(levels.at(-1)))
  return levels
}

// Coarse to fine: res = c + res * (1 - c.a), with the coarser result upsampled (nearest).
const compositeOver = (level, coarser) => {
  const result = new Float32Array(level.width * level.height * 4)
  for (let y = 0; y < level.height; y++) {
    for (let x = 0; x < level.width; x++) {
      const target = (y * level.width + x) * 4
      const below = ((y >> 1) * coarser.width + (x >> 1)) * 4
      const alpha = level.data[target + 3] * level.scale
      for (let channel = 0; channel < 4; channel++) {
        const own = level.data[target + channel] * level.scale
        result[target + channel] = own + coarser.data[below + channel] * (1 - alpha)
      }
    }
  }
  return { data: result, width: level.width, height: level.height, scale: 1 }
}

// Level 0 is resolved straight into bytes (un-premultiplied) to skip one full-size float copy.
const resolveFinestLevel = (pixels, width, height, coarser) => {
  const filled = new Uint8Array(width * height * 4)
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const target = (y * width + x) * 4
      const below = ((y >> 1) * coarser.width + (x >> 1)) * 4
      const own = pixels[target + 3] / 255
      const alpha = own + coarser.data[below + 3] * (1 - own) || 1
      for (let channel = 0; channel < 3; channel++) {
        const value = pixels[target + channel] / 255 + coarser.data[below + channel] * (1 - own)
        filled[target + channel] = Math.round(Math.min(value / alpha, 1) * 255)
      }
      filled[target + 3] = 255
    }
  }
  return filled
}

export const fillUvGutters = (pixels, width, height) => {
  const levels = buildPyramid(pixels, width, height)
  if (levels.length === 1) return pixels
  let result = levels.at(-1)
  for (let index = levels.length - 2; index >= 1; index--) result = compositeOver(levels[index], result)
  return resolveFinestLevel(pixels, width, height, result)
}
