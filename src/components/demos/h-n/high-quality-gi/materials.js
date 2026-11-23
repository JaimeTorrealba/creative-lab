import {
  AddEquation,
  BackSide,
  Color,
  CustomBlending,
  DoubleSide,
  GLSL3,
  Matrix4,
  OneFactor,
  ShaderMaterial,
  Vector2,
  Vector3
} from 'three'

import lighting from './shaders/lighting.glsl'
import shadowVertex from './shaders/shadowVertex.glsl'
import shadowFragment from './shaders/shadowFragment.glsl'
import surfaceVertex from './shaders/surfaceVertex.glsl'
import layerFragment from './shaders/layerFragment.glsl'
import gbufferFragment from './shaders/gbufferFragment.glsl'
import fullscreenVertex from './shaders/fullscreenVertex.glsl'
import gatherFragment from './shaders/gatherFragment.glsl'
import accumulateFragment from './shaders/accumulateFragment.glsl'
import historyFragment from './shaders/historyFragment.glsl'
import resolveFragment from './shaders/resolveFragment.glsl'
import compositeFragment from './shaders/compositeFragment.glsl'
import presentFragment from './shaders/presentFragment.glsl'

export const createLightUniforms = (lightPosition) => ({
  uShadowMap: { value: null },
  uLightViewProjection: { value: new Matrix4() },
  uLightPosition: { value: lightPosition },
  uLightColor: { value: new Color() },
  uLightPower: { value: 1 },
  uShadowSoftness: { value: 0.004 },
  uShadowBias: { value: 0.002 },
  uShadowNormalOffset: { value: 1 },
  uShadowMapSize: { value: 1024 },
  uShadowTexelAngle: { value: 0.01 },
  uLightInverseViewProjection: { value: new Matrix4() }
})

const createFullscreenMaterial = (fragmentShader, uniforms, extra = {}) =>
  new ShaderMaterial({
    vertexShader: fullscreenVertex,
    fragmentShader,
    uniforms,
    depthTest: false,
    depthWrite: false,
    ...extra
  })

const createSceneMaterials = (lightUniforms) => {
  const uVertexIrradiance = { value: null }

  const shadow = new ShaderMaterial({
    vertexShader: shadowVertex,
    fragmentShader: shadowFragment,
    uniforms: { uLightPosition: lightUniforms.uLightPosition },
    side: DoubleSide
  })

  const layer = new ShaderMaterial({
    vertexShader: surfaceVertex,
    fragmentShader: lighting + layerFragment,
    uniforms: {
      ...lightUniforms,
      uVertexIrradiance,
      uPreviousLayer: { value: null },
      uCameraPosition: { value: new Vector3() },
      uRayDirection: { value: new Vector3() },
      uPeel: { value: 0 },
      uPeelEpsilon: { value: 0.002 },
      uUseFirstPass: { value: 1 }
    },
    // From inside the room, the nearest hit along a ray is always a face turned back toward the ray
    // origin. Seen from the bundle camera those are exactly the back faces, so rasterising only
    // them gives the same nearest hits with half the depth complexity, and fewer layers to peel.
    side: BackSide
  })

  const gbuffer = new ShaderMaterial({
    glslVersion: GLSL3,
    vertexShader: surfaceVertex,
    fragmentShader: gbufferFragment,
    uniforms: { uVertexIrradiance }
  })

  return { shadow, layer, gbuffer, uVertexIrradiance }
}

const createPassMaterials = (lightUniforms) => {
  const gather = createFullscreenMaterial(gatherFragment, {
    uPositions: { value: null },
    uNormals: { value: null },
    uLayer: { value: null },
    uBundleViewProjection: { value: new Matrix4() },
    uCameraPosition: { value: new Vector3() },
    uRayDirection: { value: new Vector3() },
    uLayerSize: { value: 512 },
    uTexelWorld: { value: 0.01 },
    uNormalBias: { value: 0.01 },
    uSlopeBias: { value: 1.5 }
  })

  const accumulate = createFullscreenMaterial(
    accumulateFragment,
    {
      uPositions: { value: null },
      uNormals: { value: null },
      uHits: { value: null },
      uRayDirection: { value: new Vector3() },
      uEnvironment: { value: new Color() }
    },
    {
      blending: CustomBlending,
      blendEquation: AddEquation,
      blendSrc: OneFactor,
      blendDst: OneFactor
    }
  )

  const history = createFullscreenMaterial(historyFragment, {
    uPrevious: { value: null },
    uFrame: { value: null },
    uDecay: { value: 1 }
  })

  const resolve = createFullscreenMaterial(lighting + resolveFragment, {
    ...lightUniforms,
    uHistory: { value: null }
  })

  const composite = createFullscreenMaterial(lighting + compositeFragment, {
    ...lightUniforms,
    uPositions: { value: null },
    uNormals: { value: null },
    uAlbedo: { value: null },
    uFirstPass: { value: null },
    uGather: { value: null },
    uDebugLayer: { value: null },
    uResolution: { value: new Vector2(1, 1) },
    uGatherMix: { value: 0 },
    uExposure: { value: 1 },
    uView: { value: 0 },
    uPreviousColor: { value: null },
    uColorWeight: { value: 1 }
  })

  const present = createFullscreenMaterial(presentFragment, { uColor: { value: null } })

  return { gather, accumulate, history, resolve, composite, present }
}

export const createMaterials = (lightUniforms) => {
  const materials = {
    ...createSceneMaterials(lightUniforms),
    ...createPassMaterials(lightUniforms)
  }
  materials.dispose = () =>
    Object.values(materials).forEach((material) => material?.isMaterial && material.dispose())
  return materials
}
