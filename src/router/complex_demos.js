import { generateRoute } from '../utils'
import { TAGS } from '../utils/constants'

const complex_routes = [
  {
    name: 'AtmosphericScattering',
    description:
      "GPU Gems 2 ch.16: a planet seen from orbit, its atmosphere ray-marched per pixel through the shell of air around it. Rayleigh and Mie single scattering are integrated along the view ray, with a second march toward the sun at every sample for the light that actually survives the trip, which is what reddens the limb and carves the terminator.",
    basedOn:
      'https://developer.nvidia.com/gpugems/gpugems2/part-ii-shading-lighting-and-shadows/chapter-16-accurate-atmospheric-scattering',
    tags: [TAGS.NATURE, TAGS.GPU_GEMS]
  },

  {
    name: 'BlueprintSketchy',
    description:
      'GPU Gems 2 ch.15: the scene depth-peeled into layers, each layer edge-detected from its normal and depth buffers, then either blended together as blueprint line work that shows the gears through the hull, or perturbed by two different turbulence uncertainty matrices for a sketchy drawing.',
    basedOn:
      'https://developer.nvidia.com/gpugems/gpugems2/part-ii-shading-lighting-and-shadows/chapter-15-blueprint-rendering-and-sketchy',
    tags: [TAGS.GPU_GEMS]
  },
  {
    name: 'DynamicAmbientOcclusion',
    description:
      'GPU Gems 2 ch.14: every vertex becomes an oriented disk, and accessibility is solved on the GPU each frame as a sum of disk-to-disk form factors, corrected over a second pass for double shadowing, then gathered again through the radiance form factor for colour bleeding and a bent normal.',
    basedOn:
      'https://developer.nvidia.com/gpugems/gpugems2/part-ii-shading-lighting-and-shadows/chapter-14-dynamic-ambient-occlusion-and',
    tags: [TAGS.GPU_GEMS]
  },
  {
    name: 'EffectiveWater',
    basedOn:
      'https://developer.nvidia.com/gpugems/gpugems/part-i-natural-effects/chapter-1-effective-water-simulation-physical-models',
    tags: [TAGS.NATURE, TAGS.GPU_GEMS]
  },
  {
    name: 'Fire',
    basedOn: 'https://github.com/mattatz/THREE.Fire',
    tags: [TAGS.NATURE]
  },
  {
    name: 'GPGPUFlowField',
    basedOn: 'https://threejs-journey.com/',
    tags: [TAGS.PARTICLES, TAGS.THREEJS_JOURNEY]
  },
  {
    name: 'GaussianSplat'
  },
  {
    name: 'HeightmapGenerator',
    tags: [TAGS.NATURE]
  },
  {
    name: 'JackknifeTransmittanceCloud',
    basedOn: 'https://momentsingraphics.de/SiggraphAsia2025.html',
    tags: [TAGS.NATURE]
  },
  {
    name: 'ShaderStar',
    basedOn: 'https://www.youtube.com/live/3krH52AhPqk?feature=share'
  },
  {
    name: 'SimonGrass',
    tags: [TAGS.NATURE]
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
    name: 'VolumetricSmoke',
    tags: [TAGS.RAYMARCH, TAGS.VOLUMETRICS]
  },
  {
    name: 'VulcanFire',
    basedOn:
      'https://developer.nvidia.com/gpugems/gpugems/part-i-natural-effects/chapter-6-fire-vulcan-demo',
    tags: [TAGS.NATURE, TAGS.GPU_GEMS]
  },
  {
    name: 'WavingGrass',
    basedOn:
      'https://developer.nvidia.com/gpugems/gpugems/part-i-natural-effects/chapter-7-rendering-countless-blades-waving-grass',
    tags: [TAGS.NATURE, TAGS.GPU_GEMS]
  }
]

export const complex = () => {
  return complex_routes.map((route) => {
    return generateRoute(
      route.name,
      'Complex',
      route.basedOn,
      route.tags ? { tags: route.tags } : {}
    )
  })
}
