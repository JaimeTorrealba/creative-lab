import { generateRoute } from '../utils'
import { TAGS } from '../utils/constants'

const d_g_routes = [
  {
    name: 'DestroyGeometry',
    basedOn: 'https://www.youtube.com/live/frgmk0Wu76A?feature=share'
  },
  {
    name: 'DifferentialLattice',
    basedOn: 'https://github.com/inconvergent/differential-lattice',
    tags: [TAGS.RANDOM]
  },
  {
    name: 'Displacement',
    tags: [TAGS.FRAGMENT]
  },
  { name: 'Dissolve' },
  {
    name: 'DissolveTsl',
    tags: [TAGS.WEBGPU]
  },
  {
    name: 'DissolveWGSL',
    tags: [TAGS.WEBGPU]
  },
  {
    name: 'DynamicAmbientOcclusion',
    basedOn:
      'https://developer.nvidia.com/gpugems/gpugems2/part-ii-shading-lighting-and-shadows/chapter-14-dynamic-ambient-occlusion-and',
    tags: [TAGS.GPU_GEMS]
  },
  {
    name: 'DynamicComponent',
    tags: [TAGS.BASIC]
  },
  {
    name: 'Earth',
    tags: [TAGS.BASIC]
  },
  {
    name: 'EffectiveWater',
    basedOn:
      'https://developer.nvidia.com/gpugems/gpugems/part-i-natural-effects/chapter-1-effective-water-simulation-physical-models',
    tags: [TAGS.NATURE, TAGS.GPU_GEMS]
  },
  {
    name: 'Electricity',
    basedOn: 'https://www.youtube.com/watch?v=fezzkdjHoiI',
    tags: [TAGS.NATURE]
  },
  {
    name: 'Fake3DImage',
    basedOn:
      'https://tympanus.net/codrops/2019/02/20/how-to-create-a-fake-3d-image-effect-with-webgl/',
    tags: [TAGS.FRAGMENT]
  },
  {
    name: 'Fbm',
    tags: [TAGS.FRAGMENT]
  },
  {
    name: 'Fire',
    basedOn: 'https://github.com/mattatz/THREE.Fire',
    tags: [TAGS.NATURE]
  },
  {
    name: 'FireSprites',
    tags: [TAGS.NATURE]
  },
  {
    name: 'Fireworks',
    tags: [TAGS.PARTICLES, TAGS.THREEJS_JOURNEY]
  },
  {
    name: 'FlowField',
    basedOn: 'https://natureofcode.com/autonomous-agents/',
    tags: [TAGS.NOC]
  },
  {
    name: 'FollowPath',
    basedOn: 'https://youtu.be/NH4rSzHLCp4'
  },
  {
    name: 'Forces',
    basedOn: 'https://natureofcode.com/forces/#example-21-forces',
    tags: [TAGS.NOC]
  },
  {
    name: 'FourFaceModel',
    tags: [TAGS.CONTROLS]
  },
  {
    name: 'Fracture',
    basedOn: 'https://github.com/inconvergent/fracture',
    tags: [TAGS.RANDOM]
  },
  {
    name: 'FragmentTemplate',
    tags: [TAGS.FRAGMENT]
  },
  {
    name: 'Gaea',
    img: '/thumbnails/D-G/Gaea.jpg',
    tags: [TAGS.BASIC, TAGS.NATURE]
  },
  {
    name: 'GameOfLife',
    basedOn: 'https://natureofcode.com/cellular-automata/#the-game-of-life',
    tags: [TAGS.NOC]
  },
  { name: 'GaussianSplat' },
  {
    name: 'GenerativeTree',
    tags: [TAGS.RANDOM]
  },
  {
    name: 'Glass',
    basedOn:
      'https://tympanus.net/codrops/2021/10/27/creating-the-effect-of-transparent-glass-and-plastic-in-three-js/'
  },
  {
    name: 'Glow',
    basedOn: 'https://stemkoski.github.io/Three.js/Shader-Glow.html'
  },
  {
    name: 'GPGPUFlowField',
    basedOn: 'https://threejs-journey.com/',
    tags: [TAGS.PARTICLES, TAGS.THREEJS_JOURNEY]
  },
  {
    name: 'GratingDiffraction'
  },
  {
    name: 'Guide',
    tags: [TAGS.BASIC]
  }
]

export const d_g = () => {
  return d_g_routes.map((route) => {
    return generateRoute(route.name, route.basedOn, {
      ...(route.tags ? { tags: route.tags } : {}),
      ...(route.img ? { img: route.img } : {})
    })
  })
}
