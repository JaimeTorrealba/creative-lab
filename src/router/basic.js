import { generateRoute } from '../utils'

const descriptions = {
  avatar:
    'You can create a 3D model avatar, exporting in glb in just a few minutes using https://readyplayer.me/es',
  changedPivot: 'Changing the pivot of a 3D primitive.',
  cloudLight: 'Simple imitation of the light being blocked by clouds.',
  earth:
    'In this demo we can see how to create a 3D earth, make it draggable, some parallax clouds on top and add some markers (to any city). It has also stars, MouseParallax effects and a simple GUI to control the rotation speed.',
  isComponent: 'Simple experiment using <component :is /> built in vue feature',
  guide: ' Helpers to understand the 3D world with status',
  nebula:
    'A simple nebula generator using smoke abstraction on cientos, and post-processing. This effect is base on: https://youtu.be/5f5wwQb22tE',
  transition:
    'We can use the Vue Transition API to create some cool effects. Here I left you a simple example.',
  sixSides: 'Six textures Demo Illusion',
  gaea: 'Gaea is a software for the creation of terrains, in this demo I show how to export a terrain from Gaea to TresJs.',
  selectableGrid:
    'How to select a grid (tile) in a plane using the mouse. based on this video: https://youtu.be/oQbfy8QP8Lc?si=mIsjZpQHHS5WFNUG',
  sphericalCoords: 'Simple pendulum using spherical coordinates.',
  smoothShading: 'Using the edgeSplitModifier to smooth the edges of a Icosahedron.'
}

export const basic = [
  generateRoute('Avatar', 'Basics', descriptions.avatar),
  generateRoute('ChangedPivot', 'Basics', descriptions.changedPivot),
  generateRoute('CloudLight', 'Basics', descriptions.cloudLight),
  generateRoute('Earth', 'Basics', descriptions.earth),
  generateRoute('Gaea', 'Basics', descriptions.gaea),
  generateRoute('Guide', 'Basics', descriptions.guide),
  generateRoute('IsComponent', 'Basics', descriptions.isComponent),
  generateRoute('Nebula', 'Basics', descriptions.nebula),
  generateRoute('SelectableGrid', 'Basics', descriptions.selectableGrid),
  generateRoute('ShadeSmooth', 'Basics', descriptions.smoothShading),
  generateRoute('SixSides', 'Basics', descriptions.sixSides),
  generateRoute('SphericalCoords', 'Basics', descriptions.sphericalCoords),
  generateRoute(
    'Transition',
    'Basics',
    descriptions.transition,
    'https://medium.com/@Jaimebboyjt/transition-threejs-component-using-vuejs-and-tresjs-d1119cb8ef6c'
  )
]
