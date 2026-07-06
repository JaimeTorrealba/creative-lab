import { generateRoute } from '../utils'
import { TAGS } from '../utils/constants'

const complex_routes = [
  {
    name: 'EffectiveWater',
    basedOn:
      'https://developer.nvidia.com/gpugems/gpugems/part-i-natural-effects/chapter-1-effective-water-simulation-physical-models',
    tags: [TAGS.NATURE, TAGS.GPU_GEMS]
  },
  {
    name: 'Fire',
    basedOn: 'https://github.com/mattatz/THREE.Fire',
    tags: [TAGS.NATURE]
  },
  {
    name: 'GPGPUFlowField',
    basedOn: 'https://threejs-journey.com/',
    tags: [TAGS.PARTICLES, TAGS.THREEJS_JOURNEY]
  },
  {
    name: 'GaussianSplat'
  },
  {
    name: 'HeightmapGenerator',
    tags: [TAGS.NATURE]
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
    name: 'VideoFromImages'
  },
  {
    name: 'VirtualBotany',
    basedOn:
      'https://developer.nvidia.com/gpugems/gpugems2/part-i-geometric-complexity/chapter-1-toward-photorealism-virtual-botany',
    tags: [TAGS.NATURE, TAGS.GPU_GEMS]
  },
  {
    name: 'VolumetricSmoke',
    tags: [TAGS.RAYMARCH, TAGS.VOLUMETRICS]
  },
  {
    name: 'WavingGrass',
    basedOn:
      'https://developer.nvidia.com/gpugems/gpugems/part-i-natural-effects/chapter-7-rendering-countless-blades-waving-grass',
    tags: [TAGS.NATURE, TAGS.GPU_GEMS]
  }
]

export const complex = () => {
  return complex_routes.map((route) => {
    return generateRoute(
      route.name,
      'Complex',
      route.basedOn,
      route.tags ? { tags: route.tags } : {}
    )
  })
}
