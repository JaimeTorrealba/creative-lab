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
    name: 'FragmentTemplate',
    description: 'My personal fragment shader template. (There is a problem in Tres.js so this template should have orthographic camera and a plane to work)',
    link: 'https://www.shadertoy.com/view/3t2fRn'
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
    name: 'Rinnegan',
    description: 'A naive play with fragments draws, a rinnegan design.',
    link: 'https://www.shadertoy.com/view/3t2fRn'
  },
  // {
  //   name: 'WaterReflector',
  //   description: 'A test to try how the water reflection works on Tresjs, using the ReflectorMesh addons. Based on this video: https://youtu.be/PAy5aQK2pSg?si=4dCtEjHRNGG9tQIH'
  // },
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
