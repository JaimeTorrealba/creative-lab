import { HalfFloatType, LinearFilter, NearestFilter, Uniform, Vector2 } from 'three'
import { GPUComputationRenderer } from 'three/addons/misc/GPUComputationRenderer.js'
import gpgpuShader from './gpgpu.glsl'

const MOUSE_MOVE_DECAY = 0.95
const REFERENCE_FPS = 60
const POINTER_GAIN = 100

const createGridUniforms = ({ cells, relaxation, radius }) => ({
  uMouse: new Uniform(new Vector2()),
  uDeltaMouse: new Uniform(new Vector2()),
  uMouseMove: new Uniform(0),
  uRelaxation: new Uniform(relaxation),
  uGridSize: new Uniform(cells),
  uDistance: new Uniform(radius)
})

export const createGridSimulation = (renderer, params) => {
  const computation = new GPUComputationRenderer(params.cells, params.cells, renderer)
  // Half floats are linearly filterable everywhere; full floats need an extension
  computation.setDataType(HalfFloatType)

  const variable = computation.addVariable('uGrid', gpgpuShader, computation.createTexture())
  const filter = params.smooth ? LinearFilter : NearestFilter
  variable.minFilter = filter
  variable.magFilter = filter
  Object.assign(variable.material.uniforms, createGridUniforms(params))
  computation.setVariableDependencies(variable, [variable])

  const error = computation.init()
  if (error) console.error(error)

  return { computation, variable }
}

export const getGridTexture = ({ computation, variable }) =>
  computation.getCurrentRenderTarget(variable).texture

// Decays are tuned per 60 fps frame, so scale them by the real frame time
export const stepGridSimulation = ({ computation, variable }, params, delta) => {
  const { uniforms } = variable.material
  const frames = delta * REFERENCE_FPS

  uniforms.uRelaxation.value = params.relaxation ** frames
  uniforms.uMouseMove.value *= MOUSE_MOVE_DECAY ** frames
  uniforms.uDeltaMouse.value.multiplyScalar(uniforms.uRelaxation.value)
  uniforms.uDistance.value = params.radius

  computation.compute()
}

export const placeGridPointer = ({ variable }, gridUv) => {
  variable.material.uniforms.uMouse.value.copy(gridUv)
}

export const pushGridPointer = ({ variable }, gridUv, strength) => {
  const { uMouse, uDeltaMouse, uMouseMove } = variable.material.uniforms

  uDeltaMouse.value.subVectors(gridUv, uMouse.value).multiplyScalar(strength * POINTER_GAIN)
  uMouse.value.copy(gridUv)
  uMouseMove.value = 1
}

// Same mapping as getGridUv in fragment.glsl, so the brush lands under the cursor
export const toGridUv = (uv, aspect, target) => {
  const ratioX = Math.min(aspect, 1)
  const ratioY = Math.min(1 / aspect, 1)

  return target.set(uv.x * ratioX + (1 - ratioX) / 2, uv.y * ratioY + (1 - ratioY) / 2)
}
