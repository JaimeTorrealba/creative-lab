import {
  Color,
  CustomBlending,
  DepthFormat,
  DepthTexture,
  DoubleSide,
  HalfFloatType,
  MaxEquation,
  NearestFilter,
  NoBlending,
  OneFactor,
  RGBAFormat,
  ShaderMaterial,
  UnsignedIntType,
  Vector2,
  Vector3,
  WebGLRenderTarget
} from 'three'
import { FullScreenQuad } from 'three/examples/jsm/postprocessing/Pass.js'

import fullscreenVertex from './fullscreen_vertex.glsl'
import gbufferVertex from './gbuffer_vertex.glsl'
import gbufferFragment from './gbuffer_fragment.glsl'
import edgesFragment from './edges_fragment.glsl'
import shadeVertex from './shade_vertex.glsl'
import shadeFragment from './shade_fragment.glsl'
import blueprintFragment from './blueprint_fragment.glsl'
import sketchyFragment from './sketchy_fragment.glsl'
import debugFragment from './debug_fragment.glsl'

export const MODE = { BLUEPRINT: 0, SKETCHY: 1 }
export const DEBUG = { FINAL: 0, EDGE: 1, SHADE: 2, NORMALS: 3, DEPTH: 4 }

// The G-buffer holds a view normal in rgb and linear view depth in a. Half float
// because 8 bits of alpha cannot carry usable depth, while a float colour buffer
// would need EXT_color_buffer_float. The peel comparison never reads this alpha —
// it reads the attached 24-bit depth texture — so peeling precision is unaffected.
const createGBufferTarget = () => {
  const target = new WebGLRenderTarget(1, 1, {
    format: RGBAFormat,
    type: HalfFloatType,
    minFilter: NearestFilter,
    magFilter: NearestFilter,
    depthBuffer: true,
    stencilBuffer: false,
    generateMipmaps: false
  })

  target.depthTexture = new DepthTexture(1, 1)
  target.depthTexture.format = DepthFormat
  target.depthTexture.type = UnsignedIntType

  return target
}

const createColorTarget = (depthBuffer) =>
  new WebGLRenderTarget(1, 1, {
    format: RGBAFormat,
    minFilter: NearestFilter,
    magFilter: NearestFilter,
    depthBuffer,
    stencilBuffer: false,
    generateMipmaps: false
  })

// A degree of uncertainty, as GPU Gems 2 15.3 describes it: a user-defined 2x2 matrix
// that weights the turbulence offset before it translates the texture coordinates.
// Column-major, which is the layout three uploads a mat2 in.
export const setUncertainty = (matrix, amount, angle) => {
  const cos = Math.cos(angle) * amount
  const sin = Math.sin(angle) * amount
  matrix[0] = cos
  matrix[1] = sin
  matrix[2] = -sin
  matrix[3] = cos
}

export const createPipeline = () => {
  const resolution = new Vector2(1, 1)

  let gbufferRead = createGBufferTarget()
  let gbufferWrite = createGBufferTarget()
  const edgeTarget = createColorTarget(false)
  // The shade map is a real scene render, so it needs a depth buffer of its own.
  const shadeTarget = createColorTarget(true)

  const gbufferUniforms = {
    uPrevDepth: { value: null },
    uResolution: { value: resolution },
    uPeel: { value: 0 },
    uNear: { value: 0.1 },
    uFar: { value: 100 }
  }

  const edgeUniforms = {
    uGBuffer: { value: null },
    uResolution: { value: resolution },
    uLineWidth: { value: 1 },
    uNormalThreshold: { value: 0.35 },
    uDepthThreshold: { value: 0.0035 },
    uWeight: { value: 1 }
  }

  // Shared by reference across every shade material instance, so the pane drives all
  // of them at once while each keeps its own uBaseColor.
  const shadeUniforms = {
    uLightDirection: { value: new Vector3(0.45, 0.7, 0.85).normalize() },
    uBands: { value: 3 },
    uGraphite: { value: 0 }
  }

  const blueprintUniforms = {
    uEdge: { value: edgeTarget.texture },
    uPaperColor: { value: new Color('#0d2f63') },
    uLineColor: { value: new Color('#cfe4ff') },
    uLineStrength: { value: 1.35 },
    uGrid: { value: 1 },
    uGridSpacing: { value: 24 }
  }

  const sketchyUniforms = {
    uEdge: { value: edgeTarget.texture },
    uShade: { value: shadeTarget.texture },
    uEdgeMatrix: { value: new Float32Array(4) },
    uShadeMatrix: { value: new Float32Array(4) },
    uInkColor: { value: new Color('#25201c') },
    uLineStrength: { value: 1.5 },
    uNoiseScale: { value: 4.5 },
    uOctaves: { value: 3 },
    uRepeat: { value: 1 },
    uGrain: { value: 0.45 },
    uSeed: { value: 0 }
  }

  const debugUniforms = {
    uEdge: { value: edgeTarget.texture },
    uShade: { value: shadeTarget.texture },
    uGBuffer: { value: null },
    uMode: { value: DEBUG.EDGE }
  }

  const gbufferMaterial = new ShaderMaterial({
    vertexShader: gbufferVertex,
    fragmentShader: gbufferFragment,
    uniforms: gbufferUniforms,
    // Double-sided so the far side of a closed hull peels into a layer of its own,
    // which is what gives the blueprint its back-face outlines.
    side: DoubleSide,
    blending: NoBlending
  })

  const fullscreenMaterial = (fragmentShader, uniforms) =>
    new ShaderMaterial({
      vertexShader: fullscreenVertex,
      fragmentShader,
      uniforms,
      depthTest: false,
      depthWrite: false
    })

  const edgeMaterial = fullscreenMaterial(edgesFragment, edgeUniforms)
  // Each layer's edge map is folded into the accumulation buffer with a max, so the
  // strongest contribution at a pixel wins and repeated passes never oversaturate.
  edgeMaterial.blending = CustomBlending
  edgeMaterial.blendEquation = MaxEquation
  edgeMaterial.blendSrc = OneFactor
  edgeMaterial.blendDst = OneFactor

  const blueprintMaterial = fullscreenMaterial(blueprintFragment, blueprintUniforms)
  const sketchyMaterial = fullscreenMaterial(sketchyFragment, sketchyUniforms)
  const debugMaterial = fullscreenMaterial(debugFragment, debugUniforms)

  const quad = new FullScreenQuad(edgeMaterial)

  const shadeMaterials = []

  // Spreading shadeUniforms keeps the { value } objects by reference, so one pane
  // control drives every part while each keeps its own uBaseColor.
  const createShadeMaterial = (color) => {
    const material = new ShaderMaterial({
      vertexShader: shadeVertex,
      fragmentShader: shadeFragment,
      uniforms: { ...shadeUniforms, uBaseColor: { value: new Color(color) } },
      side: DoubleSide
    })
    shadeMaterials.push(material)
    return material
  }

  const paperColor = new Color('#f2ebdd')
  const clearColor = new Color()
  const black = new Color(0x000000)

  const setSize = (width, height) => {
    resolution.set(width, height)
    gbufferRead.setSize(width, height)
    gbufferWrite.setSize(width, height)
    edgeTarget.setSize(width, height)
    shadeTarget.setSize(width, height)
  }

  const drawQuad = (renderer, material) => {
    quad.material = material
    quad.render(renderer)
  }

  const render = ({ renderer, scene, camera, mode, debug, layers, layerFade }) => {
    const previousAutoClear = renderer.autoClear
    const previousOverride = scene.overrideMaterial
    const previousAlpha = renderer.getClearAlpha()
    renderer.getClearColor(clearColor)

    // Every clear below is explicit: the edge buffer accumulates across layers and
    // must survive the quad draws that write into it.
    renderer.autoClear = false

    renderer.setRenderTarget(edgeTarget)
    renderer.setClearColor(black, 1)
    renderer.clear(true, false, false)

    gbufferUniforms.uNear.value = camera.near
    gbufferUniforms.uFar.value = camera.far
    scene.overrideMaterial = gbufferMaterial

    for (let layer = 0; layer < layers; layer++) {
      gbufferUniforms.uPeel.value = layer === 0 ? 0 : 1
      gbufferUniforms.uPrevDepth.value = gbufferRead.depthTexture

      renderer.setRenderTarget(gbufferWrite)
      // Alpha zero is the background sentinel the edge pass tests for.
      renderer.setClearColor(black, 0)
      renderer.clear(true, true, false)
      renderer.render(scene, camera)

      edgeUniforms.uGBuffer.value = gbufferWrite.texture
      // Deeper layers contribute fainter line work, so the outer shell still reads
      // as the nearest thing on the page.
      edgeUniforms.uWeight.value = Math.pow(layerFade, layer)
      renderer.setRenderTarget(edgeTarget)
      drawQuad(renderer, edgeMaterial)

      const swap = gbufferRead
      gbufferRead = gbufferWrite
      gbufferWrite = swap
    }

    scene.overrideMaterial = previousOverride
    // gbufferRead holds the last layer written, thanks to the swap above.
    debugUniforms.uGBuffer.value = gbufferRead.texture

    if (mode === MODE.SKETCHY || debug === DEBUG.SHADE) {
      renderer.setRenderTarget(shadeTarget)
      // Clearing to the paper colour means the sketchy composite gets its background
      // straight out of the shade map, so a perturbed lookup near the silhouette
      // blends patch into paper instead of into black.
      renderer.setClearColor(paperColor, 1)
      renderer.clear(true, true, false)
      renderer.render(scene, camera)
    }

    renderer.setRenderTarget(null)
    renderer.setClearColor(clearColor, previousAlpha)
    renderer.clear(true, true, false)

    if (debug !== DEBUG.FINAL) {
      debugUniforms.uMode.value = debug
      drawQuad(renderer, debugMaterial)
    } else {
      drawQuad(renderer, mode === MODE.SKETCHY ? sketchyMaterial : blueprintMaterial)
    }

    renderer.autoClear = previousAutoClear
  }

  const dispose = () => {
    gbufferRead.depthTexture.dispose()
    gbufferWrite.depthTexture.dispose()
    gbufferRead.dispose()
    gbufferWrite.dispose()
    edgeTarget.dispose()
    shadeTarget.dispose()

    shadeMaterials.forEach((material) => material.dispose())
    gbufferMaterial.dispose()
    edgeMaterial.dispose()
    blueprintMaterial.dispose()
    sketchyMaterial.dispose()
    debugMaterial.dispose()
    quad.dispose()
  }

  return {
    edgeUniforms,
    shadeUniforms,
    blueprintUniforms,
    sketchyUniforms,
    paperColor,
    createShadeMaterial,
    setSize,
    render,
    dispose
  }
}
