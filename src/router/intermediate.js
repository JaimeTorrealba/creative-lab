import { generateRoute } from '../utils'
import { TAGS } from '../utils/constants'

const intermediate_routes = [
  {
    name: 'BetterFog',
    description:
      "The four fog techniques from iquilez's article: distance, sun scattering, extinction/inscattering and analytic height-based fog, applied to a heightmap terrain in a custom shader.",
    basedOn: 'https://iquilezles.org/articles/fog/',
    tags: [TAGS.NATURE]
  },

  {
    name: 'CheapWater',
    basedOn: 'https://github.com/mqnc/cheapwater/tree/main',
    tags: [TAGS.NATURE]
  },
  {
    name: 'FireSprites',
    tags: [TAGS.NATURE]
  },
  {
    name: 'FollowPath',
    basedOn: 'https://youtu.be/NH4rSzHLCp4'
  },
  {
    name: 'Glass',
    basedOn:
      'https://tympanus.net/codrops/2021/10/27/creating-the-effect-of-transparent-glass-and-plastic-in-three-js/'
  },
  {
    name: 'GratingDiffraction'
  },
  {
    name: 'InfiniteTube'
  },
  {
    name: 'Electricity',
    basedOn: 'https://www.youtube.com/watch?v=fezzkdjHoiI',
    tags: [TAGS.NATURE]
  },
  {
    name: 'Minecraft',
    basedOn: 'https://youtu.be/tsOTCn0nROI?si=DY32m9v2Vl3jhQqy'
  },
  {
    name: 'MultiCamera'
  },
  {
    name: 'MultiLayer'
  },
  {
    name: 'PointsEarth'
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
    name: 'StencilMask'
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
    name: 'VolumeSmoke',
    basedOn: 'https://github.com/mrdoob/three.js/blob/master/examples/webgpu_volume_lighting.html',
    tags: [TAGS.VOLUMETRICS]
  },
  {
    name: 'Voxel',
    basedOn: 'https://tympanus.net/codrops/2023/03/28/turning-3d-models-to-voxel-art-with-three-js/'
  },
  {
    name: 'VueXYZ'
  },
  {
    name: 'ImageParticles',
    basedOn: 'https://youtu.be/vEaAheMO0bo',
    tags: [TAGS.PARTICLES]
  },
  {
    name: 'ImageReveal',
    basedOn:
      'https://tympanus.net/codrops/2024/12/02/how-to-code-a-shader-based-reveal-effect-with-react-three-fiber-glsl/'
  },
  {
    name: 'ParallaxMap',
    tags: [TAGS.FRAGMENT]
  },
  {
    name: 'HtmlMix',
    tags: [TAGS.HTML]
  }
].sort((a, b) => a.name.localeCompare(b.name))

export const intermediate = () => {
  return intermediate_routes.map((route) => {
    return generateRoute(
      route.name,
      'Intermediate',
      route.basedOn,
      route.tags ? { tags: route.tags } : {}
    )
  })
}
