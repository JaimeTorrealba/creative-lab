import { generateRoute } from '../utils'
import { TAGS } from '../utils/constants'

const o_s_routes = [
  {
    name: 'PamCanvas',
    tags: [TAGS.BASIC, TAGS.HTML]
  },
  {
    name: 'ParallaxMap',
    basedOn:
      'https://developer.nvidia.com/gpugems/gpugems2/part-i-geometric-complexity/chapter-8-pixel-displacement-mapping-distance-functions',
    tags: [TAGS.FRAGMENT, TAGS.GPU_GEMS]
  },
  {
    name: 'Particles',
    basedOn: 'https://natureofcode.com/particles/#example-47-a-particle-system-with-a-repeller',
    tags: [TAGS.NOC, TAGS.PARTICLES]
  },
  {
    name: 'ParticlesRing',
    tags: [TAGS.PARTICLES]
  },
  {
    name: 'PathFollowing',
    basedOn: 'https://natureofcode.com/autonomous-agents/',
    tags: [TAGS.NOC]
  },
  {
    name: 'Pendulum',
    basedOn: 'https://natureofcode.com/oscillation/#example-311-swinging-pendulum',
    tags: [TAGS.NOC]
  },
  {
    name: 'PlainWebgl',
    img: '/thumbnails/O-S/PlainWebgl.jpg',
    tags: [TAGS.RANDOM]
  },
  {
    name: 'PlainWebgpu',
    img: '/thumbnails/O-S/PlainWebgpu.jpg',
    tags: [TAGS.RANDOM, TAGS.WEBGPU]
  },
  {
    name: 'PointingDirectionMotion',
    basedOn: 'https://natureofcode.com/autonomous-agents/#vehicles-and-steering',
    tags: [TAGS.NOC]
  },
  {
    name: 'PointsEarth'
  },
  {
    name: 'ProceduralDC',
    basedOn: 'https://www.youtube.com/watch?v=qlfh_rv6khY',
    tags: [TAGS.BASIC]
  },
  {
    name: 'Quaternions',
    tags: [TAGS.BASIC]
  },
  {
    name: 'RandomMovement',
    basedOn: 'https://skfb.ly/ZsMz'
  },
  {
    name: 'RandomPoints',
    basedOn: 'https://www.youtube.com/live/JaXb-hH2BIg?feature=share',
    img: '/thumbnails/O-S/RandomPoints.jpg',
    tags: [TAGS.BASIC]
  },
  {
    name: 'RayMarching',
    tags: [TAGS.FRAGMENT, TAGS.RAYMARCH]
  },
  {
    name: 'RayMarchingOperations',
    tags: [TAGS.FRAGMENT, TAGS.RAYMARCH]
  },
  {
    name: 'RayMarchingOrbit',
    tags: [TAGS.FRAGMENT, TAGS.RAYMARCH]
  },
  {
    name: 'RayMarchingTweaks',
    tags: [TAGS.FRAGMENT, TAGS.RAYMARCH]
  },
  {
    name: 'RayTracing',
    tags: [TAGS.FRAGMENT, TAGS.RAYTRACE]
  },
  {
    name: 'Ribbon',
    basedOn: 'https://www.youtube.com/watch?v=87J8EhKMH6c'
  },
  {
    name: 'Rinnegan',
    img: '/thumbnails/O-S/Rinnegan.jpg',
    tags: [TAGS.FRAGMENT]
  },
  {
    name: 'Scatter',
    basedOn: 'https://github.com/JaimeTorrealba/three-scatter',
    tags: [TAGS.BASIC]
  },
  {
    name: 'SelectableGrid',
    basedOn: 'https://youtu.be/oQbfy8QP8Lc?si=mIsjZpQHHS5WFNUG',
    tags: [TAGS.BASIC]
  },
  {
    name: 'ShaderStar',
    basedOn: 'https://www.youtube.com/live/3krH52AhPqk?feature=share'
  },
  {
    name: 'SimonGrass',
    tags: [TAGS.NATURE]
  },
  {
    name: 'SixSides',
    tags: [TAGS.BASIC]
  },
  {
    name: 'SlicedModel',
    tags: [TAGS.THREEJS_JOURNEY]
  },
  {
    name: 'Slider',
    basedOn: 'https://github.com/akella/webGLImageTransitions',
    tags: [TAGS.FRAGMENT]
  },
  {
    name: 'SnapDrag',
    tags: [TAGS.CONTROLS]
  },
  {
    name: 'SphericalCoords',
    tags: [TAGS.BASIC]
  },
  {
    name: 'Spring',
    basedOn: 'https://natureofcode.com/oscillation/#example-310-a-spring-connection',
    tags: [TAGS.NOC]
  },
  {
    name: 'Sprites',
    basedOn: 'https://youtu.be/pGO1Hm-JB90?si=DUtUlYphEuiRr212',
    tags: [TAGS.CONTROLS]
  },
  {
    name: 'StencilMask'
  }
]

export const o_s = () => {
  return o_s_routes.map((route) => {
    return generateRoute(route.name, route.basedOn, {
      ...(route.tags ? { tags: route.tags } : {}),
      ...(route.img ? { img: route.img } : {})
    })
  })
}
