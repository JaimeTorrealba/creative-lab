export const MODEL_URL = '/models/jaimeAvatar.glb'

export const CAMERA_FOV = 50
export const CAMERA_DISTANCE = 1.5

// Avatar is in metres, A-posed, facing +Z. Triangles outside the box are dropped before sampling.
export const SHAPES = {
  Bust: { minY: 1.2, maxAbsX: 0.3 },
  'Full body': { minY: -Infinity, maxAbsX: Infinity }
}

export const EXCLUDED_MESHES = ['Wolf3D_Teeth']

export const PARTICLE_COUNTS = {
  '65k': 256,
  '262k': 512,
  '590k': 768,
  '1M': 1024,
  '1.44M': 1200
}

export const DEFAULT_PARAMS = {
  shape: 'Bust',
  textureSize: 1024,
  color: '#80fff0',
  size: 1.7,
  minAlpha: 0.04,
  maxAlpha: 0.8,
  force: 0.7,
  attraction: 0.02,
  mouseRadius: 0.1,
  mouseStrength: 0.007,
  mouseDecay: 0.85
}

export const DEFAULT_BLOOM = {
  threshold: 0.058,
  strength: 0.2,
  radius: 0,
  directionX: { x: 2, y: 1.1 },
  directionY: { x: 1, y: 1 }
}
