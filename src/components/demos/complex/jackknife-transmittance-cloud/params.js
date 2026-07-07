import * as THREE from 'three/webgpu'
import { uniform } from 'three/tsl'

export const ESTIMATOR = {
  BIASED_RAY_MARCHING: 0,
  JACKKNIFE: 1,
  RATIO_TRACKING: 2,
  REFERENCE: 3
}

export const ESTIMATOR_NAMES = {
  [ESTIMATOR.BIASED_RAY_MARCHING]: 'Biased ray marching',
  [ESTIMATOR.JACKKNIFE]: 'Jackknife (paper)',
  [ESTIMATOR.RATIO_TRACKING]: 'Ratio tracking',
  [ESTIMATOR.REFERENCE]: 'Reference'
}

export const VIEW_MODE = {
  SPLIT: 0,
  SINGLE: 1,
  DIFFERENCE: 2
}

// CPU-side parameter state, bound to Tweakpane.
export const params = {
  // Drives procedural volume generation; randomized per page load.
  seed: Math.floor(Math.random() * 1_000_000),

  estimatorA: ESTIMATOR.JACKKNIFE,
  estimatorB: ESTIMATOR.BIASED_RAY_MARCHING,
  // Total light-ray sample budget per transmittance estimate.
  lightSamples: 8,
  referenceSteps: 128,
  cameraSteps: 64,

  densityScale: 14,
  albedo: 0.92,
  anisotropy: 0.3,
  lightAzimuth: 55,
  lightElevation: 38,
  lightIntensity: 3.2,
  ambient: 0.12,

  viewMode: VIEW_MODE.SPLIT,
  split: 0.5,
  diffAmp: 10,
  exposure: 1.1,
  tonemap: true,
  renderScale: 0.75,
  accumulate: true
}

// GPU uniforms mirroring `params` (plus camera/frame state).
export const u = {
  // camera
  camPos: uniform(new THREE.Vector3(0, 0, 3)),
  camRight: uniform(new THREE.Vector3(1, 0, 0)),
  camUp: uniform(new THREE.Vector3(0, 1, 0)),
  camFwd: uniform(new THREE.Vector3(0, 0, -1)),
  tanHalfFov: uniform(0.466),
  aspect: uniform(1),
  resolution: uniform(new THREE.Vector2(1, 1)),
  frame: uniform(0, 'uint'),

  // estimators
  estA: uniform(params.estimatorA, 'int'),
  estB: uniform(params.estimatorB, 'int'),
  lightSamples: uniform(params.lightSamples, 'int'),
  refSteps: uniform(params.referenceSteps, 'int'),
  camSteps: uniform(params.cameraSteps, 'int'),

  // medium & lighting
  densityScale: uniform(params.densityScale),
  majorant: uniform(params.densityScale), // maxDensity * densityScale, set in main
  albedo: uniform(params.albedo),
  g: uniform(params.anisotropy),
  lightDir: uniform(new THREE.Vector3(0, 1, 0)), // direction TOWARD the light
  lightIntensity: uniform(params.lightIntensity),
  ambient: uniform(params.ambient),

  // view
  viewMode: uniform(params.viewMode, 'int'),
  splitX: uniform(params.split),
  diffAmp: uniform(params.diffAmp),
  exposure: uniform(params.exposure),
  tonemap: uniform(1, 'int')
}

export function lightDirFromAngles(azimuthDeg, elevationDeg) {
  const az = (azimuthDeg * Math.PI) / 180
  const el = (elevationDeg * Math.PI) / 180
  return new THREE.Vector3(Math.cos(el) * Math.sin(az), Math.sin(el), Math.cos(el) * Math.cos(az))
}
