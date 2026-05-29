import { generateRoute } from '../utils'
import { TAGS } from '../utils/constants'

const controls_routes = [
  {
    name: 'CameraFollows',
    basedOn: 'https://youtu.be/EkPfhzIbp2g?si=i7C69xj_Bs1YS7RL'
  },
  {
    name: 'Click',
  },
  {
    name: 'FourFaceModel',
  },
  // {
  //   name: 'FPS',
  //   description: 'First person shooter controls, uses my tres-FPS-controls component. '
  // },
  {
    name: 'SnapDrag',
  },
  {
    name: 'Sprites',
    basedOn: 'https://youtu.be/pGO1Hm-JB90?si=DUtUlYphEuiRr212'
  },
  {
    name: 'ThirdPerson',
    basedOn: 'https://youtu.be/C3s0UHpwlf8?si=JdxnmkFwgAxoOdk7'
  },
]


export const controls_demos = () => {
  return controls_routes.map((route) => {
    const tags = [TAGS.CONTROLS, ...(route.tags ?? [])]
    return generateRoute(route.name, 'Controls', route.basedOn, { tags })
  })
}