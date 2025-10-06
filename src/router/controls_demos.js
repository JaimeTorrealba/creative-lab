import { generateRoute } from '../utils'


const controls_routes = [
  {
    name: 'CameraFollows',
    description: 'A different WASD movement system attach with a third person camera that follows your model, Based on: https://youtu.be/EkPfhzIbp2g?si=i7C69xj_Bs1YS7RL'
  },
  {
    name: 'Click',
    description: 'A click base controls (move character with your click), with glb model + animations'
  },
  {
    name: 'FourFaceModel',
    description: 'A way to show 4 faces of a model depending on the position of the camera, useful when you have a pixel, Minecraft or 2D sprite.'
  },
  // {
  //   name: 'FPS',
  //   description: 'First person shooter controls, uses my tres-FPS-controls component. '
  // },
  {
    name: 'SnapDrag',
    description: 'Snap and drag controls for objects in the 3D space. It moves along a pre-defined grid.'
  },
  {
    name: 'Sprites',
    description: 'A fusion between 2D and 3D world characters using sprites and the third person camera. based on this video: https://youtu.be/pGO1Hm-JB90?si=DUtUlYphEuiRr212'
  },
  {
    name: 'ThirdPerson',
    description: 'A third person camera controls, with glb model + animations, based on this video: https://youtu.be/C3s0UHpwlf8?si=JdxnmkFwgAxoOdk7'
  },
]


export const controls_demos = () => {
  return controls_routes.map((route) => {
    return generateRoute(route.name, 'Controls', route.description)
  })
}