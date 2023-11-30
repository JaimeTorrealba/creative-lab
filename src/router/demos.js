import { generateRoute } from '../utils'

const descriptions = {
  avatar:
    'You can create a 3D model avatar, exporting in glb in just a few minutes using https://readyplayer.me/es',
  earth:
    'In this demo we can see how to create a 3D earth, make it draggable, some parallax clouds on top and add some markers (to any city). It has also stars, MouseParallax effects and a simple GUI to control the rotation speed.',
  followPath:
    'You can transform a model to follow a path (and svg one, in this case) and make it bend and rotate accordingly. This effect is base on: https://youtu.be/NH4rSzHLCp4',
  glass:
    'A glass/plastic effect you can achieve using physical material. This effect is base on: https://tympanus.net/codrops/2021/10/27/creating-the-effect-of-transparent-glass-and-plastic-in-three-js/.',
  grass:
    'A way to simulate fur, hair, grass, etc. Using the sampler technique in ThreeJs. This effect is base on https://youtu.be/n98UO5sUyLo.',
  infiniteBeam:
    'It creates an infinite flow of particles without using a shader. This is the native way, but you have available an abstraction to do it in TresJs. https://cientos.tresjs.org/guide/abstractions/precipitation.html',
  multiCamera:
    'You can create an array of cameras, each one with its own viewport and its own configurations.',
  nebula:
    'A simple nebula generator using smoke abstraction on cientos, and post-processing. This effect is base on: https://youtu.be/5f5wwQb22tE',
  randomMovement:
    'A fun example using random movements to create a ant colony with gsap. Thanks to "Ant walkcycle" (https://skfb.ly/ZsMz) by Matrix Rex is licensed under Creative Commons Attribution (http://creativecommons.org/licenses/by/4.0/)',
  transition:
    'We can use the Vue Transition API to create some cool effects. Here I left you a simple example.',
  sixSides: 'Six textures Demo Illusion',
  infiniteTube: 'A simple and funny way to create the illusion of an infinite tube.',
  gaea: 'Gaea is a software for the creation of terrains, in this demo I show how to export a terrain from Gaea to TresJs.'
}

export const demos = [
  generateRoute('Avatar', 'Demos', descriptions.avatar),
  generateRoute('Earth', 'Demos', descriptions.earth),
  generateRoute('FollowPath', 'Demos', descriptions.followPath),
  generateRoute('Gaea', 'Demos', descriptions.gaea),
  generateRoute('Glass', 'Demos', descriptions.glass),
  generateRoute('Grass', 'Demos', descriptions.grass),
  generateRoute('InfiniteBeam', 'Demos', descriptions.infiniteBeam),
  generateRoute('InfiniteTube', 'Demos', descriptions.infiniteTube),
  generateRoute('MultiCamera', 'Demos', descriptions.multiCamera),
  generateRoute('Nebula', 'Demos', descriptions.nebula),
  generateRoute('RandomMovement', 'Demos', descriptions.randomMovement),
  generateRoute('SixSides', 'Demos', descriptions.sixSides),
  generateRoute(
    'Transition',
    'Demos',
    descriptions.transition,
    'https://medium.com/@Jaimebboyjt/transition-threejs-component-using-vuejs-and-tresjs-d1119cb8ef6c'
  ),
  // no orden alfabetico
  generateRoute('Shooter', 'Demos', ''),
  generateRoute(
    'Minecraft',
    'Demo',
    'Following this tutorial: https://youtu.be/tsOTCn0nROI?si=DY32m9v2Vl3jhQqy.'
  ),
  generateRoute(
    'ThreeBvhCsg',
    'Demo',
    'Simple demo using three-bvh-csg library for basic operations.'
  ),
  generateRoute('Playground', 'Demo', '')
]
