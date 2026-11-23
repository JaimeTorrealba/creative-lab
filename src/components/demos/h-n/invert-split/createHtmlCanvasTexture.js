import { ExternalTexture } from 'three'

const IDENTITY_TRANSFORM = new DOMMatrix()

// `layoutsubtree` is the pre-rename attribute, kept for older Chrome builds
const attachDrawableElement = (canvas, element) => {
  canvas.setAttribute('content', 'drawable')
  canvas.setAttribute('layoutsubtree', '')
  element.setAttribute('drawable', '')
  canvas.appendChild(element)
}

const getElementImageSize = (canvas, element) => {
  if ('getElementImageDefaultSize' in canvas) return canvas.getElementImageDefaultSize(element)
  const pixelRatio = window.devicePixelRatio
  return {
    width: Math.round(element.offsetWidth * pixelRatio),
    height: Math.round(element.offsetHeight * pixelRatio)
  }
}

const uploadElementImage = (gl, element, size) => {
  if ('texElementSubImage2D' in gl) {
    const { width, height } = size
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null)
    gl.texElementSubImage2D(gl.TEXTURE_2D, 0, 0, 0, element)
  } else if (gl.texElementImage2D.length === 3) {
    gl.texElementImage2D(gl.TEXTURE_2D, gl.RGBA8, element)
  } else {
    gl.texElementImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, gl.RGBA, gl.UNSIGNED_BYTE, element)
  }
}

const setLinearClampParameters = (gl) => {
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
}

export const isHtmlInCanvasAvailable = (gl) =>
  'texElementSubImage2D' in gl || 'texElementImage2D' in gl

export const createHtmlCanvasTexture = (renderer, element) => {
  const gl = renderer.getContext()
  const canvas = gl.canvas
  const glTexture = gl.createTexture()
  const texture = new ExternalTexture(glTexture)

  // Binding through three's state keeps its texture-unit cache in sync
  const bindPageTexture = () => renderer.state.bindTexture(gl.TEXTURE_2D, glTexture)

  bindPageTexture()
  setLinearClampParameters(gl)

  const onCanvasPaint = () => {
    bindPageTexture()
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false)
    uploadElementImage(gl, element, getElementImageSize(canvas, element))
    // The page is drawn 1:1 over the canvas, so hit-testing maps with no transform
    canvas.updateElementGeometry?.(element, { canvasTransform: IDENTITY_TRANSFORM })
  }

  attachDrawableElement(canvas, element)
  canvas.addEventListener('paint', onCanvasPaint)
  canvas.requestPaint()

  const disposeHtmlCanvasTexture = () => {
    canvas.removeEventListener('paint', onCanvasPaint)
    element.remove()
    gl.deleteTexture(glTexture)
    texture.dispose()
  }

  return { texture, disposeHtmlCanvasTexture }
}
