import { generateRoute } from '../utils'

const basic_routes = [
  {
    name: 'Avatar',
    description:
      'You can create a 3D model avatar, exporting in glb in just a few minutes using https://readyplayer.me/es'
  },
  {
    name: 'BoneTweaks',
    description: 'Using the tweak pane to modify the bones of a 3D model. just for fun.'
  },
  {
    name: 'ChangedPivot',
    description: 'I tried to change the pivot of a 3D primitive. isn´t that straightforward as I thought?'
  },
  {
    name: 'CloudLight',
    description: 'Simple imitation of the light being blocked by clouds.'
  },
  {
    name: 'Collision',
    description: 'Simple coalition demo, thinking in a composable'
  },
  {
    name: 'Earth',
    description:
      'In this demo we can see how to create a 3D earth, make it draggable, some parallax clouds on top and add some markers (to any city). It has also stars, MouseParallax effects and a simple GUI to control the rotation speed.'
  },
  {
    name: 'Gaea',
    description:
      'Gaea is a software for the creation of terrains, in this demo I show how to export a terrain from Gaea to TresJs.'
  },
  {
    name: 'Guide',
    description: ' Helpers to understand the 3D world with status'
  },
  {
    name: 'IsComponent',
    description: 'Simple experiment using <component :is /> built in vue feature'
  },
  {
    name: 'LeomonLights',
    description: 'Using and experimenting with different spot lights. all the lights are from leomon'
  },
  {
    name: 'MaterialX',
    description: 'Using MaterialX materials in TresJS'
  },
  {
    name: 'Nebula',
    description:
      'A simple nebula generator using smoke abstraction on cientos, and post-processing. This effect is base on: https://youtu.be/5f5wwQb22tE'
  },
  {
    name: 'ProceduralDC',
    description: 'Creating a basic procedural animation using the DC (distance constrain) technique. Based on: https://www.youtube.com/watch?v=qlfh_rv6khY'
  },
  {
    name: 'RandomPoints',
    description: 'Simple plane with random points for future effects. This effect is base on: https://www.youtube.com/live/JaXb-hH2BIg?feature=share'
  },
  {
    name: 'Scatter',
    description:
      'Using my library three-scatter'
  },
  {
    name: 'SelectableGrid',
    description:
      'How to select a grid (tile) in a plane using the mouse. based on this video: https://youtu.be/oQbfy8QP8Lc?si=mIsjZpQHHS5WFNUG'
  },
  {
    name: 'ShadeSmooth',
    description: 'Using the edgeSplitModifier to smooth the edges of a Icosahedron.'
  },
  {
    name: 'Transition',
    description:
      'We can use the Vue Transition API to create some cool effects. Here I left you a simple example.',
    link: 'https://medium.com/@Jaimebboyjt/transition-threejs-component-using-vuejs-and-tresjs-d1119cb8ef6c'
  },
  {
    name: 'SixSides',
    description: 'Six textures Demo Illusion'
  },
  {
    name: 'SphericalCoords',
    description: 'Simple pendulum using spherical coordinates.'
  },
]

export const basic = () => {
  return basic_routes.map((route) => {
    return generateRoute(route.name, 'Basics', route.description, route.link)
  })
}
