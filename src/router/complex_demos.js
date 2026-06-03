import { generateRoute } from '../utils'
import { TAGS } from '../utils/constants'

const complex_routes = [
  {
    name: 'Fire',
    basedOn: 'https://github.com/mattatz/THREE.Fire',
    tags: [TAGS.NATURE],
  },
  {
    name: 'GPGPUFlowField',
    basedOn: 'https://threejs-journey.com/',
    tags: [TAGS.PARTICLES, TAGS.THREEJS_JOURNEY],
  },
  {
    name: 'HeightmapGenerator',
    tags: [TAGS.NATURE],
  },
  {
    name: 'ShaderStar',
    basedOn: 'https://www.youtube.com/live/3krH52AhPqk?feature=share'
  },
  {
    name: 'SimonGrass',
    tags: [TAGS.NATURE],
  },
  {
    name: 'VolumetricSmoke',
    tags: [TAGS.RAYMARCH, TAGS.VOLUMETRICS],
  },

]

export const complex = () => {
  return complex_routes.map((route) => {
    return generateRoute(route.name, 'Complex', route.basedOn, route.tags ? { tags: route.tags } : {})
  })
}
