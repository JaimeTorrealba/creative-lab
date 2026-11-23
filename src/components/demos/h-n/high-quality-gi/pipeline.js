import { Matrix4, Vector2, Vector3 } from 'three'
import { FullScreenQuad } from 'three/examples/jsm/postprocessing/Pass.js'
import { getBundleDirection } from './bundleDirections'
import { createBundleTracer } from './bundleTracer'
import { createColorAccumulator } from './colorAccumulator'
import { createLightUniforms, createMaterials } from './materials'
import { createScenePasses } from './scenePasses'
import { clearTarget, createFloatTarget, createGatherSet } from './targets'

export const VIEW = { FINAL: 0, FIRST_PASS: 1, DIRECT: 2, INDIRECT: 3, IRRADIANCE: 4, LAYER: 5 }

// The two-pass method of 38.2: a rough solution on the mesh vertices (here gathered with the same
// ray bundles instead of photon mapping, as 38.5.4 suggests) feeds the final gather at every
// visible pixel. Static scenes accumulate a fixed QMC set and then stop; moving scenes keep an
// exponential average so the bundles can follow the motion.
export const createPipeline = (cornell) => {
  const lightUniforms = createLightUniforms(cornell.lightPosition)
  const materials = createMaterials(lightUniforms)
  const quad = new FullScreenQuad()
  const tracer = createBundleTracer({ scene: cornell.scene, materials, quad })
  const scenePasses = createScenePasses({ cornell, materials, lightUniforms })
  const accumulator = createColorAccumulator({ materials, quad })

  const { side } = cornell.points
  const vertexSet = createGatherSet(side, side)
  vertexSet.positions = cornell.points.positionTexture
  vertexSet.normals = cornell.points.normalTexture
  const vertexSource = createFloatTarget(side, side)
  materials.uVertexIrradiance.value = vertexSource.texture

  let screenSet = null
  const screenSize = new Vector2()
  const drawingSize = new Vector2()
  const lastView = new Matrix4()
  const lastProjection = new Matrix4()
  const direction = new Vector3()
  const status = { directionIndex: 0, vertexPasses: 0, sourceDirty: true, floatBlend: false }

  const resetAll = () => {
    status.directionIndex = 0
    status.vertexPasses = 0
    status.sourceDirty = true
    vertexSet.reset()
    screenSet?.reset()
    accumulator.reset()
  }

  const syncScreenSize = (renderer, scale) => {
    renderer.getDrawingBufferSize(drawingSize)
    const width = Math.max(1, Math.round(drawingSize.x * scale))
    const height = Math.max(1, Math.round(drawingSize.y * scale))
    if (screenSet && width === screenSize.x && height === screenSize.y) return

    screenSize.set(width, height)
    screenSet?.dispose()
    screenSet = createGatherSet(width, height)
    const gbuffer = scenePasses.setGBufferSize(width, height)
    screenSet.positions = gbuffer.textures[0]
    screenSet.normals = gbuffer.textures[1]
    accumulator.setSize(width, height)
  }

  const trackCamera = (camera) => {
    const sameView = lastView.equals(camera.matrixWorld)
    if (sameView && lastProjection.equals(camera.projectionMatrix)) return
    lastView.copy(camera.matrixWorld)
    lastProjection.copy(camera.projectionMatrix)
    screenSet.reset()
    accumulator.reset()
  }

  const commitHistory = (renderer, set, decay, traced) => {
    const effectiveDecay = set.pendingReset ? 0 : decay
    const { uniforms } = materials.history
    uniforms.uPrevious.value = set.getHistory().texture
    uniforms.uFrame.value = set.frame.texture
    uniforms.uDecay.value = effectiveDecay
    quad.material = materials.history
    renderer.setRenderTarget(set.getNextHistory())
    quad.render(renderer)
    set.swapHistory()
    set.directions = set.directions * effectiveDecay + traced
    set.pendingReset = false
  }

  const resolveVertexSource = (renderer) => {
    materials.resolve.uniforms.uHistory.value = vertexSet.getHistory().texture
    quad.material = materials.resolve
    renderer.setRenderTarget(vertexSource)
    quad.render(renderer)
  }

  const planFrame = (settings) => {
    if (settings.animated) return { vertex: true, screen: true }
    const vertexDone = status.vertexPasses >= Math.max(settings.bounces - 1, 1)
    const screen = vertexDone && screenSet.directions < settings.maxDirections
    return { vertex: !vertexDone, screen }
  }

  const traceFrame = (renderer, sets, count, settings) => {
    sets.forEach((set) => clearTarget(renderer, set.frame))
    for (let i = 0; i < count; i++) {
      getBundleDirection(status.directionIndex++, direction)
      tracer.traceBundle(renderer, direction, sets, settings)
    }
  }

  const finishVertexPass = (renderer, settings) => {
    if (settings.animated) {
      resolveVertexSource(renderer)
      return
    }
    if (vertexSet.directions < settings.directionsPerBounce) return
    resolveVertexSource(renderer)
    status.vertexPasses++
    vertexSet.reset()
  }

  const runGlobalIllumination = (renderer, settings, sets, plan) => {
    if (sets.length === 0) return

    const count = plan.screen ? settings.directionsPerFrame : settings.vertexDirectionsPerFrame
    traceFrame(renderer, sets, count, settings)

    const decay = settings.animated ? settings.temporal : 1
    sets.forEach((set) => commitHistory(renderer, set, decay, count))
    if (plan.vertex) finishVertexPass(renderer, settings)
  }

  const traceDebugLayer = (renderer, settings) => {
    getBundleDirection(settings.debugDirection, direction)
    tracer.traceBundle(renderer, direction, [], {
      ...settings,
      layers: Math.max(settings.layers, settings.debugLayer + 1),
      debugLayer: settings.debugLayer
    })
  }

  const syncSettings = (settings) => {
    lightUniforms.uLightColor.value.set(settings.lightColor)
    lightUniforms.uLightPower.value = settings.lightPower
    lightUniforms.uShadowSoftness.value = settings.softness
    lightUniforms.uShadowBias.value = settings.shadowBias
    lightUniforms.uShadowNormalOffset.value = settings.shadowNormalOffset
    materials.layer.uniforms.uUseFirstPass.value = settings.bounces > 1 ? 1 : 0
    materials.layer.uniforms.uPeelEpsilon.value = settings.peelEpsilon
    materials.gather.uniforms.uNormalBias.value = settings.normalBias
    materials.gather.uniforms.uSlopeBias.value = settings.slopeBias
    tracer.setResolution(settings.bundleResolution)
  }

  const getGatherMix = (warmup) => {
    if (warmup <= 0) return screenSet.directions > 0 ? 1 : 0
    return Math.min(screenSet.directions / warmup, 1)
  }

  const composite = (renderer, settings, changing) => {
    const gbuffer = scenePasses.getGBuffer()
    const { uniforms } = materials.composite
    uniforms.uPositions.value = gbuffer.textures[0]
    uniforms.uNormals.value = gbuffer.textures[1]
    uniforms.uAlbedo.value = gbuffer.textures[2]
    uniforms.uFirstPass.value = gbuffer.textures[3]
    uniforms.uGather.value = screenSet.getHistory().texture
    uniforms.uDebugLayer.value = tracer.getDebugTexture()
    uniforms.uResolution.value.copy(screenSize)
    uniforms.uGatherMix.value = getGatherMix(settings.warmup)
    uniforms.uExposure.value = settings.exposure
    uniforms.uView.value = settings.view
    uniforms.uPreviousColor.value = accumulator.getPreviousTexture()
    uniforms.uColorWeight.value = accumulator.getBlendWeight(settings, changing)
    quad.material = materials.composite
    renderer.setRenderTarget(accumulator.getNextTarget())
    quad.render(renderer)
    accumulator.commit()
  }

  const renderFrame = (renderer, camera, settings) => {
    if (!status.floatBlend) {
      status.floatBlend = Boolean(renderer.getContext().getExtension('EXT_float_blend'))
    }
    renderer.autoClear = false
    syncSettings(settings)
    syncScreenSize(renderer, settings.resolutionScale)

    if (status.sourceDirty) {
      clearTarget(renderer, vertexSource)
      status.sourceDirty = false
    }

    trackCamera(camera)
    const plan = planFrame(settings)
    const sets = [plan.vertex && vertexSet, plan.screen && screenSet].filter(Boolean)
    const changing = settings.animated || sets.length > 0

    // Nothing left to trace and every jitter sample is in: the frame is final, just show it.
    if (!accumulator.isConverged(settings, changing)) {
      scenePasses.renderShadowMap(renderer)
      scenePasses.renderGBuffer(renderer, camera, accumulator.getJitter(settings))
      runGlobalIllumination(renderer, settings, sets, plan)
      if (settings.view === VIEW.LAYER) traceDebugLayer(renderer, settings)
      composite(renderer, settings, changing)
    }

    accumulator.present(renderer)
  }

  const getStats = () => ({
    screenDirections: screenSet?.directions ?? 0,
    vertexPasses: status.vertexPasses,
    vertexDirections: vertexSet.directions,
    aaSamples: accumulator.getSamples(),
    floatBlend: status.floatBlend
  })

  const dispose = () => {
    quad.dispose()
    tracer.dispose()
    scenePasses.dispose()
    materials.dispose()
    vertexSet.dispose()
    vertexSource.dispose()
    screenSet?.dispose()
    accumulator.dispose()
  }

  return { renderFrame, resetAll, resetColor: () => accumulator.reset(), getStats, dispose }
}
