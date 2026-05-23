import { generateRoute } from '../utils'
import { TAGS } from '../utils/constants'

const fragment_demos = [
  {
    name: 'BlackHole',
    tags: [TAGS.FRAGMENT],
    basedOn: 'https://codepen.io/darrylhuffman/pen/gRZrpv?editors=1010'
  },
  {
    name: 'BlurPixels',
    tags: [TAGS.FRAGMENT],
    basedOn: 'https://t.co/3mIyS58Cyd'
  },
  {
    name: 'ChromaticAberration',
    tags: [TAGS.FRAGMENT],
  },
  {
    name: 'Displacement',
    tags: [TAGS.FRAGMENT],
  },
  {
    name: 'Fake3DImage',
    tags: [TAGS.FRAGMENT],
    basedOn: 'https://tympanus.net/codrops/2019/02/20/how-to-create-a-fake-3d-image-effect-with-webgl/'
  },
  {
    name: 'Fbm',
    tags: [TAGS.FRAGMENT],
  },
  {
    name: 'FragmentTemplate',
    tags: [TAGS.FRAGMENT],
  },
  {
    name: 'RayMarching',
    tags: [TAGS.FRAGMENT],
  },
  {
    name: 'RayMarchingOperations',
    tags: [TAGS.FRAGMENT],
  },
  {
    name: 'RayMarchingOrbit',
    tags: [TAGS.FRAGMENT],
  },
  {
    name: 'RayMarchingTweaks',
    tags: [TAGS.FRAGMENT],
  },
  {
    name: 'RayTracing',
    tags: [TAGS.FRAGMENT],
  },
  {
    name: 'Rinnegan',
    tags: [TAGS.FRAGMENT],
  },
  {
    name: 'Slider',
    tags: [TAGS.FRAGMENT],
    basedOn: 'https://github.com/akella/webGLImageTransitions'
  },
  {
    name: 'Voronoid',
    tags: [TAGS.FRAGMENT],
    basedOn: 'https://thebookofshaders.com/12/',
  },
  {
    name: 'Wave',
    tags: [TAGS.FRAGMENT],
    basedOn: 'https://www.youtube.com/live/JaXb-hH2BIg?feature=share'
  },
]

export const fragment_routes = () => {
  return fragment_demos.map((route) => {
    return generateRoute(route.name, 'Fragment', route.basedOn, route.tags ? { tags: route.tags } : {})
  })
}
