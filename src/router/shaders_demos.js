import { generateRoute } from '../utils'

const descriptions = {
  CoffeeCup: 'Coffee practice from Bruno Simon. ThreeJs Journey. https://threejs-journey.com/',
  CSM: 'You can see how to extend any material to add shaders and different capabilities. We use the Custom Shader Material library. In this example we extend the MeshPhyiscalMaterial used in the previus glass example',
  destroyGeometry:
    'With this demo, you can see how to destroy and manipulate the individual vertex of any type of geometries. This effect is base on: https://www.youtube.com/live/frgmk0Wu76A?feature=share',
  fire: 'An example of Fire made with shaders. This effect is base on: https://github.com/mattatz/THREE.Fire',
  shaderStar:
    'A star made with shaders, a combination of colors and techniques like fresnel, matrix rotation, multi layer. This effect is base on: https://www.youtube.com/live/3krH52AhPqk?feature=share',
  imageParticles:
    'An image transformed into particles that you can animated separately . This effect is base on: https://youtu.be/vEaAheMO0bo',
  mouseReveal:
    'An interesting effect of how to use transparency in combination with the mouse to reveal the content behind',
  slider:
    'A WebGl slider made with shaders, using distorsión in images. This effect is base on: https://github.com/akella/webGLImageTransitions',
  ripple:
    'A WebGl ripple effect (like material design) but using shaders. This effect is base on: https://www.youtube.com/live/JaXb-hH2BIg?feature=share',
  grassShader: '',
  particlesRing: 'A simple ring made of particles using shaders',
  instanceMesh:
    'A test to try how the instance mesh works on Tresjs, also i was experiment with the OrthographicCamera (normally I just use the PerspectiveCamera).',
  waterReflection:
    'A test to try how the water reflection works on Tresjs, using the ReflectorMesh addons. Based on this video: https://youtu.be/PAy5aQK2pSg?si=4dCtEjHRNGG9tQIH'
}

export const shaders_demos = [
  generateRoute('AudioAnalyser', 'Shaders_demos', descriptions.audioAnalyzer),
  generateRoute('ChromaticAberration', 'Shaders_demos', ''),
  generateRoute('CoffeeCup', 'Shaders_demos', descriptions.CoffeeCup),
  generateRoute('CSM', 'Shaders_demos', descriptions.CSM),
  generateRoute('DestroyGeometry', 'Shaders_demos', descriptions.destroyGeometry), // acomodar colores
  generateRoute('Fire', 'Shaders_demos', descriptions.fire),
  generateRoute('ShaderStar', 'Shaders_demos', descriptions.shaderStar),
  generateRoute('ImageParticles', 'Shaders_demos', descriptions.imageParticles),
  generateRoute('MouseReveal', 'Shaders_demos', descriptions.mouseReveal),
  generateRoute('ParticlesRing', 'Shaders_demos', descriptions.particlesRing),
  generateRoute('Slider', 'Shaders_demos', descriptions.slider),
  generateRoute('Ripple', 'Shaders_demos', descriptions.ripple),
  generateRoute('Grass', 'Shaders_demos', descriptions.grassShader),
  generateRoute(
    'InstanceMesh',
    'Shaders_demos',
    descriptions.instanceMesh,
    'https://medium.com/@Jaimebboyjt/how-to-use-instancemesh-with-tresjs-fae8e3b48dcc'
  ),
  generateRoute('WaterReflector', 'Shaders_demos', descriptions.waterReflection)
]
