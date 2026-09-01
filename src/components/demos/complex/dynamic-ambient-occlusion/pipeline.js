import {
  Color,
  FloatType,
  GLSL3,
  HalfFloatType,
  Matrix4,
  NearestFilter,
  RGBAFormat,
  ShaderMaterial,
  Vector3,
  WebGLRenderTarget
} from 'three'
import { FullScreenQuad } from 'three/examples/jsm/postprocessing/Pass.js'

import fullscreenVertex from './fullscreen_vertex.glsl'
import transformFragment from './transform_fragment.glsl'
import accessibilityFragment from './accessibility_fragment.glsl'
import reduceFragment from './reduce_fragment.glsl'
import bounceFragment from './bounce_fragment.glsl'
import shadeVertex from './shade_vertex.glsl'
import shadeFragment from './shade_fragment.glsl'
import surfelVertex from './surfel_vertex.glsl'
import surfelFragment from './surfel_fragment.glsl'

export const MAX_OBJECTS = 8
export const DEBUG = { FINAL: 0, ACCESS: 1, BENT: 2, INDIRECT: 3, SURFELS: 4 }

// Fixed at what the chapter recommends rather than exposed. PASSES is the corrected solve plus the
// weighted average that 14.3.1 calls for, BOUNCES is as far as a real-time gather is worth taking,
// and KAPPA is the "four times the radius of the emitter" from 14.3.3.
const PASSES = 3
const BOUNCES = 2
const KAPPA = 4

const createTarget = (size, type) =>
  new WebGLRenderTarget(size, size, {
    format: RGBAFormat,
    type,
    minFilter: NearestFilter,
    magFilter: NearestFilter,
    depthBuffer: false,
    stencilBuffer: false,
    generateMipmaps: false
  })

export const createPipeline = () => {
  // Shared by reference with every material that needs them, so one pane control drives the solve and
  // the shading at once.
  const albedos = Array.from({ length: MAX_OBJECTS }, () => new Color('#cccccc'))
  const matrices = Array.from({ length: MAX_OBJECTS }, () => new Matrix4())
  const lightDirection = new Vector3(0.48, 0.76, 0.44).normalize()
  const lightColor = new Color('#fff4e2')

  let elements = null
  let targets = null
  let clusterSize = 32
  let positionType = FloatType

  const transformUniforms = {
    uBasePos: { value: null },
    uBaseNrm: { value: null },
    uParentBasePos: { value: null },
    uParentBaseNrm: { value: null },
    uMatrices: { value: matrices },
    uElementSide: { value: 1 },
    uParentSide: { value: 1 },
    uClusterCount: { value: 0 },
    uMode: { value: 0 },
    uOutput: { value: 0 }
  }

  const accessUniforms = {
    uPos: { value: null },
    uNrm: { value: null },
    uParentPos: { value: null },
    uParentNrm: { value: null },
    uParentAccess: { value: null },
    uPrevAccess: { value: null },
    uFirstAccess: { value: null },
    uElementSide: { value: 1 },
    uParentSide: { value: 1 },
    uClusterCount: { value: 0 },
    uHierarchy: { value: 1 },
    uUsePrev: { value: 0 },
    uMixFirst: { value: 0 },
    uBlend: { value: 0.65 },
    uKappa: { value: 4 }
  }

  const reduceUniforms = {
    uPos: { value: null },
    uNrm: { value: null },
    uAccess: { value: null },
    uIndirect: { value: null },
    uAlbedo: { value: albedos },
    uLightDirection: { value: lightDirection },
    uLightColor: { value: lightColor },
    uElementSide: { value: 1 },
    uParentSide: { value: 1 },
    uClusterCount: { value: 0 },
    uUseIndirect: { value: 0 }
  }

  const bounceUniforms = {
    uPos: { value: null },
    uNrm: { value: null },
    uParentPos: { value: null },
    uParentNrm: { value: null },
    uParentAccess: { value: null },
    uAccess: { value: null },
    uIndirect: { value: null },
    uAlbedo: { value: albedos },
    uLightDirection: { value: lightDirection },
    uLightColor: { value: lightColor },
    uElementSide: { value: 1 },
    uParentSide: { value: 1 },
    uClusterCount: { value: 0 },
    uHierarchy: { value: 1 },
    uUseIndirect: { value: 0 },
    uKappa: { value: 4 }
  }

  const shadeUniforms = {
    uAccess: { value: null },
    uIndirect: { value: null },
    uLightDirection: { value: lightDirection },
    uLightColor: { value: lightColor },
    uSkyColor: { value: new Color('#5d7a9c') },
    uGroundColor: { value: new Color('#1d1a17') },
    uAmbient: { value: 1 },
    uAOStrength: { value: 1 },
    uIndirectStrength: { value: 1 },
    uDebug: { value: DEBUG.FINAL }
  }

  const surfelUniforms = {
    uPos: { value: null },
    uAccess: { value: null },
    uProjectionScale: { value: 500 },
    uDiskScale: { value: 1 }
  }

  const computeMaterial = (fragmentShader, uniforms) =>
    new ShaderMaterial({
      glslVersion: GLSL3,
      vertexShader: fullscreenVertex,
      fragmentShader,
      uniforms,
      defines: { CLUSTER_SIZE: clusterSize, MAX_OBJECTS },
      depthTest: false,
      depthWrite: false
    })

  const transformMaterial = computeMaterial(transformFragment, transformUniforms)
  const accessMaterial = computeMaterial(accessibilityFragment, accessUniforms)
  const reduceMaterial = computeMaterial(reduceFragment, reduceUniforms)
  const bounceMaterial = computeMaterial(bounceFragment, bounceUniforms)
  const computeMaterials = [transformMaterial, accessMaterial, reduceMaterial, bounceMaterial]

  const surfelMaterial = new ShaderMaterial({
    glslVersion: GLSL3,
    vertexShader: surfelVertex,
    fragmentShader: surfelFragment,
    uniforms: surfelUniforms
  })

  const shadeMaterials = []
  const quad = new FullScreenQuad(transformMaterial)
  const black = new Color(0x000000)
  const previousClear = new Color()

  // Spreading the shared uniforms keeps every { value } object by reference; only the albedo is per
  // object, and even that points at the same Color the solve reads.
  const createShadeMaterial = (objectId, color) => {
    albedos[objectId].set(color)

    const material = new ShaderMaterial({
      glslVersion: GLSL3,
      vertexShader: shadeVertex,
      fragmentShader: shadeFragment,
      uniforms: { ...shadeUniforms, uAlbedo: { value: albedos[objectId] } }
    })

    shadeMaterials.push(material)
    return material
  }

  const releaseTargets = () => {
    if (!targets) return
    Object.values(targets).forEach((target) => target.dispose())
    targets = null
  }

  const setElements = (renderer, next) => {
    releaseTargets()
    elements = next
    if (!elements) return

    // Half-float positions would quantise this scene to roughly 6mm, so full float is the default and
    // half is only a fallback for a context without EXT_color_buffer_float.
    positionType = renderer.extensions?.has('EXT_color_buffer_float') ? FloatType : HalfFloatType

    const { side, parentSide } = elements

    targets = {
      pos: createTarget(side, positionType),
      nrm: createTarget(side, positionType),
      parentPos: createTarget(parentSide, positionType),
      parentNrm: createTarget(parentSide, positionType),
      accessFirst: createTarget(side, HalfFloatType),
      accessA: createTarget(side, HalfFloatType),
      accessB: createTarget(side, HalfFloatType),
      parentAccess: createTarget(parentSide, HalfFloatType),
      indirectA: createTarget(side, HalfFloatType),
      indirectB: createTarget(side, HalfFloatType)
    }

    transformUniforms.uBasePos.value = elements.basePos
    transformUniforms.uBaseNrm.value = elements.baseNrm
    transformUniforms.uParentBasePos.value = elements.parentBasePos
    transformUniforms.uParentBaseNrm.value = elements.parentBaseNrm

    accessUniforms.uPos.value = targets.pos.texture
    accessUniforms.uNrm.value = targets.nrm.texture
    accessUniforms.uParentPos.value = targets.parentPos.texture
    accessUniforms.uParentNrm.value = targets.parentNrm.texture
    accessUniforms.uParentAccess.value = targets.parentAccess.texture
    accessUniforms.uFirstAccess.value = targets.accessFirst.texture

    reduceUniforms.uPos.value = targets.pos.texture
    reduceUniforms.uNrm.value = targets.nrm.texture

    bounceUniforms.uPos.value = targets.pos.texture
    bounceUniforms.uNrm.value = targets.nrm.texture
    bounceUniforms.uParentPos.value = targets.parentPos.texture
    bounceUniforms.uParentNrm.value = targets.parentNrm.texture
    bounceUniforms.uParentAccess.value = targets.parentAccess.texture

    surfelUniforms.uPos.value = targets.pos.texture

    const { side: s, parentSide: p, clusterCount } = elements
    for (const uniforms of [transformUniforms, accessUniforms, reduceUniforms, bounceUniforms]) {
      uniforms.uElementSide.value = s
      uniforms.uParentSide.value = p
      uniforms.uClusterCount.value = clusterCount
    }
  }

  const setClusterSize = (size) => {
    clusterSize = size
    computeMaterials.forEach((material) => {
      material.defines.CLUSTER_SIZE = size
      material.needsUpdate = true
    })
  }

  const draw = (renderer, material, target) => {
    renderer.setRenderTarget(target)
    quad.material = material
    quad.render(renderer)
  }

  const reduce = (renderer, access, indirect) => {
    reduceUniforms.uAccess.value = access.texture
    reduceUniforms.uIndirect.value = indirect ? indirect.texture : null
    reduceUniforms.uUseIndirect.value = indirect ? 1 : 0
    draw(renderer, reduceMaterial, targets.parentAccess)
  }

  const solve = (renderer, params) => {
    if (!elements || !targets) return

    const previousTarget = renderer.getRenderTarget()

    // Elements and parents are moved by the same matrices; position and normal are separate draws
    // rather than an MRT attachment because at this resolution the extra pass costs nothing.
    transformUniforms.uMode.value = 0
    transformUniforms.uOutput.value = 0
    draw(renderer, transformMaterial, targets.pos)
    transformUniforms.uOutput.value = 1
    draw(renderer, transformMaterial, targets.nrm)
    transformUniforms.uMode.value = 1
    transformUniforms.uOutput.value = 0
    draw(renderer, transformMaterial, targets.parentPos)
    transformUniforms.uOutput.value = 1
    draw(renderer, transformMaterial, targets.parentNrm)

    const hierarchy = params.hierarchy ? 1 : 0
    accessUniforms.uHierarchy.value = hierarchy
    accessUniforms.uKappa.value = KAPPA
    bounceUniforms.uHierarchy.value = hierarchy
    bounceUniforms.uKappa.value = KAPPA

    // Pass one assumes every emitter is fully lit, which is what double-shadows the creases.
    accessUniforms.uUsePrev.value = 0
    accessUniforms.uMixFirst.value = 0
    draw(renderer, accessMaterial, targets.accessFirst)

    let access = targets.accessFirst
    let ping = targets.accessA
    let pong = targets.accessB

    for (let pass = 2; pass <= PASSES; pass++) {
      // Parents need the accessibility of their children before they can stand in as occluders.
      reduce(renderer, access, null)

      accessUniforms.uPrevAccess.value = access.texture
      accessUniforms.uUsePrev.value = 1
      accessUniforms.uMixFirst.value = pass === PASSES ? 1 : 0
      accessUniforms.uBlend.value = params.blend

      draw(renderer, accessMaterial, ping)

      access = ping
      const swap = ping
      ping = pong
      pong = swap
    }

    let indirect = targets.indirectA

    if (params.indirect) {
      reduce(renderer, access, null)
      bounceUniforms.uAccess.value = access.texture
      bounceUniforms.uUseIndirect.value = 0
      draw(renderer, bounceMaterial, targets.indirectA)

      if (BOUNCES > 1) {
        reduce(renderer, access, targets.indirectA)
        bounceUniforms.uIndirect.value = targets.indirectA.texture
        bounceUniforms.uUseIndirect.value = 1
        draw(renderer, bounceMaterial, targets.indirectB)
        indirect = targets.indirectB
      }
    } else {
      // Nothing wrote the bounce this frame, so hand the shading a buffer it can safely read as zero.
      // The canvas clear colour is not black, hence the explicit swap around the clear.
      renderer.getClearColor(previousClear)
      const previousAlpha = renderer.getClearAlpha()
      renderer.setRenderTarget(targets.indirectA)
      renderer.setClearColor(black, 0)
      renderer.clear(true, false, false)
      renderer.setClearColor(previousClear, previousAlpha)
    }

    shadeUniforms.uAccess.value = access.texture
    shadeUniforms.uIndirect.value = indirect.texture
    surfelUniforms.uAccess.value = access.texture

    renderer.setRenderTarget(previousTarget)
  }

  const dispose = () => {
    releaseTargets()
    computeMaterials.forEach((material) => material.dispose())
    shadeMaterials.forEach((material) => material.dispose())
    surfelMaterial.dispose()
    quad.dispose()
  }

  return {
    albedos,
    matrices,
    lightDirection,
    lightColor,
    shadeUniforms,
    surfelUniforms,
    surfelMaterial,
    createShadeMaterial,
    setElements,
    setClusterSize,
    solve,
    dispose
  }
}
