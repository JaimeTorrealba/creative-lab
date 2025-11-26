import { generateRoute } from '../utils'


const controls_routes = [
  {
    name: 'CameraFollows',
    description: 'WASD movement system with third-person camera tracking.',
    basedOn: 'https://youtu.be/EkPfhzIbp2g?si=i7C69xj_Bs1YS7RL'
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
    description: '2D sprite characters in 3D space with third-person camera controls.',
    basedOn: 'https://youtu.be/pGO1Hm-JB90?si=DUtUlYphEuiRr212'
  },
  {
    name: 'ThirdPerson',
    description: 'Third-person camera system with animated character model.',
    basedOn: 'https://youtu.be/C3s0UHpwlf8?si=JdxnmkFwgAxoOdk7'
  },
]


export const controls_demos = () => {
  return controls_routes.map((route) => {
    return generateRoute(route.name, 'Controls', route.description, route.link, route.basedOn)
  })
}