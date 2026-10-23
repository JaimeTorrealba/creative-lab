import {
  ClampToEdgeWrapping,
  Data3DTexture,
  LinearFilter,
  RedFormat,
  UnsignedByteType
} from 'three/webgpu'

// Klacansky's 240x162x272 preview of the 958x646x1088 uint16 CT scan, windowed to uint8
// (raw 15000 -> 0, raw 55000 -> 255) so the empty background maps to zero.
// X and Y are flipped together to stand the skull upright without mirroring it.
export const PAWPAWSAURUS_VOLUME = {
  url: '/textures/volumes/pawpawsaurus_240x162x272_uint8.raw.gz',
  dimensions: [240, 162, 272],
  scale: [-0.8805, -0.5937, 1]
}

const isGzipped = (bytes) => bytes[0] === 0x1f && bytes[1] === 0x8b

const gunzipBytes = async (bytes) => {
  const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'))
  return new Uint8Array(await new Response(stream).arrayBuffer())
}

// Hosts that send `Content-Encoding: gzip` hand over bytes the browser already inflated
export const fetchVolumeBytes = async (url) => {
  const response = await fetch(url)
  if (!response.ok) throw new Error(`Volume request failed: ${response.status} ${url}`)
  const bytes = new Uint8Array(await response.arrayBuffer())
  return isGzipped(bytes) ? gunzipBytes(bytes) : bytes
}

export const createVolumeTexture = (bytes, [width, height, depth]) => {
  const texture = new Data3DTexture(bytes, width, height, depth)
  texture.format = RedFormat
  texture.type = UnsignedByteType
  texture.minFilter = LinearFilter
  texture.magFilter = LinearFilter
  texture.wrapS = ClampToEdgeWrapping
  texture.wrapT = ClampToEdgeWrapping
  texture.wrapR = ClampToEdgeWrapping
  texture.unpackAlignment = 1
  texture.needsUpdate = true
  return texture
}
