import { DoubleSide, FrontSide, GLSL3, ShaderMaterial, Vector3 } from 'three'

import fullscreenVertex from './shaders/fullscreenVertex.glsl'
import atlasVertex from './shaders/atlasVertex.glsl'
import emissionFragment from './shaders/emissionFragment.glsl'
import reconstructFragment from './shaders/reconstructFragment.glsl'
import reduceFragment from './shaders/reduceFragment.glsl'
import itemVertex from './shaders/itemVertex.glsl'
import itemFragment from './shaders/itemFragment.glsl'
import itemDebugFragment from './shaders/itemDebugFragment.glsl'
import displayVertex from './shaders/displayVertex.glsl'
import displayFragment from './shaders/displayFragment.glsl'
import { MAX_SHOOTERS } from './shooterSelection'

export const ITEM_FAR = 8

const createComputeMaterial = (vertexShader, fragmentShader, uniforms, extra = {}) =>
  new ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms,
    side: DoubleSide,
    depthTest: false,
    depthWrite: false,
    ...extra
  })

const createAtlasMaterials = () => ({
  emission: createComputeMaterial(atlasVertex, emissionFragment, {}, { glslVersion: GLSL3 }),
  reconstruct: createComputeMaterial(
    atlasVertex,
    reconstructFragment,
    {
      uRadiosity: { value: null },
      uResidual: { value: null },
      uShooterEnergy: { value: null },
      uShooters: { value: null },
      uItemBuffer: { value: null },
      uShooterCount: { value: 0 },
      uBlock: { value: 1 },
      uItemResolution: { value: 256 },
      uPixelAngle: { value: 4 / 256 },
      uDepthTolerance: { value: 1.5 },
      uShotFade: { value: 0.9 },
      uSoftVisibility: { value: true }
    },
    { glslVersion: GLSL3, defines: { MAX_SHOOTERS } }
  )
})

const createItemMaterial = () =>
  new ShaderMaterial({
    glslVersion: GLSL3,
    vertexShader: itemVertex,
    fragmentShader: itemFragment,
    uniforms: {
      uShooterPosition: { value: new Vector3() },
      uShooterTangent: { value: new Vector3() },
      uShooterBitangent: { value: new Vector3() },
      uShooterNormal: { value: new Vector3() },
      uFar: { value: ITEM_FAR }
    },
    side: DoubleSide
  })

const createDisplayMaterial = () =>
  new ShaderMaterial({
    vertexShader: displayVertex,
    fragmentShader: displayFragment,
    uniforms: {
      uRadiosity: { value: null },
      uResidual: { value: null },
      uAmbient: { value: new Vector3() },
      uResidualGain: { value: 4 },
      uView: { value: 0 }
    },
    side: FrontSide
  })

export const createRadiosityMaterials = () => {
  const materials = {
    ...createAtlasMaterials(),
    item: createItemMaterial(),
    reduce: createComputeMaterial(fullscreenVertex, reduceFragment, {
      uResidual: { value: null },
      uBlock: { value: 1 }
    }),
    itemDebug: createComputeMaterial(fullscreenVertex, itemDebugFragment, {
      uItemBuffer: { value: null }
    }),
    display: createDisplayMaterial()
  }
  materials.dispose = () =>
    Object.values(materials).forEach((material) => material.isMaterial && material.dispose())
  return materials
}
