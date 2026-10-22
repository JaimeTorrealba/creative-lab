import { build_final_scene } from './final_scene'
import { make_bvh_node } from './bvh'
import { packHittableList, packBvhNodes } from './packWorld'

// Listing [random-spheres-bvh] ("Ray Tracing: The Next Week"): the final scene's world, wrapped
// in a BVH and packed for the GPU.
export const buildFinalSceneBuffers = () => {
  const world = build_final_scene()
  const root = make_bvh_node(world)
  return {
    hittableList: packHittableList(world),
    bvhNodes: packBvhNodes(root, world.objects),
    sphereCount: world.objects.length
  }
}
