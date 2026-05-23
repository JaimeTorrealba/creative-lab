import { generateRoute } from '../utils'
import { TAGS } from '../utils/constants'

const basic_routes = [
  {
    name: 'Avatar',
    basedOn: 'https://readyplayer.me/'
  },
  {
    name: 'BoneTweaks',
  },
  {
    name: 'CameraFollowPath',
  },
  {
    name: 'ChangedPivot',
  },
  {
    name: 'ClickFace',
  },
  {
    name: 'CloudLight',
  },
  {
    name: 'Collision',
  },
  {
    name: 'CornelBoxGI',
    tags: [TAGS.WEBGPU]
  },
  {
    name: 'CSG',
    basedOn: 'https://github.com/gkjohnson/three-bvh-csg'
  },
  {
    name: 'CSS2DRenderer',
    basedOn: 'https://youtu.be/0ZW3xrFhY3w?si=QkvzEikyeuv6H1Mb'
  },
  {
    name: 'Earth',
  },
  // {
  //   name: 'Fbos',
  //   description: 'WIP. working with the FBO component, it look like have an error so I need to check that'
  // },
  {
    name: 'Gaea',
  },
  {
    name: 'Guide',
  },
  {
    name: 'DynamicComponent',
  },
  {
    name: 'LabeledGeometry',
    basedOn: 'https://stemkoski.github.io/Three.js/Labeled-Geometry.html'
  },
  {
    name: 'LeomonLights',
    tags: [TAGS.WEBGPU]
  },
  {
    name: 'LightProbes',
  },
  {
    name: 'MaterialX',
    tags: [TAGS.WEBGPU]
  },
  {
    name: 'MeshLine',
  },
  {
    name: 'MirrorModifier',
  },
  {
    name: 'Nebula',
    basedOn: 'https://youtu.be/5f5wwQb22tE'
  },
  {
    name: 'ProceduralDC',
    basedOn: 'https://www.youtube.com/watch?v=qlfh_rv6khY'
  },
  {
    name: 'Quaternions',
  },
  {
    name: 'RandomPoints',
    basedOn: 'https://www.youtube.com/live/JaXb-hH2BIg?feature=share'
  },
  {
    name: 'Scatter',
    basedOn: 'https://github.com/JaimeTorrealba/three-scatter'
  },
  {
    name: 'SelectableGrid',
    basedOn: 'https://youtu.be/oQbfy8QP8Lc?si=mIsjZpQHHS5WFNUG'
  },
  {
    name: 'SixSides',
  },
  {
    name: 'SphericalCoords',
  },
  {
    name: 'TextureBombing',
  },
  {
    name: 'Transition',
  },
  {
    name: 'WorldCreator',
  },
  {
    name: 'PamCanvas',
    tags: [TAGS.HTML],
  },
  {
    name: 'HoverButton',
    basedOn: 'https://dribbble.com/shots/11386939-Play-with-Magic-Motion',
    tags: [TAGS.HTML],
  },
  {
    name: 'Carousel3D',
    tags: [TAGS.HTML],
  }
].sort((a, b) => a.name.localeCompare(b.name))

export const basic = () => {
  return basic_routes.map((route) => {
    return generateRoute(route.name, 'Basics', route.basedOn, route.tags ? { tags: route.tags } : {})
  })
}
