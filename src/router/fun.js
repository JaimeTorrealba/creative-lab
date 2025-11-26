import { generateRoute } from '../utils'

const fun_routes = [
  {
    name: 'CSG',
    description: 'Constructive Solid Geometry operations using three-bvh-csg library for boolean mesh operations.',
    basedOn: 'https://github.com/gkjohnson/three-bvh-csg'
  },
  {
    name: 'CSS2DRenderer',
    description: 'Alternative method for adding HTML elements to 3D scenes using CSS2DRenderer.',
    basedOn: 'https://youtu.be/0ZW3xrFhY3w?si=QkvzEikyeuv6H1Mb'
  },
  {
    name: 'FollowPath',
    description: 'Model follows an SVG path with automatic bending and rotation.',
    basedOn: 'https://youtu.be/NH4rSzHLCp4',
    link: 'https://github.com/JaimeTorrealba/creative-lab/blob/main/src/views/Demos/FollowPathView.vue'
  },
  {
    name: 'Glass',
    description: 'Glass and plastic transparency effects using MeshPhysicalMaterial.',
    basedOn: 'https://tympanus.net/codrops/2021/10/27/creating-the-effect-of-transparent-glass-and-plastic-in-three-js/'
  },
  {
    name: 'InfiniteBeam',
    description: 'Infinite particle flow effect without shaders, using native Three.js.',
    basedOn: 'https://cientos.tresjs.org/guide/abstractions/precipitation.html'
  },
  {
    name: 'InfiniteTube',
    description: 'Animated tube with organic alien flesh textures creating an infinite tunnel illusion.'
  },
  {
    name: 'LightStrike',
    description: 'Lightning strike effects using custom geometry.',
    basedOn: 'https://www.youtube.com/watch?v=fezzkdjHoiI'
  },
  {
    name: 'Minecraft',
    description: 'Voxel-based Minecraft-style world with block placement and camera controls.',
    basedOn: 'https://youtu.be/tsOTCn0nROI?si=DY32m9v2Vl3jhQqy'
  },
  {
    name: 'MultiCamera',
    description:
      'You can create an array of cameras, each one with its own viewport and its own configurations.'
  },
  {
    name: 'MultiLayer',
    description: 'A multi layer texture demo, copying the original Disney machine in the 80s'
  },
  {
    name: 'PointsEarth',
    description: 'Using a canvas 2D to read an alpha image an generate points only when the image is black. Simulating continents'
  },
  {
    name: 'RandomMovement',
    description: 'Ant colony simulation with GSAP-powered random movements and walk cycle animations.',
    basedOn: 'https://skfb.ly/ZsMz'
  },
  {
    name: 'Ribbon',
    description: 'Animated 3D ribbon mesh with dynamic rendering and camera tracking.',
    basedOn: 'https://www.youtube.com/watch?v=87J8EhKMH6c'
  },
  {
    name: 'SkyDome',
    description: 'Demo of how to use Sky dome as a background'
  },
  {
    name: 'StencilMask',
    description:
      'Stencil is a technique to create a mask, in this demo I show how to use it to create a magic cube. this is often used to create basic portals with less'
  },
  {
    name: 'TwoScenes',
    description: 'Nested scenes using render targets - one scene rendered inside another.',
    basedOn: 'https://youtu.be/3qa-nFgFRBE?si=sqxg1c4q80QV1ibW'
  },
  {
    name: 'Voxel',
    description: 'Convert 3D models into voxel art using raycasting and instance meshes.',
    basedOn: 'https://tympanus.net/codrops/2023/03/28/turning-3d-models-to-voxel-art-with-three-js/'
  },
  {
    name: 'VueXYZ',
    description: 'simple demo using VueYZ library'
  },
]

export const fun = () => {
  return fun_routes.map((route) => {
    return generateRoute(route.name, 'Fun', route.description, route.link, route.basedOn)
  })
}