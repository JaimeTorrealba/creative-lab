import {
  Color,
  HalfFloatType,
  LinearFilter,
  MeshNormalMaterial,
  NearestFilter,
  RGBAFormat,
  ShaderMaterial,
  Vector2,
  WebGLRenderTarget
} from 'three'
import { FullScreenQuad } from 'three/examples/jsm/postprocessing/Pass.js'

import vertexShader from './vertex.glsl'
import fragmentShader from './fragment.glsl'

export const VIEW = { FINAL: 0, LINES: 1, NORMALS: 2, SCENE: 3 }

const createBufferTarget = (filter) =>
  new WebGLRenderTarget(1, 1, {
    format: RGBAFormat,
    type: HalfFloatType,
    minFilter: filter,
    magFilter: filter,
    depthBuffer: true,
    stencilBuffer: false,
    generateMipmaps: false
  })

export const createPencilLinesPass = () => {
  const sceneTarget = createBufferTarget(LinearFilter)
  const surfaceTarget = createBufferTarget(NearestFilter)
  const normalMaterial = new MeshNormalMaterial()

  const uniforms = {
    uDiffuse: { value: sceneTarget.texture },
    uSurfaceBuffer: { value: surfaceTarget.texture },
    uCloudTexture: { value: null },
    uResolution: { value: new Vector2(1, 1) },
    uLineColor: { value: new Color('#29101a') },
    uDiffuseWeight: { value: 0.6 },
    uNormalWeight: { value: 0.3 },
    uDiffuseWobble: { value: 1 / 40 },
    uNormalWobble: { value: 1 / 50 },
    uGrain: { value: 10 },
    uEdgeLow: { value: 0.01 },
    uEdgeHigh: { value: 0.03 },
    uView: { value: VIEW.FINAL }
  }

  const material = new ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms,
    depthTest: false,
    depthWrite: false
  })
  const quad = new FullScreenQuad(material)

  const setSize = (width, height) => {
    uniforms.uResolution.value.set(width, height)
    sceneTarget.setSize(width, height)
    surfaceTarget.setSize(width, height)
  }

  const renderScene = (renderer, scene, camera, target) => {
    renderer.setRenderTarget(target)
    renderer.clear()
    renderer.render(scene, camera)
  }

  const render = ({ renderer, scene, camera }) => {
    const previousAutoClear = renderer.autoClear
    const previousOverride = scene.overrideMaterial
    renderer.autoClear = false

    renderScene(renderer, scene, camera, sceneTarget)

    scene.overrideMaterial = normalMaterial
    renderScene(renderer, scene, camera, surfaceTarget)
    scene.overrideMaterial = previousOverride

    renderer.setRenderTarget(null)
    renderer.clear()
    quad.render(renderer)

    renderer.autoClear = previousAutoClear
  }

  const dispose = () => {
    sceneTarget.dispose()
    surfaceTarget.dispose()
    normalMaterial.dispose()
    material.dispose()
    quad.dispose()
  }

  return { uniforms, setSize, render, dispose }
}
