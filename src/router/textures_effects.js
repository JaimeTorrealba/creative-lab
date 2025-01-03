import { generateRoute } from '../utils'

const textures_routes = [
   {
      name: 'BlurPixels',
      description:
        'How to blur a texture when hovering with the mouse, based on: https://t.co/3mIyS58Cyd'
    },
   {
      name: 'ChromaticAberration',
      description:
        'Simple chromatic aberration effect using shaders, over a texture'
    },
    {
      name: 'ImageParticles',
      description:
        'An image transformed into particles that you can animated separately . This effect is base on: https://youtu.be/vEaAheMO0bo'
    },
    {
      name: 'Slider',
      description: 'A WebGl slider made with shaders, using distorsión in images. This effect is base on: https://github.com/akella/webGLImageTransitions'
    },
]

export const textures_demos = () => {
  return textures_routes.map((route) => {
    return generateRoute(route.name, 'Textures_effects', route.description, route.link)
  })
}
