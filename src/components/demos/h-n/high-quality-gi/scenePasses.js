import { Matrix4, PerspectiveCamera } from 'three'
import { clearTarget, createFloatTarget } from './targets'

const SHADOW_SIZE = 1024
const SHADOW_FOV = 150

// The two rasterisations that are not ray bundles: the shadow map for the panel's direct light,
// and the camera G-buffer that provides the visible points of the final gather (buffer A).
export const createScenePasses = ({ cornell, materials, lightUniforms }) => {
  const { scene, lightPanel, lightPosition } = cornell

  const shadowTarget = createFloatTarget(SHADOW_SIZE, SHADOW_SIZE, { depth: true })
  lightUniforms.uShadowMap.value = shadowTarget.texture

  // A wide downward frustum covers everything the panel can see; whatever falls outside it sits
  // almost level with the panel, where the emitter's cosine has already taken the light to zero.
  const lightCamera = new PerspectiveCamera(SHADOW_FOV, 1, 0.01, 4)
  lightCamera.up.set(0, 0, -1)
  lightUniforms.uShadowMapSize.value = SHADOW_SIZE
  lightUniforms.uShadowTexelAngle.value =
    (2 * Math.tan(((SHADOW_FOV / 2) * Math.PI) / 180)) / SHADOW_SIZE

  const savedProjection = new Matrix4()
  let gbuffer = null

  const setGBufferSize = (width, height) => {
    gbuffer?.dispose()
    gbuffer = createFloatTarget(width, height, { depth: true, count: 4 })
    return gbuffer
  }

  const renderShadowMap = (renderer) => {
    lightCamera.position.copy(lightPosition)
    lightCamera.lookAt(lightPosition.x, 0, lightPosition.z)
    lightCamera.updateMatrixWorld()
    lightUniforms.uLightViewProjection.value.multiplyMatrices(
      lightCamera.projectionMatrix,
      lightCamera.matrixWorldInverse
    )
    lightUniforms.uLightInverseViewProjection.value
      .copy(lightUniforms.uLightViewProjection.value)
      .invert()

    lightPanel.visible = false
    scene.overrideMaterial = materials.shadow
    clearTarget(renderer, shadowTarget)
    renderer.render(scene, lightCamera)
    scene.overrideMaterial = null
    lightPanel.visible = true
  }

  // The jitter is added to the projection only for this pass and undone right after, so camera
  // change detection and the controls never see it. Offsetting elements 8 and 9 shifts the image
  // by a constant amount in NDC, which for a perspective matrix is the sub-pixel near-plane shift.
  const renderGBuffer = (renderer, camera, jitter) => {
    const projection = camera.projectionMatrix
    savedProjection.copy(projection)
    projection.elements[8] += (jitter.x * 2) / gbuffer.width
    projection.elements[9] += (jitter.y * 2) / gbuffer.height

    scene.overrideMaterial = materials.gbuffer
    clearTarget(renderer, gbuffer)
    renderer.render(scene, camera)
    scene.overrideMaterial = null

    projection.copy(savedProjection)
  }

  const dispose = () => {
    shadowTarget.dispose()
    gbuffer?.dispose()
  }

  return { setGBufferSize, getGBuffer: () => gbuffer, renderShadowMap, renderGBuffer, dispose }
}
