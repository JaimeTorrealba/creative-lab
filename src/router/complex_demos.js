import { generateRoute } from '../utils'

const complex_routes = [
  {
    name: 'Fire',
    description: 'An example of Fire made with shaders. This effect is base on:https://github.com/mattatz/THREE.Fire'
  },
  {
    name: 'GPGPUFlowField',
    description: 'Example of GPGPU and flow field by Bruno Simon'
  },
  {
    name: 'RayMarching',
    description: 'Basic of the ray marching, understanding the distance function and how to use it. playing with it and creating kind of a template',
  },
  {
    name: 'RayMarchingOperations',
    description: 'An interesting effect of how to use transparency in combination with the mouse to reveal the content behind',
  },
  {
    name: 'RayMarchingTweaks',
    description: 'Basic of the ray marching, understanding the distance function and how to use it. playing with it and creating kind of a template',
  },
  {
    name: 'ShaderStar',
    description:
      'A star made with shaders, a combination of colors and techniques like fresnel, matrix rotation, multi layer. This effect is base on: https://www.youtube.com/live/3krH52AhPqk?feature=share'
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
    return generateRoute(route.name, 'Complex', route.description)
  })
}
