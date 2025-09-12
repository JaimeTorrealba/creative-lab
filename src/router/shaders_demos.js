import { generateRoute } from '../utils'

const shaders_routes = [
  {
    name: 'AudioAnalyser',
    description: 'Simple Audio blob with shaders and tresjs'
  },
  {
    name: 'Caustics',
    description: 'How to create the underwater caustics effect using shaders.'
  },
  {
    name: 'CoffeeCup',
    description: 'Coffee practice from Bruno Simon. ThreeJs Journey. https://threejs-journey.com/'
  },
  {
    name: 'CSM',
    description:
      'You can see how to extend any material to add shaders and different capabilities. We use the Custom Shader Material library. In this example we extend the MeshPhyiscalMaterial used in the previos glass example'
  },
  {
    name: 'DestroyGeometry',
    description:
      'With this demo, you can see how to destroy and manipulate the individual vertex of any type of geometries. This effect is base on: https://www.youtube.com/live/frgmk0Wu76A?feature=share'
  },
  {
    name: 'Fire',
    description: 'An example of Fire made with shaders. This effect is base on:https://github.com/mattatz/THREE.Fire'
  },
  {
    name: 'GPGPUFlowField',
    description: 'Example of GPGPU and flow field by Bruno Simon'
  },
  {
    name: 'Grass',
    description: 'Naive implementation of grass'
  },
  {
    name: 'InstanceMesh',
    description: 'A test to try how the instance mesh works on Tresjs, also i was experiment with the OrthographicCamera (normally I just use the PerspectiveCamera).'
  },
  {
    name: 'InstanceMesh2',
    description: 'A test to try how the instance mesh 2 works on Tresjs, this uses the https://github.com/agargaro/instanced-mesh'
  },
  {
    name: 'MouseReveal',
    description: 'An interesting effect of how to use transparency in combination with the mouse to reveal the content behind'
  },
  {
    name: 'ParticlesRing',
    description: 'A simple ring made of particles using shaders'
  },
  {
    name: 'ShaderStar',
    description:
      'A star made with shaders, a combination of colors and techniques like fresnel, matrix rotation, multi layer. This effect is base on: https://www.youtube.com/live/3krH52AhPqk?feature=share'
  },
  {
    name: 'SimonGrass',
    description:
      'Complex realistic grass by simondev example'
  },
  {
    name: 'VolumetricSmoke',
    description:
      'Complex realistic volumetric smoke simulation'
  },
  {
    name: 'WaterReflector',
    description: 'A test to try how the water reflection works on Tresjs, using the ReflectorMesh addons. Based on this video: https://youtu.be/PAy5aQK2pSg?si=4dCtEjHRNGG9tQIH'
  },
  {
    name: 'Wave',
    description: 'A WebGl ripple effect (like material design) but using shaders. This effect is base on: https://www.youtube.com/live/JaXb-hH2BIg?feature=share'
  },
]


export const shaders_demos = () => {
  return shaders_routes.map((route) => {
    return generateRoute(route.name, 'Shaders_demos', route.description, route.link)
  })
}
