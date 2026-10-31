import { Uniform, Vector3 } from 'three'
import { GPUComputationRenderer } from 'three/addons/misc/GPUComputationRenderer.js'
import simPositionShader from './simPosition.glsl'
import simVelocityShader from './simVelocity.glsl'
import { sampleShapeSurface } from './particleSampler'

const createVelocityUniforms = (originalTexture) => ({
  uOriginalPosition: new Uniform(originalTexture),
  uMouse: new Uniform(new Vector3(0, 0, 100)),
  uMouseSpeed: new Uniform(0),
  uMouseRadius: new Uniform(0),
  uMouseStrength: new Uniform(0),
  uForce: new Uniform(0),
  uAttraction: new Uniform(0)
})

export const createParticleSimulation = (renderer, shapeGeometry, textureSize) => {
  const computation = new GPUComputationRenderer(textureSize, textureSize, renderer)
  const originalTexture = computation.createTexture()
  const particleGeometry = sampleShapeSurface(
    shapeGeometry,
    textureSize,
    originalTexture.image.data
  )

  const positionVariable = computation.addVariable(
    'uCurrentPosition',
    simPositionShader,
    originalTexture
  )
  const velocityVariable = computation.addVariable(
    'uCurrentVelocity',
    simVelocityShader,
    computation.createTexture()
  )
  const variables = [positionVariable, velocityVariable]
  computation.setVariableDependencies(positionVariable, variables)
  computation.setVariableDependencies(velocityVariable, variables)
  Object.assign(velocityVariable.material.uniforms, createVelocityUniforms(originalTexture))

  const error = computation.init()
  if (error) console.error(error)

  return { computation, positionVariable, velocityVariable, originalTexture, particleGeometry }
}

export const getSimulationTextures = ({ computation, positionVariable, velocityVariable }) => ({
  position: computation.getCurrentRenderTarget(positionVariable).texture,
  velocity: computation.getCurrentRenderTarget(velocityVariable).texture
})

export const stepParticleSimulation = ({ computation, velocityVariable }, params) => {
  const { uniforms } = velocityVariable.material

  uniforms.uMouseSpeed.value *= params.mouseDecay
  uniforms.uMouseRadius.value = params.mouseRadius
  uniforms.uMouseStrength.value = params.mouseStrength
  uniforms.uForce.value = params.force
  uniforms.uAttraction.value = params.attraction

  computation.compute()
}

export const pushParticlesFrom = ({ velocityVariable }, point) => {
  const { uMouse, uMouseSpeed } = velocityVariable.material.uniforms
  uMouse.value.copy(point)
  uMouseSpeed.value = 1
}

export const disposeParticleSimulation = (simulation) => {
  simulation.computation.dispose()
  simulation.originalTexture.dispose()
  simulation.particleGeometry.dispose()
}
