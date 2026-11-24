import { Color, Vector2 } from 'three'
import { clearTarget } from './radiosityTargets'

const BACKGROUND = new Color('#0b0b0d')
const INSET_MARGIN = 16
const INSET_MAX_WIDTH = 320
const canvasSize = new Vector2()

export const runEmissionPass = (renderer, context) => {
  const { solution, atlasScene, atlasMesh, materials, camera } = context
  solution.clear(renderer)
  atlasMesh.material = materials.emission
  renderer.setRenderTarget(solution.write())
  renderer.render(atlasScene, camera)
  solution.swap()
}

export const runReducePass = (renderer, { solution, grid, quad, materials, block }) => {
  const { uniforms } = materials.reduce
  uniforms.uResidual.value = solution.read().textures[1]
  uniforms.uBlock.value = block
  quad.material = materials.reduce
  renderer.setRenderTarget(grid.target)
  quad.render(renderer)
  renderer.readRenderTargetPixels(grid.target, 0, 0, grid.width, grid.height, grid.pixels)
}

const setItemShooter = (uniforms, slot) => {
  uniforms.uShooterPosition.value.copy(slot.position)
  uniforms.uShooterTangent.value.copy(slot.tangent)
  uniforms.uShooterBitangent.value.copy(slot.bitangent)
  uniforms.uShooterNormal.value.copy(slot.normal)
}

// Visibility pass: the scene seen from each shooter, ids only.
export const renderItemBuffers = (renderer, { itemAtlas, itemScene, batch, materials, camera }) => {
  const { target, resolution } = itemAtlas
  target.scissorTest = false
  target.viewport.set(0, 0, target.width, target.height)
  clearTarget(renderer, target)

  target.scissorTest = true
  for (let k = 0; k < batch.count; k++) {
    const slot = batch.slots[k]
    setItemShooter(materials.item.uniforms, slot)
    target.viewport.set(slot.tileX, slot.tileY, resolution, resolution)
    target.scissor.set(slot.tileX, slot.tileY, resolution, resolution)
    renderer.setRenderTarget(target)
    renderer.render(itemScene, camera)
  }
  target.scissorTest = false
  target.viewport.set(0, 0, target.width, target.height)
}

export const runReconstructPass = (renderer, context, settings) => {
  const { solution, grid, itemAtlas, batch, atlasScene, atlasMesh, materials, camera } = context
  const { uniforms } = materials.reconstruct
  const previous = solution.read()
  uniforms.uRadiosity.value = previous.textures[0]
  uniforms.uResidual.value = previous.textures[1]
  uniforms.uShooterEnergy.value = grid.target.texture
  uniforms.uShooters.value = batch.texture
  uniforms.uItemBuffer.value = itemAtlas.target.texture
  uniforms.uShooterCount.value = batch.count
  uniforms.uBlock.value = settings.shooterBlock
  uniforms.uItemResolution.value = itemAtlas.resolution
  uniforms.uPixelAngle.value = 4 / itemAtlas.resolution
  uniforms.uDepthTolerance.value = settings.depthTolerance
  uniforms.uSoftVisibility.value = settings.softVisibility

  atlasMesh.material = materials.reconstruct
  renderer.setRenderTarget(solution.write())
  renderer.render(atlasScene, camera)
  solution.swap()
}

export const renderDisplay = (renderer, { solution, displayScene, materials, ambient }, view) => {
  const { uniforms } = materials.display
  const current = solution.read()
  uniforms.uRadiosity.value = current.textures[0]
  uniforms.uResidual.value = current.textures[1]
  uniforms.uAmbient.value.copy(ambient)
  uniforms.uView.value = view.mode
  uniforms.uResidualGain.value = view.residualGain

  renderer.setRenderTarget(null)
  renderer.setClearColor(BACKGROUND, 1)
  renderer.clear(true, true, false)
  view.camera.updateMatrixWorld()
  renderer.render(displayScene, view.camera)
}

export const renderItemInset = (renderer, { itemAtlas, quad, materials }) => {
  const { target } = itemAtlas
  renderer.getSize(canvasSize)
  const width = Math.min(INSET_MAX_WIDTH, canvasSize.x * 0.4)
  const height = (width * target.height) / target.width

  materials.itemDebug.uniforms.uItemBuffer.value = target.texture
  quad.material = materials.itemDebug
  renderer.setRenderTarget(null)
  renderer.setViewport(INSET_MARGIN, INSET_MARGIN, width, height)
  renderer.setScissor(INSET_MARGIN, INSET_MARGIN, width, height)
  renderer.setScissorTest(true)
  quad.render(renderer)
  renderer.setScissorTest(false)
  renderer.setViewport(0, 0, canvasSize.x, canvasSize.y)
}
