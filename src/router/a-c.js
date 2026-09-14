import { generateRoute } from '../utils'
import { TAGS } from '../utils/constants'

const a_c_routes = [
  { name: 'ActionLines' },
  {
    name: 'AdaptiveTessellation',
    basedOn:
      'https://developer.nvidia.com/gpugems/gpugems2/part-i-geometric-complexity/chapter-7-adaptive-tessellation-subdivision-surfaces',
    tags: [TAGS.GPU_GEMS]
  },
  {
    name: 'AtmosphericScattering',
    basedOn:
      'https://developer.nvidia.com/gpugems/gpugems2/part-ii-shading-lighting-and-shadows/chapter-16-accurate-atmospheric-scattering',
    tags: [TAGS.NATURE, TAGS.GPU_GEMS]
  },
  {
    name: 'Attractor',
    basedOn: 'https://natureofcode.com/forces/#gravitational-attraction',
    tags: [TAGS.NOC]
  },
  { name: 'AudioAnalyser' },
  {
    name: 'Avatar',
    basedOn: 'https://readyplayer.me/',
    tags: [TAGS.BASIC]
  },
  {
    name: 'BabylonScene',
    tags: [TAGS.RANDOM, TAGS.WEBGPU]
  },
  {
    name: 'BetterFog',
    basedOn: 'https://iquilezles.org/articles/fog/',
    tags: [TAGS.NATURE]
  },
  {
    name: 'BitonicSort',
    tags: [TAGS.RANDOM]
  },
  {
    name: 'BlackHole',
    basedOn: 'https://codepen.io/darrylhuffman/pen/gRZrpv?editors=1010',
    tags: [TAGS.FRAGMENT]
  },
  {
    name: 'BlueprintSketchy',
    basedOn:
      'https://developer.nvidia.com/gpugems/gpugems2/part-ii-shading-lighting-and-shadows/chapter-15-blueprint-rendering-and-sketchy',
    tags: [TAGS.GPU_GEMS]
  },
  {
    name: 'BlurPixels',
    basedOn: 'https://t.co/3mIyS58Cyd',
    tags: [TAGS.FRAGMENT]
  },
  {
    name: 'BoneTweaks',
    tags: [TAGS.BASIC]
  },
  {
    name: 'Bubble',
    basedOn: 'https://stemkoski.github.io/Three.js/Bubble.html'
  },
  {
    name: 'CameraFollowPath',
    tags: [TAGS.BASIC]
  },
  {
    name: 'CameraFollows',
    basedOn: 'https://youtu.be/EkPfhzIbp2g?si=i7C69xj_Bs1YS7RL',
    tags: [TAGS.CONTROLS]
  },
  {
    name: 'Carousel3D',
    tags: [TAGS.BASIC, TAGS.HTML]
  },
  {
    name: 'Caustics',
    tags: [TAGS.NATURE]
  },
  {
    name: 'CellularAutomata',
    basedOn:
      'https://natureofcode.com/cellular-automata/#example-71-wolfram-elementary-cellular-automata',
    tags: [TAGS.NOC]
  },
  {
    name: 'ChangedPivot',
    tags: [TAGS.BASIC]
  },
  {
    name: 'CheapWater',
    basedOn: 'https://github.com/mqnc/cheapwater/tree/main',
    tags: [TAGS.NATURE]
  },
  {
    name: 'ChromaticAberration',
    tags: [TAGS.FRAGMENT]
  },
  {
    name: 'Click',
    tags: [TAGS.CONTROLS]
  },
  {
    name: 'ClickFace',
    tags: [TAGS.BASIC]
  },
  {
    name: 'CloudLight',
    tags: [TAGS.BASIC]
  },
  {
    name: 'CoffeeCup',
    basedOn: 'https://threejs-journey.com/',
    tags: [TAGS.THREEJS_JOURNEY]
  },
  {
    name: 'Collision',
    tags: [TAGS.BASIC]
  },
  {
    name: 'ControlsCurve',
    tags: [TAGS.BASIC]
  },
  {
    name: 'CornelBoxGI',
    tags: [TAGS.BASIC, TAGS.WEBGPU]
  },
  {
    name: 'CSG',
    basedOn: 'https://github.com/gkjohnson/three-bvh-csg',
    tags: [TAGS.BASIC]
  },
  { name: 'CSM' },
  {
    name: 'CSS2DRenderer',
    basedOn: 'https://youtu.be/0ZW3xrFhY3w?si=QkvzEikyeuv6H1Mb',
    tags: [TAGS.BASIC]
  },
  {
    name: 'CustomFog',
    basedOn: 'https://codepen.io/the-red-reddington/pen/wBGQQwO?editors=1000',
    tags: [TAGS.NATURE]
  }
]

export const a_c = () => {
  return a_c_routes.map((route) => {
    return generateRoute(route.name, route.basedOn, {
      ...(route.tags ? { tags: route.tags } : {}),
      ...(route.img ? { img: route.img } : {})
    })
  })
}
