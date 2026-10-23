import { CanvasTexture, SRGBColorSpace } from 'three/webgpu'
import { DISC } from './disc'

const SIZE = 1024
const CENTER = SIZE / 2
const toPixels = (radius) => (radius / DISC.metalEnd) * CENTER

const drawBackground = (ctx) => {
  const innerRadius = toPixels(DISC.metalStart)
  const gradient = ctx.createRadialGradient(CENTER, CENTER, innerRadius, CENTER, CENTER, CENTER)
  gradient.addColorStop(0, '#f4efe4')
  gradient.addColorStop(1, '#e2d9c6')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, SIZE, SIZE)
}

const drawRings = (ctx) => {
  ctx.strokeStyle = '#1b1d2a'
  ;[0.5, 0.53, 1.1].forEach((radius, index) => {
    ctx.lineWidth = index === 2 ? 6 : 2
    ctx.beginPath()
    ctx.arc(CENTER, CENTER, toPixels(radius), 0, Math.PI * 2)
    ctx.stroke()
  })
}

// Upright along the bottom of the disc, reading left to right
const drawBottomArcText = (ctx, text, radius) => {
  const step = ctx.measureText('M').width / toPixels(radius)
  ctx.save()
  ctx.translate(CENTER, CENTER)
  ctx.rotate((step * (text.length - 1)) / 2)
  ;[...text].forEach((char) => {
    ctx.fillText(char, 0, toPixels(radius))
    ctx.rotate(-step)
  })
  ctx.restore()
}

const drawTitle = (ctx) => {
  ctx.fillStyle = '#1b1d2a'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.font = '700 88px "Helvetica Neue", Arial, sans-serif'
  ctx.fillText('CREATIVE LAB', CENTER, CENTER - toPixels(0.78))
  ctx.font = '400 40px "Helvetica Neue", Arial, sans-serif'
  ctx.fillText('GRATING DIFFRACTION', CENTER, CENTER + toPixels(0.72))
  ctx.font = '500 26px "Courier New", monospace'
  drawBottomArcText(ctx, 'd·(sin θi + sin θm) = m·λ  —  TSL · WebGPU', 0.98)
}

export const createLabelTexture = () => {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = SIZE
  const ctx = canvas.getContext('2d')
  drawBackground(ctx)
  drawRings(ctx)
  drawTitle(ctx)
  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace
  texture.anisotropy = 8
  return texture
}
