import { generateRoute } from '../utils'

const fragment_routes = [
  {
    name: 'FragmentTemplate',
    description: 'My personal fragment shader template.',
    link: 'https://www.shadertoy.com/view/3t2fRn'
  },
  {
    name: 'RayMarching',
    description: 'Basic of the ray marching, understanding the distance function and how to use it. playing with it and creating kind of a template',
    link: 'https://www.shadertoy.com/view/3t2fRn'
  },
  {
    name: 'RayMarchingOperations',
    description: 'An interesting effect of how to use transparency in combination with the mouse to reveal the content behind',
    link: 'https://www.shadertoy.com/view/3t2fRn'
  },
  {
    name: 'RayMarchingTweaks',
    description: 'Basic of the ray marching, understanding the distance function and how to use it. playing with it and creating kind of a template',
    link: 'https://www.shadertoy.com/view/3t2fRn'
  },
  {
    name: 'Rinnegan',
    description: 'A naive play with fragments draws, a rinnegan design.',
    link: 'https://www.shadertoy.com/view/3t2fRn'
  }
]

export const fragment_demos = () => {
  return fragment_routes.map((route) => {
    return generateRoute(route.name, 'Frag_shader', route.description, route.link)
  })
}
