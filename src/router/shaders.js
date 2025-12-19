import { generateRoute } from '../utils'

const shaders_routes = [
  {
    name: 'ActionLines',
    description: ''
  },

  {
    name: 'AudioAnalyser',
    description: 'Audio-reactive icosahedron that responds to music frequency data with vertex shader animation.'
  },
  {
    name: 'Bubble',
    description: 'Soap bubble effect using CubeCamera reflections and Fresnel shader.',
    basedOn: 'https://stemkoski.github.io/Three.js/Bubble.html'
  },
  {
    name: 'Caustics',
    description: 'Underwater caustics light patterns on ocean floor using animated shader effects.'
  },
  {
    name: 'CoffeeCup',
    description: 'Coffee smoke shader practice from Three.js Journey course.',
    basedOn: 'https://threejs-journey.com/'
  },
  {
    name: 'CSM',
    description:
      'You can see how to extend any material to add shaders and different capabilities. We use the Custom Shader Material library. In this example we extend the MeshPhyiscalMaterial used in the previos glass example'
  },
  {
    name: 'DestroyGeometry',
    description: 'Vertex manipulation demo showing how to destroy and animate individual vertices of geometries.',
    basedOn: 'https://www.youtube.com/live/frgmk0Wu76A?feature=share'
  },
  {
    name: 'Dissolve',
    description: 'Dissolve effect VFX when appears or disappears an object.'
  },
  {
    name: 'DissolveTsl',
    description: 'Same as Dissolve but using the TSL shader language.'
  },
  {
    name: 'FragmentTemplate',
    description: 'My personal fragment shader template. (There is a problem in Tres.js so this template should have orthographic camera and a plane to work)'
  },
  {
    name: 'Glow',
    description: 'Glowing effect using shader materials.',
    basedOn: 'https://stemkoski.github.io/Three.js/Shader-Glow.html'
  },
  {
    name: 'InstanceMesh',
    description: 'A test to try how the instance mesh works on Tresjs, also i was experiment with the OrthographicCamera (normally I just use the PerspectiveCamera).'
  },
  {
    name: 'InstanceMesh2',
    description: 'Advanced instanced mesh rendering using the instanced-mesh library.',
    basedOn: 'https://github.com/agargaro/instanced-mesh'
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
    name: 'RimLight',
    description: 'Rim lighting effect using custom shaders to highlight object edges.',
    basedOn: 'https://threejsroadmap.com/blog/rim-lighting-shader'
  },
  {
    name: 'Rinnegan',
    description: 'A naive play with fragments draws, a rinnegan design.',
  },
  {
    name: 'Slash',
    description: 'My own attempt to create a vfx slash effect using shaders.',
  },

  {
    name: 'SlicedModel',
    description: 'Following the Three.js Journey tutorial about sliced models.'
  },
  {
    name: 'Volumetric',
    description: 'Following the Scratchapixel tutorial about volumetric rendering.',
  },
  // {
  //   name: 'WaterReflector',
  //   description: 'A test to try how the water reflection works on Tresjs, using the ReflectorMesh addons. Based on this video: https://youtu.be/PAy5aQK2pSg?si=4dCtEjHRNGG9tQIH'
  // },
  {
    name: 'Wave',
    description: 'WebGL ripple effect (Material Design style) implemented with custom shaders.',
    basedOn: 'https://www.youtube.com/live/JaXb-hH2BIg?feature=share'
  },
]


export const shaders = () => {
  return shaders_routes.map((route) => {
    return generateRoute(route.name, 'Shaders', route.description, route.link, route.basedOn)
  })
}
