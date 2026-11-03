import { Color, Uniform } from 'three'

export const FIRE_DEFAULTS = {
  height: 0.55,
  inflate: 0.012,
  tongueScale: 3,
  tongueSpeed: 0.9,
  tongueVariation: 0.65,
  erosion: 0.95,
  softness: 0.3,
  fresnelPower: 1.2,
  textureScale: 3,
  scrollSpeed: 0.9,
  distortion: 0.35,
  distortionSpeed: 0.4,
  brightness: 1.8,
  colorCore: '#fff1b8',
  colorMid: '#ff7a1a',
  colorDeep: '#8a1400',
  debugMask: false
}

// Shared by every burning object; each object adds its own uIntensity for lead in / out
export const createSharedFireUniforms = (params = FIRE_DEFAULTS) => ({
  uTime: new Uniform(0),
  uHeight: new Uniform(params.height),
  uInflate: new Uniform(params.inflate),
  uTongueScale: new Uniform(params.tongueScale),
  uTongueSpeed: new Uniform(params.tongueSpeed),
  uTongueVariation: new Uniform(params.tongueVariation),
  uErosion: new Uniform(params.erosion),
  uSoftness: new Uniform(params.softness),
  uFresnelPower: new Uniform(params.fresnelPower),
  uTextureScale: new Uniform(params.textureScale),
  uScrollSpeed: new Uniform(params.scrollSpeed),
  uDistortion: new Uniform(params.distortion),
  uDistortionSpeed: new Uniform(params.distortionSpeed),
  uBrightness: new Uniform(params.brightness),
  uColorCore: new Uniform(new Color(params.colorCore)),
  uColorMid: new Uniform(new Color(params.colorMid)),
  uColorDeep: new Uniform(new Color(params.colorDeep)),
  uDebugMask: new Uniform(params.debugMask ? 1 : 0)
})
