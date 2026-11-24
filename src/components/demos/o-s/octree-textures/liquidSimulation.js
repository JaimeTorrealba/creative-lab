import { Color, FloatType, NearestFilter, RGBAFormat, ShaderMaterial, Vector4, WebGLRenderTarget } from 'three'
import { FullScreenQuad } from 'three/examples/jsm/postprocessing/Pass.js'
import { joinShaderChunks } from './octree'
import fullscreenVertex from './shaders/fullscreenVertex.glsl'
import flowCommon from './shaders/flowCommon.glsl'
import outflowFragment from './shaders/outflowFragment.glsl'
import flowFragment from './shaders/flowFragment.glsl'

export const MAX_SOURCES = 8

const createStateTarget = (width, height) =>
  new WebGLRenderTarget(width, height, {
    type: FloatType,
    format: RGBAFormat,
    minFilter: NearestFilter,
    magFilter: NearestFilter,
    depthBuffer: false,
    stencilBuffer: false,
    generateMipmaps: false
  })

const createPassMaterial = (fragmentShader, uniforms) =>
  new ShaderMaterial({
    vertexShader: fullscreenVertex,
    fragmentShader: joinShaderChunks(flowCommon, fragmentShader),
    uniforms,
    depthTest: false,
    depthWrite: false
  })

const createFlowUniforms = (tables) => ({
  uLeafTable: { value: tables.texture },
  uTableWidth: { value: tables.width },
  uGravity: { value: null },
  uGravityStrength: { value: 1 },
  uPressure: { value: 1 },
  uStick: { value: 0.02 },
  uFlow: { value: 0.05 }
})

const createSourceUniforms = () => ({
  uSources: { value: Array.from({ length: MAX_SOURCES }, () => new Vector4()) },
  uSourceCount: { value: 0 },
  uSourceRadius: { value: 0.1 },
  uDrip: { value: 0 },
  uDripThreshold: { value: 0.3 },
  uAbsorb: { value: 0 },
  uWetDecay: { value: 0.1 },
  uStepTime: { value: 1 / 60 }
})

// The render-to-texture update of 37.4: every step renders the next density map from the
// previous one and the neighbour textures. Two passes per step keep the exchange conservative.
export const createLiquidSimulation = ({ tables, gravity }) => {
  const flowUniforms = { ...createFlowUniforms(tables), uGravity: { value: gravity } }
  const sourceUniforms = createSourceUniforms()
  const states = [createStateTarget(tables.width, tables.height), createStateTarget(tables.width, tables.height)]
  const outflowTarget = createStateTarget(tables.width, tables.height)
  const outflowMaterial = createPassMaterial(outflowFragment, { ...flowUniforms, uState: { value: null } })
  const flowMaterial = createPassMaterial(flowFragment, {
    ...flowUniforms,
    ...sourceUniforms,
    uOutflow: { value: outflowTarget.texture }
  })
  const quad = new FullScreenQuad()
  const previousClearColor = new Color()
  let readIndex = 0

  const renderPass = (renderer, material, target) => {
    quad.material = material
    renderer.setRenderTarget(target)
    quad.render(renderer)
  }

  const runStep = (renderer) => {
    outflowMaterial.uniforms.uState.value = states[readIndex].texture
    renderPass(renderer, outflowMaterial, outflowTarget)
    renderPass(renderer, flowMaterial, states[1 - readIndex])
    readIndex = 1 - readIndex
  }

  // Sources only feed the first substep; `sources` holds [x, y, z, amount] in object space.
  const advance = (renderer, { substeps, stepTime, sources }) => {
    sourceUniforms.uStepTime.value = stepTime
    sources.slice(0, MAX_SOURCES).forEach((source, i) => sourceUniforms.uSources.value[i].fromArray(source))
    for (let step = 0; step < substeps; step++) {
      sourceUniforms.uSourceCount.value = step === 0 ? Math.min(sources.length, MAX_SOURCES) : 0
      runStep(renderer)
    }
    renderer.setRenderTarget(null)
  }

  const clear = (renderer) => {
    renderer.getClearColor(previousClearColor)
    const previousAlpha = renderer.getClearAlpha()
    renderer.setClearColor(0x000000, 0)
    states.forEach((target) => {
      renderer.setRenderTarget(target)
      renderer.clear(true, false, false)
    })
    renderer.setRenderTarget(null)
    renderer.setClearColor(previousClearColor, previousAlpha)
  }

  const setParameters = (values) => {
    Object.entries(values).forEach(([key, value]) => {
      const uniform = flowUniforms[key] ?? sourceUniforms[key]
      if (uniform) uniform.value = value
    })
  }

  const dispose = () => {
    states.forEach((target) => target.dispose())
    outflowTarget.dispose()
    outflowMaterial.dispose()
    flowMaterial.dispose()
    quad.dispose()
  }

  return {
    advance,
    clear,
    setParameters,
    getStateTexture: () => states[readIndex].texture,
    byteLength: tables.width * tables.height * 16 * 3,
    dispose
  }
}
