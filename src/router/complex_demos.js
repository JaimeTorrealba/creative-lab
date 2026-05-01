import { generateRoute } from '../utils'

const complex_routes = [
  {
    name: 'Fire',
    description: 'Realistic fire simulation using custom shaders.',
    basedOn: 'https://github.com/mattatz/THREE.Fire'
  },
  {
    name: 'GPGPUFlowField',
    description: 'GPU-accelerated particle flow field simulation from Three.js Journey course.',
    basedOn: 'https://threejs-journey.com/'
  },
  {
    name: 'HeightmapGenerator',
    description: 'Creating a texture programmatically using the diamond algorithm, using Tres.js'
  },
  {
    name: 'ShaderStar',
    description: 'Complex star shader combining Fresnel effects, matrix rotation, and multi-layer color techniques.',
    basedOn: 'https://www.youtube.com/live/3krH52AhPqk?feature=share'
  },
  {
    name: 'SimonGrass',
    description:
      'Complex realistic grass by simondev example, you can find it more in his course'
  },
  {
    name: 'VolumetricSmoke',
    description:
      'Complex realistic volumetric smoke simulation'
  },

]

export const complex = () => {
  return complex_routes.map((route) => {
    return generateRoute(route.name, 'Complex', route.description, route.link, route.basedOn)
  })
}
