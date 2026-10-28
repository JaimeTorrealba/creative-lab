export const loadImageDataFromUrl = async (url) => {
  const response = await fetch(url)
  const bitmap = await createImageBitmap(await response.blob())
  const canvas = new OffscreenCanvas(bitmap.width, bitmap.height)
  const context = canvas.getContext('2d', { willReadFrequently: true })
  context.drawImage(bitmap, 0, 0)
  bitmap.close()
  return context.getImageData(0, 0, canvas.width, canvas.height)
}

const averageQuadTexels = (level, x, y, channel) => {
  const { data, width, height } = level
  const right = Math.min(x + 1, width - 1)
  const bottom = Math.min(y + 1, height - 1)
  const sum =
    data[(y * width + x) * 4 + channel] +
    data[(y * width + right) * 4 + channel] +
    data[(bottom * width + x) * 4 + channel] +
    data[(bottom * width + right) * 4 + channel]
  return Math.round(sum / 4)
}

const downsampleMipLevel = (level) => {
  const width = Math.max(1, level.width >> 1)
  const height = Math.max(1, level.height >> 1)
  const data = new Uint8Array(width * height * 4)
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      for (let channel = 0; channel < 4; channel++) {
        data[(y * width + x) * 4 + channel] = averageQuadTexels(level, x * 2, y * 2, channel)
      }
    }
  }
  return { data, width, height }
}

// Box-filtered CPU chain, kept in memory so evicted levels can be re-uploaded at any time
export const buildMipChain = (imageData) => {
  const { width, height } = imageData
  const levels = [{ data: new Uint8Array(imageData.data.buffer), width, height }]
  while (levels.at(-1).width > 1 || levels.at(-1).height > 1) {
    levels.push(downsampleMipLevel(levels.at(-1)))
  }
  return levels
}

export const getMipChainBytes = (mipChain, firstLevel) =>
  mipChain.slice(firstLevel).reduce((total, level) => total + level.data.byteLength, 0)
