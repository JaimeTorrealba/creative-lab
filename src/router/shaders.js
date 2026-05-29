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
    tags: [TAGS.NATURE],
  },
  {
    name: 'CoffeeCup',
    basedOn: 'https://threejs-journey.com/'
  },
  {
    name: 'CustomFog',
    basedOn: 'https://codepen.io/the-red-reddington/pen/wBGQQwO?editors=1000',
    tags: [TAGS.NATURE],
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
    tags: [TAGS.PARTICLES],
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
    tags: [TAGS.PARTICLES],
  },
  {
    name: 'MouseReveal',
  },
  {
    name: 'ParticlesRing',
    tags: [TAGS.PARTICLES],
  },
  {
    name: 'SlicedModel',
  },
  {
    name: 'TextureParticleCursor',
    tags: [TAGS.PARTICLES],
  },
  {
    name: 'Volumetric',
    tags: [TAGS.VOLUMETRICS],
  },
  {
    name: 'WaterReflector',
    tags: [TAGS.NATURE],
  },
  {
    name: 'WaterRipple',
    tags: [TAGS.NATURE],
  },
]


export const shaders = () => {
  return shaders_routes.map((route) => {
    return generateRoute(route.name, 'Shaders', route.basedOn, route.tags ? { tags: route.tags } : {})
  })
}
