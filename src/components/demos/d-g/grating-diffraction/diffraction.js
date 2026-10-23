import { Color, Vector3 } from 'three/webgpu'
import {
  abs,
  cameraPosition,
  cross,
  dot,
  exp,
  float,
  length,
  mix,
  modelWorldMatrix,
  normalize,
  normalWorld,
  positionLocal,
  positionWorld,
  saturate,
  smoothstep,
  step,
  uniform,
  vec3,
  vec4
} from 'three/tsl'
import { DISC } from './disc'

const MAX_ORDERS = 4

export const createDiffractionUniforms = () => ({
  pitch: uniform(1600),
  orders: uniform(3),
  spread: uniform(0.08),
  intensity: uniform(1.6),
  dataEnd: uniform(1.08),
  tint: uniform(new Color('#d9dde3')),
  lightPosition: uniform(new Vector3()),
  lightColor: uniform(new Color('#fff4e6'))
})

const bump3y = (x, yOffset) => saturate(vec3(1).sub(x.mul(x)).sub(yOffset))

// Alan Zucconi's six-bump fit of the visible spectrum, 400–700 nm
const spectrumToRgb = (wavelength) => {
  const x = vec3(saturate(wavelength.sub(400).div(300)))
  const c1 = vec3(3.54585104, 2.93225262, 2.41593945)
  const x1 = vec3(0.69549072, 0.49228336, 0.2769988)
  const y1 = vec3(0.02312639, 0.15225084, 0.52607955)
  const c2 = vec3(3.9030714, 3.21182957, 3.96587128)
  const x2 = vec3(0.11748627, 0.86755042, 0.6607786)
  const y2 = vec3(0.8489713, 0.88445281, 0.73949448)
  const visible = step(400, wavelength).mul(step(wavelength, 700))
  const srgb = bump3y(c1.mul(x.sub(x1)), y1).add(bump3y(c2.mul(x.sub(x2)), y2))
  // Squaring approximates the sRGB → linear decode and stays defined at zero
  return srgb.mul(srgb).mul(visible)
}

const radiusNode = () => length(positionLocal.xy)

export const createDataMaskNode = (uniforms) => {
  const radius = radiusNode()
  const leadIn = smoothstep(DISC.dataStart - 0.004, DISC.dataStart, radius)
  const leadOut = float(1).sub(smoothstep(uniforms.dataEnd.sub(0.004), uniforms.dataEnd, radius))
  return leadIn.mul(leadOut)
}

// Grating equation for concentric tracks: d · (k · (L + V)) = m · λ, k = radial grating vector
const createGratingNode = (uniforms) => {
  const normal = normalize(normalWorld)
  const toLight = normalize(uniforms.lightPosition.sub(positionWorld))
  const toCamera = normalize(cameraPosition.sub(positionWorld))
  const radial = normalize(modelWorldMatrix.mul(vec4(normalize(positionLocal.xy), 0, 0)).xyz)
  const groove = cross(normal, radial)
  const sum = toLight.add(toCamera)
  const pathDifference = abs(dot(radial, sum))
  const offPlane = dot(groove, sum)
  const envelope = exp(offPlane.mul(offPlane).negate().div(uniforms.spread.mul(uniforms.spread)))
  const facing = saturate(dot(normal, toLight)).mul(saturate(dot(normal, toCamera)))

  let spectrum = vec3(0)
  for (let order = 1; order <= MAX_ORDERS; order++) {
    const wavelength = uniforms.pitch.mul(pathDifference).div(order)
    const enabled = step(order - 0.5, uniforms.orders)
    spectrum = spectrum.add(spectrumToRgb(wavelength).mul(enabled).div(order))
  }
  return spectrum.mul(envelope).mul(facing)
}

export const createDiffractionNode = (uniforms, dataMaskNode) => {
  const dyeFilter = mix(vec3(1), uniforms.tint, 0.5)
  return createGratingNode(uniforms)
    .mul(dataMaskNode)
    .mul(uniforms.intensity)
    .mul(uniforms.lightColor)
    .mul(dyeFilter)
}
