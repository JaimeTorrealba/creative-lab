import { Vector2 } from 'three'
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js'
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js'

// The reference's MotionBloomPass is UnrealBloomPass with skewed blur directions instead of the
// horizontal/vertical pair, which smears the glow diagonally. Three reads those directions from
// static fields, so they are swapped in only for this pass's render call.
class MotionBloomPass extends UnrealBloomPass {
  constructor(bloom) {
    super(new Vector2(256, 256), bloom.strength, bloom.radius, bloom.threshold)
    this.blurDirectionX = new Vector2().copy(bloom.directionX)
    this.blurDirectionY = new Vector2().copy(bloom.directionY)
  }

  render(...args) {
    const { BlurDirectionX, BlurDirectionY } = UnrealBloomPass
    UnrealBloomPass.BlurDirectionX = this.blurDirectionX
    UnrealBloomPass.BlurDirectionY = this.blurDirectionY
    super.render(...args)
    UnrealBloomPass.BlurDirectionX = BlurDirectionX
    UnrealBloomPass.BlurDirectionY = BlurDirectionY
  }
}

export const createMotionBloomComposer = ({ renderer, scene, camera, bloom }) => {
  const composer = new EffectComposer(renderer)
  const bloomPass = new MotionBloomPass(bloom)
  composer.addPass(new RenderPass(scene, camera))
  composer.addPass(bloomPass)
  composer.addPass(new OutputPass())

  const syncBloomSettings = () => {
    bloomPass.threshold = bloom.threshold
    bloomPass.strength = bloom.strength
    bloomPass.radius = bloom.radius
    bloomPass.blurDirectionX.copy(bloom.directionX)
    bloomPass.blurDirectionY.copy(bloom.directionY)
  }

  const renderWithBloom = () => {
    syncBloomSettings()
    composer.render()
  }

  const setSize = (width, height, pixelRatio) => {
    composer.setPixelRatio(pixelRatio)
    composer.setSize(width, height)
  }

  const dispose = () => {
    bloomPass.dispose()
    composer.dispose()
  }

  return { renderWithBloom, setSize, dispose }
}
