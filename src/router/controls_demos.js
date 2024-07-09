import { generateRoute } from '../utils'


const controls_routes = [
  {
    name: 'CameraFollows',
    description: 'A different WASD movement system attach with a third person camera that follows your model, Based on: https://youtu.be/EkPfhzIbp2g?si=i7C69xj_Bs1YS7RL'
  },
  {
    name: 'ThirdPerson',
    description: 'A third person camera controls, with glb model + animations, based on this video: https://youtu.be/C3s0UHpwlf8?si=JdxnmkFwgAxoOdk7'
  },
  {
    name: 'Click',
    description: 'A click base controls (move character with your click), with glb model + animations'
  },
  {
    name: 'Sprites',
    description: 'A fusion between 2D and 3D world characters using sprites and the third person camera. based on this video: https://youtu.be/pGO1Hm-JB90?si=DUtUlYphEuiRr212'
  },
  {
    name: 'FPS',
    description: 'First person shooter controls, uses my tres-FPS-controls component. '
  },
]


export const controls_demos = () => {
  return controls_routes.map((route) => {
    return generateRoute(route.name, 'Controls', route.description, route.link)
  })
}