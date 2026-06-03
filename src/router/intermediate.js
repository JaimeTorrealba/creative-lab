import { generateRoute } from '../utils'
import { TAGS } from '../utils/constants'

const intermediate_routes = [
  {
    name: 'CheapWater',
    basedOn: "https://github.com/mqnc/cheapwater/tree/main",
    tags: [TAGS.NATURE],
  },
  {
    name: 'FireSprites',
    tags: [TAGS.NATURE],
  },
  {
    name: 'FlowField',
    basedOn: 'https://natureofcode.com/autonomous-agents/',
    tags: [TAGS.NOC],
  },
  {
    name: 'FollowPath',
    basedOn: 'https://youtu.be/NH4rSzHLCp4',
  },
  {
    name: 'Glass',
    basedOn: 'https://tympanus.net/codrops/2021/10/27/creating-the-effect-of-transparent-glass-and-plastic-in-three-js/'
  },
  {
    name: 'GratingDiffraction',
  },
  {
    name: 'InfiniteTube',
  },
  {
    name: 'Electricity',
    basedOn: 'https://www.youtube.com/watch?v=fezzkdjHoiI',
    tags: [TAGS.NATURE],
  },
  {
    name: 'Minecraft',
    basedOn: 'https://youtu.be/tsOTCn0nROI?si=DY32m9v2Vl3jhQqy'
  },
  {
    name: 'MultiCamera',
  },
  {
    name: 'MultiLayer',
  },
  {
    name: 'PointsEarth',
  },
  {
    name: 'RandomMovement',
    basedOn: 'https://skfb.ly/ZsMz'
  },
  {
    name: 'Ribbon',
    basedOn: 'https://www.youtube.com/watch?v=87J8EhKMH6c'
  },
  {
    name: 'StencilMask',
  },
  {
    name: 'TwoScenes',
    basedOn: 'https://youtu.be/3qa-nFgFRBE?si=sqxg1c4q80QV1ibW'
  },
  {
    name: 'VehicleSteering',
    tags: [TAGS.NOC],
  },
  {
    name: 'VolumeSmoke',
    basedOn: 'https://github.com/mrdoob/three.js/blob/master/examples/webgpu_volume_lighting.html',
    tags: [TAGS.VOLUMETRICS],
  },
{
    name: 'Voxel',
    basedOn: 'https://tympanus.net/codrops/2023/03/28/turning-3d-models-to-voxel-art-with-three-js/'
  },
  {
    name: 'VueXYZ',
  },
  {
    name: 'ImageParticles',
    basedOn: 'https://youtu.be/vEaAheMO0bo',
    tags: [TAGS.PARTICLES],
  },
  {
    name: 'ImageReveal',
    basedOn: 'https://tympanus.net/codrops/2024/12/02/how-to-code-a-shader-based-reveal-effect-with-react-three-fiber-glsl/'
  },
  {
    name: 'ParallaxMap',
    tags: [TAGS.FRAGMENT],
  },
    {
    name: 'HtmlMix',
    tags: [TAGS.HTML],
  },
  {
    name: 'Attractor',
    tags: [TAGS.NOC],
  },
  {
    name: 'Forces',
    tags: [TAGS.NOC],
  },
  {
    name: 'Mover',
    tags: [TAGS.NOC],
  },
  {
    name: 'NBody',
    tags: [TAGS.NOC],
  },
  {
    name: 'Particles',
    tags: [TAGS.NOC, TAGS.PARTICLES],
  },
  {
    name: 'PathFollowing',
    basedOn: 'https://natureofcode.com/autonomous-agents/',
    tags: [TAGS.NOC],
  },
  {
    name: 'Pendulum',
    tags: [TAGS.NOC],
  },
  {
    name: 'PointingDirectionMotion',
    tags: [TAGS.NOC],
  },
  {
    name: 'Spring',
    tags: [TAGS.NOC],
  },
  {
    name: 'Walker',
    tags: [TAGS.NOC],
  },
].sort((a, b) => a.name.localeCompare(b.name))

export const intermediate = () => {
  return intermediate_routes.map((route) => {
    return generateRoute(route.name, 'Intermediate', route.basedOn, route.tags ? { tags: route.tags } : {})
  })
}