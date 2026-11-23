import { Matrix4, OrthographicCamera } from 'three'
import { BOX_CENTER, BOX_RADIUS } from './cornellScene'
import { clearTarget, createFloatTarget } from './targets'

// One global ray bundle = one orthographic projection of the whole scene along a direction (38.3).
// Depth peeling turns that projection into an ordered list of layers, and every point set that is
// gathering checks each layer for its nearest hit along the bundle direction.

const CAMERA_MARGIN = 0.1

export const createBundleTracer = ({ scene, materials, quad }) => {
  const camera = new OrthographicCamera(
    -BOX_RADIUS,
    BOX_RADIUS,
    BOX_RADIUS,
    -BOX_RADIUS,
    CAMERA_MARGIN * 0.5,
    BOX_RADIUS * 2 + CAMERA_MARGIN * 2
  )
  const viewProjection = new Matrix4()

  let layerSize = 0
  let layerTargets = []
  let debugTarget = null

  const setResolution = (size) => {
    if (size === layerSize) return
    layerTargets.forEach((target) => target.dispose())
    debugTarget?.dispose()
    layerSize = size
    layerTargets = [0, 1].map(() => createFloatTarget(size, size, { depth: true }))
    debugTarget = createFloatTarget(size, size, { depth: true })
  }

  const aimCamera = (direction) => {
    camera.up.set(0, 1, 0)
    if (Math.abs(direction.y) > 0.99) camera.up.set(1, 0, 0)
    camera.position.copy(BOX_CENTER).addScaledVector(direction, BOX_RADIUS + CAMERA_MARGIN)
    camera.lookAt(BOX_CENTER)
    camera.updateMatrixWorld()
    viewProjection.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse)
  }

  const renderLayer = (renderer, target, previous, layerIndex) => {
    const { uniforms } = materials.layer
    uniforms.uPreviousLayer.value = previous.texture
    uniforms.uPeel.value = layerIndex > 0 ? 1 : 0
    clearTarget(renderer, target)
    renderer.render(scene, camera)
  }

  const gatherLayer = (renderer, layer, set) => {
    const { uniforms } = materials.gather
    uniforms.uPositions.value = set.positions
    uniforms.uNormals.value = set.normals
    uniforms.uLayer.value = layer.texture
    quad.material = materials.gather
    renderer.setRenderTarget(set.hits)
    quad.render(renderer)
  }

  const accumulateHits = (renderer, set, environment) => {
    const { uniforms } = materials.accumulate
    uniforms.uPositions.value = set.positions
    uniforms.uNormals.value = set.normals
    uniforms.uHits.value = set.hits.texture
    uniforms.uEnvironment.value.copy(environment)
    quad.material = materials.accumulate
    renderer.setRenderTarget(set.frame)
    quad.render(renderer)
  }

  const syncDirectionUniforms = (direction) => {
    materials.layer.uniforms.uCameraPosition.value.copy(camera.position)
    materials.layer.uniforms.uRayDirection.value.copy(direction)

    const gather = materials.gather.uniforms
    gather.uBundleViewProjection.value.copy(viewProjection)
    gather.uCameraPosition.value.copy(camera.position)
    gather.uRayDirection.value.copy(direction)
    gather.uLayerSize.value = layerSize
    gather.uTexelWorld.value = (BOX_RADIUS * 2) / layerSize

    materials.accumulate.uniforms.uRayDirection.value.copy(direction)
  }

  // Steps 2-9 of 38.4 for a single direction. The chapter stops peeling once a pass rasterises no
  // fragments; reading that back would stall WebGL every layer, so the layer count is fixed
  // instead and chosen from the depth complexity of the box (walls, tall box, sphere).
  const traceBundle = (renderer, direction, sets, { layers, environment, debugLayer = -1 }) => {
    aimCamera(direction)
    syncDirectionUniforms(direction)
    sets.forEach((set) => clearTarget(renderer, set.hits))

    scene.overrideMaterial = materials.layer
    for (let layerIndex = 0; layerIndex < layers; layerIndex++) {
      const target = layerTargets[layerIndex % 2]
      const previous = layerTargets[(layerIndex + 1) % 2]
      renderLayer(renderer, target, previous, layerIndex)
      if (layerIndex === debugLayer) renderLayer(renderer, debugTarget, previous, layerIndex)
      sets.forEach((set) => gatherLayer(renderer, target, set))
    }
    scene.overrideMaterial = null

    sets.forEach((set) => accumulateHits(renderer, set, environment))
  }

  const dispose = () => {
    layerTargets.forEach((target) => target.dispose())
    debugTarget?.dispose()
  }

  return {
    setResolution,
    traceBundle,
    getDebugTexture: () => debugTarget?.texture ?? null,
    dispose
  }
}
