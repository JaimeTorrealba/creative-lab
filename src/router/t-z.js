import { generateRoute } from '../utils'
import { TAGS } from '../utils/constants'

const t_z_routes = [
  {
    name: 'TextureBombing',
    tags: [TAGS.BASIC]
  },
  {
    name: 'TextureParticleCursor',
    tags: [TAGS.PARTICLES, TAGS.THREEJS_JOURNEY]
  },
  {
    name: 'ThirdPerson',
    basedOn: 'https://youtu.be/C3s0UHpwlf8?si=JdxnmkFwgAxoOdk7',
    tags: [TAGS.CONTROLS]
  },
  {
    name: 'TileBasedTexture',
    basedOn:
      'https://developer.nvidia.com/gpugems/gpugems2/part-ii-shading-lighting-and-shadows/chapter-12-tile-based-texture-mapping',
    tags: [TAGS.FRAGMENT, TAGS.GPU_GEMS]
  },
  {
    name: 'Transition',
    tags: [TAGS.BASIC]
  },
  {
    name: 'TwoScenes',
    basedOn: 'https://youtu.be/3qa-nFgFRBE?si=sqxg1c4q80QV1ibW'
  },
  {
    name: 'UberLight',
    basedOn:
      'https://developer.nvidia.com/gpugems/gpugems/part-ii-lighting-and-shadows/chapter-10-cinematic-lighting',
    tags: [TAGS.GPU_GEMS]
  },
  {
    name: 'VehicleSeparation',
    basedOn: 'https://natureofcode.com/autonomous-agents/#example-59-separation',
    tags: [TAGS.NOC]
  },
  {
    name: 'VehicleSteering',
    basedOn: 'https://natureofcode.com/autonomous-agents/#example-51-seeking-a-target',
    tags: [TAGS.NOC]
  },
  {
    name: 'VertexTextureWater',
    basedOn:
      'https://developer.nvidia.com/gpugems/gpugems2/part-ii-shading-lighting-and-shadows/chapter-18-using-vertex-texture-displacement',
    tags: [TAGS.NATURE, TAGS.GPU_GEMS]
  },
  {
    name: 'VideoFromImages'
  },
  {
    name: 'VirtualBotany',
    basedOn:
      'https://developer.nvidia.com/gpugems/gpugems2/part-i-geometric-complexity/chapter-1-toward-photorealism-virtual-botany',
    tags: [TAGS.NATURE, TAGS.GPU_GEMS]
  },
  {
    name: 'VolumeSmoke',
    basedOn: 'https://github.com/mrdoob/three.js/blob/master/examples/webgpu_volume_lighting.html',
    tags: [TAGS.VOLUMETRICS]
  },
  {
    name: 'Volumetric',
    tags: [TAGS.VOLUMETRICS]
  },
  {
    name: 'VolumetricSmoke',
    tags: [TAGS.RAYMARCH, TAGS.VOLUMETRICS]
  },
  {
    name: 'Voronoid',
    basedOn: 'https://thebookofshaders.com/12/',
    tags: [TAGS.FRAGMENT]
  },
  {
    name: 'Voxel',
    basedOn: 'https://tympanus.net/codrops/2023/03/28/turning-3d-models-to-voxel-art-with-three-js/'
  },
  {
    name: 'VueXYZ'
  },
  {
    name: 'VulcanFire',
    basedOn:
      'https://developer.nvidia.com/gpugems/gpugems/part-i-natural-effects/chapter-6-fire-vulcan-demo',
    tags: [TAGS.NATURE, TAGS.GPU_GEMS]
  },
  {
    name: 'Walker',
    basedOn: 'https://natureofcode.com/random/',
    tags: [TAGS.NOC]
  },
  {
    name: 'WaterReflector',
    tags: [TAGS.NATURE]
  },
  {
    name: 'WaterRipple',
    tags: [TAGS.NATURE]
  },
  {
    name: 'Wave',
    basedOn: 'https://www.youtube.com/live/JaXb-hH2BIg?feature=share',
    tags: [TAGS.FRAGMENT]
  },
  {
    name: 'WavingGrass',
    basedOn:
      'https://developer.nvidia.com/gpugems/gpugems/part-i-natural-effects/chapter-7-rendering-countless-blades-waving-grass',
    tags: [TAGS.NATURE, TAGS.GPU_GEMS]
  },
  {
    name: 'WorldCreator',
    img: '/thumbnails/T-Z/WorldCreator.jpg',
    tags: [TAGS.BASIC, TAGS.NATURE]
  },
  {
    name: 'WorldWalker',
    basedOn: 'https://github.com/Tresjs/rapier',
    tags: [TAGS.CONTROLS]
  }
]

export const t_z = () => {
  return t_z_routes.map((route) => {
    return generateRoute(route.name, route.basedOn, {
      ...(route.tags ? { tags: route.tags } : {}),
      ...(route.img ? { img: route.img } : {})
    })
  })
}
