import { generateRoute } from '../utils'

const demos_routes = [
  {
    name: 'CSG',
    description: 'Example using the CSG library'
  },
  {
    name: 'CSS2DRenderer',
    description:
      'A different way to add HTML to your scenes (other than the already built HTML component). based on this video: https://youtu.be/0ZW3xrFhY3w?si=QkvzEikyeuv6H1Mb'
  },
  {
    name: 'FollowPath',
    description:
      'You can transform a model to follow a path (and svg one, in this case) and make it bend and rotate accordingly. This effect is base on: https://youtu.be/NH4rSzHLCp4'
  },
  {
    name: 'Fur',
    description:
      'A way to simulate fur, hair, grass, etc. Using the sampler technique in ThreeJs. This effect is base on https://youtu.be/n98UO5sUyLo.'
  },
  {
    name: 'Glass',
    description:
      'A glass/plastic effect you can achieve using physical material. This effect is base on: https://tympanus.net/codrops/2021/10/27/creating-the-effect-of-transparent-glass-and-plastic-in-three-js/.'
  },
  {
    name: 'InfiniteBeam',
    description:
      'It creates an infinite flow of particles without using a shader. This is the native way, but you have available an abstraction to do it in TresJs. https://cientos.tresjs.org/guide/abstractions/precipitation.html'
  },
  {
    name: 'InfiniteTube',
    description: 'A simple and funny way to create the illusion of an infinite tube.'
  },
  {
    name: 'Minecraft',
    description: 'Following this tutorial: https://youtu.be/tsOTCn0nROI?si=DY32m9v2Vl3jhQqy.'
  },
  {
    name: 'MirrorModifier',
    description: 'A simple Mirror modifier from scrath'
  },
  {
    name: 'MultiCamera',
    description:
      'You can create an array of cameras, each one with its own viewport and its own configurations.'
  },
  {
    name: 'MultiClone',
    description: 'A initial example of how to use an ArrayModifier to create meshes.'
  },
  {
    name: 'RandomMovement',
    description:
      'A fun example using random movements to create a ant colony with gsap. Thanks to "Ant walkcycle" (https://skfb.ly/ZsMz) by Matrix Rex is licensed under Creative Commons Attribution (http://creativecommons.org/licenses/by/4.0/)'
  },
  {
    name: 'RandomPoints',
    description: 'Simple plane with random points for future effects. This effect is base on: https://www.youtube.com/live/JaXb-hH2BIg?feature=share'
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
    description:
      'Using render target to create two scenes and, one inside the other. based on this video: https://youtu.be/3qa-nFgFRBE?si=sqxg1c4q80QV1ibW'
  },
  {
    name: 'VueXYZ',
    description: 'simple demo using VueYZ library'
  },
]

export const demos = () => {
  return demos_routes.map((route) => {
    return generateRoute(route.name, 'Demos', route.description, route.link)
  })
}