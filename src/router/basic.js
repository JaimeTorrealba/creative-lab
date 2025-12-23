import { generateRoute } from '../utils'

const basic_routes = [
  {
    name: 'Avatar',
    description: '3D avatar model created and exported from Ready Player Me.',
    basedOn: 'https://readyplayer.me/'
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
    name: 'ClickFace',
    description: 'Interesting and simple experiment on how to detect clicks on different faces of a 3D model.'
  },
  {
    name: 'CloudLight',
    description: 'Simple imitation of the light being blocked by clouds.'
  },
  {
    name: 'Collision',
    description: 'Simple collision detection demo using a reusable composable.'
  },
  {
    name: 'CornelBox',
    description: 'Famous Cornel Box scene template',
    link: 'https://github.com/JaimeTorrealba/creative-lab/blob/main/src/views/HTML/CornelBoxView.vue'
  },
  {
    name: 'Earth',
    description: 'Interactive 3D Earth with draggable rotation, parallax clouds, city markers, stars, and GUI controls for rotation speed.'
  },
  {
    name: 'Gaea',
    description:
      'Gaea is a software for the creation of terrains, in this demo I show how to export a terrain from Gaea to TresJs.'
  },
  // {
  //   name: 'GlobalIlluminationNode',
  //   description:
  //     'In this demo I show how to use the Global Illumination Node using webgpu TSL in TresJs.'
  // },
  {
    name: 'Guide',
    description: ' Helpers to understand the 3D world with status'
  },
  {
    name: 'IsComponent',
    description: 'Simple experiment using <component :is /> built in vue feature'
  },
  {
    name: 'LabeledGeometry',
    description: 'A component that can show a label over any 3D geometry in the scene.',
    basedOn: 'https://stemkoski.github.io/Three.js/Labeled-Geometry.html'
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
    name: 'MeshLine',
    description: 'Inspired on: https://tympanus.net/codrops/2019/01/08/animated-mesh-lines/ from Yuri. I actually couldnt install the library so I ended with this demo instead. a line that follows the mouse (very smoothly)'
  },
  {
    name: 'MirrorModifier',
    description: 'A simple Mirror modifier from scrath'
  },
  {
    name: 'Nebula',
    description: 'A nebula generator using smoke abstraction with colored point lights and fog effects.',
    basedOn: 'https://youtu.be/5f5wwQb22tE'
  },
  {
    name: 'ProceduralDC',
    description: 'Basic procedural animation using the DC (distance constraint) technique.',
    basedOn: 'https://www.youtube.com/watch?v=qlfh_rv6khY'
  },
  {
    name: 'Quaternions',
    description: 'Extra simple demo to understand quaternions and how they work. Panel tweaking values',
  },
  {
    name: 'RandomPoints',
    description: 'Plane with randomly distributed points for particle effects.',
    basedOn: 'https://www.youtube.com/live/JaXb-hH2BIg?feature=share'
  },
  {
    name: 'Scatter',
    description: 'Demo showcasing the three-scatter library for distributing objects across surfaces.',
    basedOn: 'https://github.com/JaimeTorrealba/three-scatter'
  },
  {
    name: 'SelectableGrid',
    description: 'Interactive grid system with mouse-based tile selection.',
    basedOn: 'https://youtu.be/oQbfy8QP8Lc?si=mIsjZpQHHS5WFNUG'
  },
  {
    name: 'ShadeSmooth',
    description: 'Using the edgeSplitModifier to smooth the edges of a Icosahedron.'
  },
  {
    name: 'Transition',
    description:
      'We can use the Vue Transition API to create some cool effects. Here I left you a simple example.',
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
    return generateRoute(route.name, 'Basics', route.description, route.link, route.basedOn)
  })
}
