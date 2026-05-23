import { generateRoute } from '../utils'
import { TAGS } from '../utils/constants'

const shaders_routes = [
  {
    name: 'ActionLines',
  },

  {
    name: 'AudioAnalyser',
  },
  {
    name: 'Bubble',
    basedOn: 'https://stemkoski.github.io/Three.js/Bubble.html'
  },
  {
    name: 'Caustics',
  },
  {
    name: 'CoffeeCup',
    basedOn: 'https://threejs-journey.com/'
  },
  {
    name: 'CustomFog',
    basedOn: 'https://codepen.io/the-red-reddington/pen/wBGQQwO?editors=1000'
  },
  {
    name: 'CSM',
  },
  {
    name: 'DestroyGeometry',
    basedOn: 'https://www.youtube.com/live/frgmk0Wu76A?feature=share'
  },
  {
    name: 'Dissolve',
  },
  {
    name: 'DissolveTsl',
    tags: [TAGS.WEBGPU]
  },
  {
    name: 'DissolveWGSL',
    tags: [TAGS.WEBGPU]
  },
  {
    name: 'Fireworks',
  },
  {
    name: 'Glow',
    basedOn: 'https://stemkoski.github.io/Three.js/Shader-Glow.html'
  },
  {
    name: 'InstanceMesh',
  },
  {
    name: 'InstanceMesh2',
    basedOn: 'https://github.com/agargaro/instanced-mesh'
  },
  {
    name: 'MorphingParticles',
  },
  {
    name: 'MouseReveal',
  },
  {
    name: 'ParticlesRing',
  },
  {
    name: 'Slash',
  },

  {
    name: 'SlicedModel',
  },
  {
    name: 'TextureParticleCursor',
  },
  {
    name: 'Volumetric',
  },
 {
   name: 'WaterReflector',
  },
  {
    name: 'WaterRipple',
  },
]


export const shaders = () => {
  return shaders_routes.map((route) => {
    return generateRoute(route.name, 'Shaders', route.basedOn, route.tags ? { tags: route.tags } : {})
  })
}
