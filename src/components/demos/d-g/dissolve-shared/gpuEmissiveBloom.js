import { RenderPipeline } from 'three/webgpu'
import { emissive, mrt, output, pass } from 'three/tsl'
import { bloom } from 'three/addons/tsl/display/BloomNode.js'

// Emissive goes to its own MRT target and only that is bloomed, so the earth stays crisp and
// just the burning border and the sparks glow.
export const createEmissiveBloom = ({ renderer, scene, camera, strength }) => {
  const scenePass = pass(scene, camera)
  scenePass.setMRT(mrt({ output, emissive }))

  const bloomNode = bloom(scenePass.getTextureNode('emissive'), strength, 0.4)
  const pipeline = new RenderPipeline(renderer)
  pipeline.outputNode = scenePass.getTextureNode('output').add(bloomNode)

  const dispose = () => {
    bloomNode.dispose()
    scenePass.dispose()
    pipeline.dispose()
  }

  return { pipeline, dispose }
}
