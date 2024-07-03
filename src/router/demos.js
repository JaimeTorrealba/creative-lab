import { generateRoute } from '../utils'

const descriptions = {
  multiClone: 'A initial example of how to use an ArrayModifier to create meshes.',
  followPath:
    'You can transform a model to follow a path (and svg one, in this case) and make it bend and rotate accordingly. This effect is base on: https://youtu.be/NH4rSzHLCp4',
  glass:
    'A glass/plastic effect you can achieve using physical material. This effect is base on: https://tympanus.net/codrops/2021/10/27/creating-the-effect-of-transparent-glass-and-plastic-in-three-js/.',
  fur:
    'A way to simulate fur, hair, grass, etc. Using the sampler technique in ThreeJs. This effect is base on https://youtu.be/n98UO5sUyLo.',
  infiniteBeam:
    'It creates an infinite flow of particles without using a shader. This is the native way, but you have available an abstraction to do it in TresJs. https://cientos.tresjs.org/guide/abstractions/precipitation.html',
  multiCamera:
    'You can create an array of cameras, each one with its own viewport and its own configurations.',
  pathTracing: 'An adnanced way to render a scene using path tracing. We can do this using the https://github.com/gkjohnson/three-gpu-pathtracer/tree/main',
  randomMovement:
    'A fun example using random movements to create a ant colony with gsap. Thanks to "Ant walkcycle" (https://skfb.ly/ZsMz) by Matrix Rex is licensed under Creative Commons Attribution (http://creativecommons.org/licenses/by/4.0/)',
  infiniteTube: 'A simple and funny way to create the illusion of an infinite tube.',
  twoScenes: 'Using render target to create two scenes and, one inside the other. based on this video: https://youtu.be/3qa-nFgFRBE?si=sqxg1c4q80QV1ibW',
  stencilMask: 'Stencil is a technique to create a mask, in this demo I show how to use it to create a magic cube. this is often used to create basic portals with less performance than a complete new render.',
  CSS2DRenderer: 'A different way to add HTML to your scenes (other than the already built HTML component). based on this video: https://youtu.be/0ZW3xrFhY3w?si=QkvzEikyeuv6H1Mb',
  audioAnalyzer: 'A funny way to use AudioAnalyzer to create a visual blob who react to the audio waves. based on this video: https://youtu.be/KEMZR3unWTE?si=N05ZAjAWm-Ru-lLY',
  fog:
  'A custom fog, done by modify the global shaders directly from threejs. This effect is base on https://youtu.be/k1zGz55EqfU?si=6Qa_5lP2NIPiBwxO',
  xyz: 'simple demo using VueYZ library',
  skyDome: 'Demo of how to use Sky dome as a background',
}

export const demos = [
  generateRoute('SkyDome', 'Demos', descriptions.skyDome),
  generateRoute('MultiClone', 'Demos', descriptions.multiClone),
  generateRoute('CSG', 'Demos', descriptions.CSG),
  generateRoute('CSS2DRenderer', 'Demos', descriptions.CSS2DRenderer),
  generateRoute('FollowPath', 'Demos', descriptions.followPath),
  generateRoute('Glass', 'Demos', descriptions.glass),
  generateRoute('Fog', 'Demos', descriptions.fog),
  generateRoute('Fur', 'Demos', descriptions.fur),
  generateRoute('InfiniteBeam', 'Demos', descriptions.infiniteBeam),
  generateRoute('InfiniteTube', 'Demos', descriptions.infiniteTube),
  generateRoute(
    'Minecraft',
    'Demos',
    'Following this tutorial: https://youtu.be/tsOTCn0nROI?si=DY32m9v2Vl3jhQqy.'
  ),
  generateRoute('MultiCamera', 'Demos', descriptions.multiCamera),
  generateRoute('PathTracing', 'Demos', descriptions.pathTracing),
  generateRoute('RandomMovement', 'Demos', descriptions.randomMovement),
  generateRoute('StencilMask', 'Demos', descriptions.stencilMask),
  generateRoute('TwoScenes', 'Demos', descriptions.twoScenes),
  generateRoute('VueXYZ', 'Demos', descriptions.xyz),
]
