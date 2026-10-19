import {
  AddEquation,
  CustomBlending,
  DoubleSide,
  GLSL3,
  HalfFloatType,
  LinearFilter,
  Mesh,
  OneFactor,
  OrthographicCamera,
  RGBAFormat,
  Scene,
  ShaderMaterial,
  Vector2,
  Vector3,
  WebGLRenderTarget
} from 'three'

import shadowVertex from './shadowVertex.glsl'
import shadowFragment from './shadowFragment.glsl'

// Opacity shadow maps, GPU Gems 2 ch. 23 §23.4.
//
// The chapter accumulates hair density into 16 depth slices in light space and reads
// transmittance back as exp(-k * density). It needed four render passes to fill 16 channels
// through MRT; three.js exposes `count` on a render target, so four RGBA attachments give all
// 16 channels in a single pass.
export const SLICES = 16

export const createShadowPipeline = ({ guideTexture, guideSize }) => {
  const camera = new OrthographicCamera(-1, 1, 1, -1, 0.1, 100)
  const scene = new Scene()
  const direction = new Vector3()
  const center = new Vector3()

  // Shared by reference with the main hair material so one update drives both.
  const uniforms = {
    uLightMatrix: { value: camera.projectionMatrix.clone() },
    uShadowNear: { value: 0 },
    uShadowFar: { value: 1 },
    uSlice0: { value: null },
    uSlice1: { value: null },
    uSlice2: { value: null },
    uSlice3: { value: null },
    uShadowStrength: { value: 5.5 },
    uShadowEnabled: { value: 1 }
  }

  const shadowUniforms = {
    uGuides: { value: guideTexture },
    uGuideSize: { value: guideSize },
    uWidth: { value: 0.02 },
    uTipTaper: { value: 0.75 },
    uCurlAmount: { value: 0.12 },
    uCurlFrequency: { value: 1.1 },
    uClumping: { value: 0.35 },
    uLightDir: { value: direction },
    uShadowNear: uniforms.uShadowNear,
    uShadowFar: uniforms.uShadowFar,
    uStrandOpacity: { value: 0.06 }
  }

  const material = new ShaderMaterial({
    glslVersion: GLSL3,
    vertexShader: shadowVertex,
    fragmentShader: shadowFragment,
    uniforms: shadowUniforms,
    // The accumulation across overlapping strands *is* the density integral, so there is no
    // depth test and every fragment adds rather than replaces.
    //
    // CustomBlending One/One rather than AdditiveBlending, which is SRC_ALPHA/ONE: the alpha
    // channel here carries slice data, not coverage, so it must not scale the other channels.
    blending: CustomBlending,
    blendEquation: AddEquation,
    blendSrc: OneFactor,
    blendDst: OneFactor,
    depthTest: false,
    depthWrite: false,
    transparent: true,
    // Essential. The shadow ribbon expands along cross(T, lightDir), so its winding is
    // consistent across every strand — with the default FrontSide the entire head of hair is
    // back-facing from the light and all 81k triangles are culled into an empty map.
    side: DoubleSide
  })

  let target = null
  let mesh = null
  let size = 0

  const setSize = (next) => {
    if (size === next && target) return
    size = next
    target?.dispose()
    target = new WebGLRenderTarget(size, size, {
      count: 4,
      format: RGBAFormat,
      type: HalfFloatType,
      minFilter: LinearFilter,
      magFilter: LinearFilter,
      depthBuffer: false,
      stencilBuffer: false,
      generateMipmaps: false
    })
    uniforms.uSlice0.value = target.textures[0]
    uniforms.uSlice1.value = target.textures[1]
    uniforms.uSlice2.value = target.textures[2]
    uniforms.uSlice3.value = target.textures[3]
  }

  const setGeometry = (geometry) => {
    if (mesh) scene.remove(mesh)
    mesh = new Mesh(geometry, material)
    mesh.frustumCulled = false
    scene.add(mesh)
  }

  const setGuides = (texture, width, height) => {
    shadowUniforms.uGuides.value = texture
    shadowUniforms.uGuideSize.value.set(width, height)
  }

  // Keep the shaping uniforms in lockstep with the main pass, or the shadows describe a
  // different head of hair than the one on screen.
  //
  // Width is the deliberate exception. At the camera's strand width the shadow ribbons land
  // sub-pixel in the map and almost no density accumulates, so they are fattened: the map is
  // measuring how much hair is in the way, not reproducing the silhouette.
  const syncShape = (main, widthScale, opacity) => {
    shadowUniforms.uStrandOpacity.value = opacity
    shadowUniforms.uWidth.value = main.uWidth.value * widthScale
    shadowUniforms.uTipTaper.value = main.uTipTaper.value
    shadowUniforms.uCurlAmount.value = main.uCurlAmount.value
    shadowUniforms.uCurlFrequency.value = main.uCurlFrequency.value
    shadowUniforms.uClumping.value = main.uClumping.value
  }

  const render = (renderer, lightPos, headPos, extent) => {
    if (!mesh || !target) return

    center.copy(headPos)
    direction.copy(lightPos).sub(center)
    const distance = Math.max(direction.length(), 1e-3)
    direction.divideScalar(distance)

    camera.position.copy(center).addScaledVector(direction, extent * 2)
    camera.lookAt(center)
    camera.left = -extent
    camera.right = extent
    camera.top = extent
    camera.bottom = -extent
    camera.near = extent * 0.5
    camera.far = extent * 3.5
    camera.updateProjectionMatrix()
    camera.updateMatrixWorld(true)

    uniforms.uShadowNear.value = extent * 0.5
    uniforms.uShadowFar.value = extent * 3.5
    uniforms.uLightMatrix.value
      .copy(camera.projectionMatrix)
      .multiply(camera.matrixWorldInverse)

    const previousTarget = renderer.getRenderTarget()
    renderer.setRenderTarget(target)
    renderer.setClearColor(0x000000, 0)
    renderer.clear(true, false, false)
    renderer.render(scene, camera)
    renderer.setRenderTarget(previousTarget)
  }

  const dispose = () => {
    target?.dispose()
    material.dispose()
  }

  setSize(512)

  return { uniforms, shadowUniforms, setSize, setGeometry, setGuides, syncShape, render, dispose }
}

export const createShadowGuideSize = (w, h) => new Vector2(w, h)
