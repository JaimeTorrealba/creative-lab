import { generateRoute } from '../utils'

const complex_routes = [
  {
    name: 'Fire',
    basedOn: 'https://github.com/mattatz/THREE.Fire'
  },
  {
    name: 'FireSprites',
  },
  {
    name: 'GPGPUFlowField',
    basedOn: 'https://threejs-journey.com/'
  },
  {
    name: 'HeightmapGenerator',
  },
  {
    name: 'ShaderStar',
    basedOn: 'https://www.youtube.com/live/3krH52AhPqk?feature=share'
  },
  {
    name: 'SimonGrass',
  },
  {
    name: 'VolumetricSmoke',
  },

]

export const complex = () => {
  return complex_routes.map((route) => {
    return generateRoute(route.name, 'Complex', route.basedOn)
  })
}
