import { generateRoute } from '../utils'

const descriptions = {
  thirdPerson: 'A third person camera controls, with glb model + animations, based on this video: https://youtu.be/C3s0UHpwlf8?si=JdxnmkFwgAxoOdk7',
  click: 'A click base controls, with glb model + animations',
  cameraFollows: 'A different WASD movement system attach with a third person camera that follows your model, Based on: https://youtu.be/EkPfhzIbp2g?si=i7C69xj_Bs1YS7RL',
  sprites: 'A fusion between 2D and 3D world characters using sprites and the third person camera. based on this video: https://youtu.be/pGO1Hm-JB90?si=DUtUlYphEuiRr212',
}

export const controls_demos = [
  generateRoute('CameraFollows', 'Controls_demos', descriptions.cameraFollows),
  generateRoute('ThirdPerson', 'Controls_demos', descriptions.thirdPerson),
  generateRoute('Click', 'Controls_demos', descriptions.click),
  generateRoute('Sprites', 'Controls_demos', descriptions.sprites),
  generateRoute('FPS', 'Controls_demos', ''),
]
