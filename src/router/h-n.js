import { generateRoute } from '../utils'
import { TAGS } from '../utils/constants'

const h_n_routes = [
  {
    name: 'HeightmapGenerator',
    tags: [TAGS.NATURE]
  },
  {
    name: 'HoverButton',
    basedOn: 'https://dribbble.com/shots/11386939-Play-with-Magic-Motion',
    tags: [TAGS.BASIC, TAGS.HTML]
  },
  {
    name: 'HtmlMix',
    tags: [TAGS.HTML]
  },
  {
    name: 'Hyphae',
    basedOn: 'https://github.com/inconvergent/hyphae/blob/master/hyphae.py',
    tags: [TAGS.RANDOM]
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
    name: 'InfiniteTube'
  },
  {
    name: 'InstanceMesh'
  },
  {
    name: 'InstanceMesh2',
    basedOn: 'https://github.com/agargaro/instanced-mesh'
  },
  {
    name: 'InteriorPlane',
    basedOn: 'https://github.com/emirhanyener/three-interior-plane',
    tags: [TAGS.FRAGMENT]
  },
  {
    name: 'JackknifeTransmittanceCloud',
    basedOn: 'https://momentsingraphics.de/SiggraphAsia2025.html',
    tags: [TAGS.NATURE]
  },
  {
    name: 'KochCurve',
    basedOn: 'https://natureofcode.com/fractals/#the-koch-curve',
    tags: [TAGS.NOC]
  },
  {
    name: 'LabeledGeometry',
    basedOn: 'https://stemkoski.github.io/Three.js/Labeled-Geometry.html',
    tags: [TAGS.BASIC]
  },
  {
    name: 'LeomonLights',
    tags: [TAGS.BASIC, TAGS.WEBGPU]
  },
  {
    name: 'LightProbes',
    tags: [TAGS.BASIC]
  },
  {
    name: 'Logomatic',
    basedOn: 'https://github.com/jackrusher/logomatic/tree/master/src/logomatic',
    tags: [TAGS.RANDOM]
  },
  {
    name: 'MaterialX',
    tags: [TAGS.BASIC, TAGS.WEBGPU]
  },
  {
    name: 'MeshLine',
    tags: [TAGS.BASIC]
  },
  {
    name: 'Minecraft',
    basedOn: 'https://youtu.be/tsOTCn0nROI?si=DY32m9v2Vl3jhQqy'
  },
  {
    name: 'MirrorModifier',
    tags: [TAGS.BASIC]
  },
  {
    name: 'MorphingParticles',
    tags: [TAGS.PARTICLES, TAGS.THREEJS_JOURNEY]
  },
  {
    name: 'MouseReveal'
  },
  {
    name: 'Mover',
    basedOn: 'https://natureofcode.com/vectors/#motion-with-vectors',
    tags: [TAGS.NOC]
  },
  {
    name: 'MultiCamera'
  },
  {
    name: 'MultiLayer'
  },
  {
    name: 'N8aoRoom',
    basedOn: 'https://github.com/N8python/n8ao',
    tags: [TAGS.BASIC]
  },
  {
    name: 'NBody',
    basedOn: 'https://natureofcode.com/forces/#example-29-n-bodies',
    tags: [TAGS.NOC]
  },
  {
    name: 'Nebula',
    basedOn: 'https://youtu.be/5f5wwQb22tE',
    tags: [TAGS.BASIC]
  }
]

export const h_n = () => {
  return h_n_routes.map((route) => {
    return generateRoute(route.name, route.basedOn, {
      ...(route.tags ? { tags: route.tags } : {}),
      ...(route.img ? { img: route.img } : {})
    })
  })
}
