import {
  Color,
  DataTexture,
  DoubleSide,
  LinearFilter,
  LinearMipmapLinearFilter,
  Mesh,
  OrthographicCamera,
  RepeatWrapping,
  RGBAFormat,
  Scene,
  ShaderMaterial,
  UnsignedByteType,
  WebGLRenderTarget
} from 'three'
import { fillUvGutters } from './pushPull'

const createExportTarget = (width, height) =>
  new WebGLRenderTarget(width, height, {
    type: UnsignedByteType,
    format: RGBAFormat,
    depthBuffer: false,
    stencilBuffer: false,
    generateMipmaps: false
  })

const createPreviewTexture = (pixels, width, height) => {
  const texture = new DataTexture(pixels, width, height, RGBAFormat, UnsignedByteType)
  texture.magFilter = LinearFilter
  texture.minFilter = LinearMipmapLinearFilter
  texture.wrapS = RepeatWrapping
  texture.wrapT = RepeatWrapping
  texture.generateMipmaps = true
  texture.needsUpdate = true
  return texture
}

// readRenderTargetPixels returns rows bottom-up; image files store the top row (v = 1) first.
const pixelsToPngBlob = (pixels, width, height) => {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const context = canvas.getContext('2d')
  const image = context.createImageData(width, height)
  const rowBytes = width * 4
  for (let row = 0; row < height; row++) {
    image.data.set(pixels.subarray(row * rowBytes, (row + 1) * rowBytes), (height - 1 - row) * rowBytes)
  }
  context.putImageData(image, 0, 0)
  return new Promise((resolve) => canvas.toBlob(resolve, 'image/png'))
}

const downloadBlob = (blob, fileName) => {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  link.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

// 37.3 "Converting to a standard 2D texture": the donut is drawn at its (u,v), every fragment
// looks the octree up with its 3D position, and the gutter fill extends the borders.
export const createTextureExporter = ({ geometry, fragmentShader, vertexShader, uniforms }) => {
  const material = new ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms,
    side: DoubleSide,
    depthTest: false,
    depthWrite: false
  })
  const mesh = new Mesh(geometry, material)
  mesh.frustumCulled = false
  const scene = new Scene()
  scene.add(mesh)
  const camera = new OrthographicCamera()
  const previousClear = new Color()
  let previewTexture = null

  const renderUvSpace = (renderer, width, height) => {
    const target = createExportTarget(width, height)
    renderer.getClearColor(previousClear)
    const previousAlpha = renderer.getClearAlpha()
    renderer.setRenderTarget(target)
    renderer.setClearColor(0x000000, 0)
    renderer.clear(true, false, false)
    renderer.render(scene, camera)
    const pixels = new Uint8Array(width * height * 4)
    renderer.readRenderTargetPixels(target, 0, 0, width, height, pixels)
    renderer.setRenderTarget(null)
    renderer.setClearColor(previousClear, previousAlpha)
    target.dispose()
    return { pixels }
  }

  // Returns the gutter-filled bake as a texture for the preview; optionally downloads a PNG.
  const bakeTexture = async (renderer, { width, height, download }) => {
    const { pixels } = renderUvSpace(renderer, width, height)
    const filled = fillUvGutters(pixels, width, height)
    previewTexture?.dispose()
    previewTexture = createPreviewTexture(filled, width, height)
    if (download) downloadBlob(await pixelsToPngBlob(filled, width, height), `octree-donut-${width}x${height}.png`)
    return previewTexture
  }

  const dispose = () => {
    material.dispose()
    previewTexture?.dispose()
  }

  return { bakeTexture, dispose }
}
