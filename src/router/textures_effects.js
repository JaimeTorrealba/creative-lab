import { generateRoute } from '../utils'

const textures_routes = [
   {
      name: 'BlurPixels',
      description: 'Mouse-driven texture blur effect using custom shaders.',
      basedOn: 'https://t.co/3mIyS58Cyd'
    },
   {
      name: 'ChromaticAberration',
      description:
        'Simple chromatic aberration effect using shaders, over a texture'
    },
   {
      name: 'Displacement',
      description:
        'A AI generated shader that displace the texture based on the mouse position.'
    },
   {
      name: 'Fake3DImage',
      description: 'Parallax depth effect using texture and depth map with mouse interaction.',
      basedOn: 'https://tympanus.net/codrops/2019/02/20/how-to-create-a-fake-3d-image-effect-with-webgl/'
    },
    {
      name: 'ImageParticles',
      description: 'Transform images into individually animated particles.',
      basedOn: 'https://youtu.be/vEaAheMO0bo'
    },
    {
      name: 'ImageReveal',
      description: 'Shader-based image reveal transition effect.',
      basedOn: 'https://tympanus.net/codrops/2024/12/02/how-to-code-a-shader-based-reveal-effect-with-react-three-fiber-glsl/'
    },
    {
      name: 'ParallaxMap',
      description:
        'Using different parallax map types in three.js.'
    },
    {
      name: 'Slider',
      description: 'WebGL image slider with distortion transitions between images.',
      basedOn: 'https://github.com/akella/webGLImageTransitions'
    },
]

export const textures_demos = () => {
  return textures_routes.map((route) => {
    return generateRoute(route.name, 'Textures_effects', route.description, route.link, route.basedOn)
  })
}
