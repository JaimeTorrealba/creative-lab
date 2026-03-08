import { generateRoute } from '../utils'

const fragment_demos = [
  {
    name: 'BlackHole',
    description: 'Texture distortion effect simulating a black hole using shaders.',
    basedOn: 'https://codepen.io/darrylhuffman/pen/gRZrpv?editors=1010'
  },

  {
    name: 'BlurPixels',
    description: 'Mouse-driven texture blur effect using custom shaders.',
    basedOn: 'https://t.co/3mIyS58Cyd'
  },
  {
    name: 'ChromaticAberration',
    description:
      'Simple chromatic aberration effect using shaders, over a texture'
  },
  {
    name: 'Displacement',
    description:
      'A AI generated shader that displace the texture based on the mouse position.'
  },
  {
    name: 'Fake3DImage',
    description: 'Parallax depth effect using texture and depth map with mouse interaction.',
    basedOn: 'https://tympanus.net/codrops/2019/02/20/how-to-create-a-fake-3d-image-effect-with-webgl/'
  },
  {
    name: 'RayMarching',
    description: 'Ray marching fundamentals with signed distance functions (SDFs) for 3D rendering.'
  },
  {
    name: 'RayMarchingOperations',
    description: 'Advanced ray marching with boolean operations (union, subtraction, intersection) on SDFs.'
  },
  {
    name: 'RayMarchingTweaks',
    description: 'Interactive ray marching template with tweakable parameters for distance functions.'
  },
  {
    name: 'Slider',
    description: 'WebGL image slider with distortion transitions between images.',
    basedOn: 'https://github.com/akella/webGLImageTransitions'
  },
]

export const fragment_routes = () => {
  return fragment_demos.map((route) => {
    return generateRoute(route.name, 'Fragment', route.description, route.link, route.basedOn)
  })
}
