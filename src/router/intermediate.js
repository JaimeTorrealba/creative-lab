import { generateRoute } from '../utils'
import { TAGS } from '../utils/constants'

const intermediate_routes = [
  {
    name: 'CheapWater',
    description: 'Not so realistic water simulation with ripples.',
    basedOn: "https://github.com/mqnc/cheapwater/tree/main"
  },
  {
    name: 'FollowPath',
    description: 'Model follows an SVG path with automatic bending and rotation.',
    basedOn: 'https://youtu.be/NH4rSzHLCp4',
  },
  {
    name: 'Glass',
    description: 'Glass and plastic transparency effects using MeshPhysicalMaterial.',
    basedOn: 'https://tympanus.net/codrops/2021/10/27/creating-the-effect-of-transparent-glass-and-plastic-in-three-js/'
  },
  {
    name: 'GratingDiffraction',
    description: 'A spinning CD disc with a physics-based diffraction grating shader that produces iridescent rainbow sweeps over a metallic silver surface.'
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
    name: 'VolumeSmoke',
    description: 'Volumetric lighting with animated Perlin-noise smoke using VolumeNodeMaterial and post-processing ray-marching pass.',
    basedOn: 'https://github.com/mrdoob/three.js/blob/master/examples/webgpu_volume_lighting.html'
  },
  // {
  //   name: 'Vfx',
  //   description: ''
  // },
  {
    name: 'Voxel',
    description: 'Convert 3D models into voxel art using raycasting and instance meshes.',
    basedOn: 'https://tympanus.net/codrops/2023/03/28/turning-3d-models-to-voxel-art-with-three-js/'
  },
  {
    name: 'VueXYZ',
    description: 'simple demo using VueYZ library'
  },
  {
    name: 'ImageParticles',
    description: 'Transform images into individually animated particles.',
    basedOn: 'https://youtu.be/vEaAheMO0bo'
  },
  {
    name: 'ImageReveal',
    description: 'Shader-based image reveal transition effect.',
    basedOn: 'https://tympanus.net/codrops/2024/12/02/how-to-code-a-shader-based-reveal-effect-with-react-three-fiber-glsl/'
  },
  {
    name: 'ParallaxMap',
    description:
      'Using different parallax map types in three.js.'
  },
    {
    name: 'HtmlMix',
    description: 'Blend HTML and WebGL using pixel-matched camera coordinates with hover effects and 3D icons.',
    tag: TAGS.HTML,
  },
  {
    name: 'Attractor',
    description: 'This demo is based on the second chapter of the Nature of Code book by Daniel Shiffman. It simulates an attractors that pull other objects towards it.',
    tag: TAGS.NOC,
  },
  {
    name: 'Forces',
    description: 'This demo is based on the second chapter of the Nature of Code book by Daniel Shiffman. It simulates some basics forces like gravity and wind.',
    tag: TAGS.NOC,
  },
  {
    name: 'Mover',
    description: 'This demo is based on the first chapter of the Nature of Code book by Daniel Shiffman. It simulates a random a ball with different movements.',
    tag: TAGS.NOC,
  },
  {
    name: 'NBody',
    description: 'This demo is based on the second chapter of the Nature of Code book by Daniel Shiffman. Extenending the Attractor demo this is just a simple step forward where each sphere attract another sphere.',
    tag: TAGS.NOC,
  },
  {
    name: 'Particles',
    description: 'Chapter 4 of the Nature of Code book by Daniel Shiffman is all about particle systems. This demo is a simple implementation of a particle with three.js.',
    tag: TAGS.NOC,
  },
  {
    name: 'Pendulum',
    description: 'Last excercise of the third chapter of the Nature of Code book by Daniel Shiffman. It simulates a pendulum movement using angular motion equations.',
    tag: TAGS.NOC,
  },
  {
    name: 'PointingDirectionMotion',
    description: 'This demo is based on the third chapter of the Nature of Code book by Daniel Shiffman. Extending the mover demo, this one point the direction of an rectangle mesh towards its destination.',
    tag: TAGS.NOC,
  },
  {
    name: 'Spring',
    description: 'This demo is based on the third chapter of the Nature of Code book by Daniel Shiffman. A simple spring (here I didnt use the particle version).',
    tag: TAGS.NOC,
  },
  {
    name: 'Walker',
    description: 'This demo is based on the first chapter of the Nature of Code book by Daniel Shiffman. It simulates a random steps around the canvas.',
    tag: TAGS.NOC,
  },
].sort((a, b) => a.name.localeCompare(b.name))

export const intermediate = () => {
  return intermediate_routes.map((route) => {
    return generateRoute(route.name, 'Intermediate', route.description, route.basedOn, route.tag ? { tag: route.tag } : {})
  })
}