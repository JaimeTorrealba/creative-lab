import { generateRoute } from '../utils'

const descriptions = {
  thirdPerson: 'A third person camera controls, with glb model + animations, based on this video: https://youtu.be/C3s0UHpwlf8?si=JdxnmkFwgAxoOdk7',
  sprites: 'A fusion between 2D and 3D world characters using sprites and the third person camera. based on this video: https://youtu.be/pGO1Hm-JB90?si=DUtUlYphEuiRr212',
}

export const controls_demos = [
  generateRoute('ThirdPerson', 'Controls_demos', descriptions.thirdPerson),
  generateRoute('Sprites', 'Controls_demos', descriptions.sprites),
  generateRoute('FPS', 'Controls_demos', ''),
]
