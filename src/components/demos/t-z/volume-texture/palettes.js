import {
  ClampToEdgeWrapping,
  DataTexture,
  LinearFilter,
  RGBAFormat,
  SRGBColorSpace,
  UnsignedByteType
} from 'three/webgpu'

// ColorBrewer sequential schemes, 9 classes, light to dark
export const PALETTES = {
  RdPu: ['#fff7f3', '#fde0dd', '#fcc5c0', '#fa9fb5', '#f768a1', '#dd3497', '#ae017e', '#7a0177', '#49006a'],
  YlOrBr: ['#ffffe5', '#fff7bc', '#fee391', '#fec44f', '#fe9929', '#ec7014', '#cc4c02', '#993404', '#662506'],
  OrRd: ['#fff7ec', '#fee8c8', '#fdd49e', '#fdbb84', '#fc8d59', '#ef6548', '#d7301f', '#b30000', '#7f0000'],
  YlGnBu: ['#ffffd9', '#edf8b1', '#c7e9b4', '#7fcdbb', '#41b6c4', '#1d91c0', '#225ea8', '#253494', '#081d58'],
  Blues: ['#f7fbff', '#deebf7', '#c6dbef', '#9ecae1', '#6baed6', '#4292c6', '#2171b5', '#08519c', '#08306b'],
  Purples: ['#fcfbfd', '#efedf5', '#dadaeb', '#bcbddc', '#9e9ac8', '#807dba', '#6a51a3', '#54278f', '#3f007d'],
  Greys: ['#ffffff', '#f0f0f0', '#d9d9d9', '#bdbdbd', '#969696', '#737373', '#525252', '#252525', '#000000']
}

const PALETTE_SIZE = 256

const hexToRgb = (hex) => [1, 3, 5].map((start) => parseInt(hex.slice(start, start + 2), 16))

const samplePaletteRgb = (stops, t) => {
  const position = t * (stops.length - 1)
  const index = Math.min(Math.floor(position), stops.length - 2)
  const blend = position - index
  const from = hexToRgb(stops[index])
  const to = hexToRgb(stops[index + 1])
  return from.map((channel, i) => Math.round(channel + (to[i] - channel) * blend))
}

export const fillPaletteTexture = (texture, paletteName) => {
  const stops = PALETTES[paletteName]
  const { data } = texture.image
  for (let i = 0; i < PALETTE_SIZE; i++) {
    data.set([...samplePaletteRgb(stops, i / (PALETTE_SIZE - 1)), 255], i * 4)
  }
  texture.needsUpdate = true
}

export const createPaletteTexture = (paletteName) => {
  const data = new Uint8Array(PALETTE_SIZE * 4)
  const texture = new DataTexture(data, PALETTE_SIZE, 1, RGBAFormat, UnsignedByteType)
  texture.minFilter = LinearFilter
  texture.magFilter = LinearFilter
  texture.wrapS = ClampToEdgeWrapping
  texture.wrapT = ClampToEdgeWrapping
  texture.colorSpace = SRGBColorSpace
  fillPaletteTexture(texture, paletteName)
  return texture
}
