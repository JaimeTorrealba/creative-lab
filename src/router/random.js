import { generateRoute } from '../utils'
import { TAGS } from '../utils/constants'

const Random = [
  {
    name: 'BitonicSort',
    tags: [TAGS.RANDOM],
  },

  {
    name: 'DifferentialLattice',
    tags: [TAGS.RANDOM],
    basedOn: 'https://github.com/inconvergent/differential-lattice'
  },
  {
    name: 'Fracture',
    tags: [TAGS.RANDOM],
    basedOn: 'https://github.com/inconvergent/fracture'
  },
  {
    name: 'GenerativeTree',
    tags: [TAGS.RANDOM],
  },
  {
    name: 'Hyphae',
    tags: [TAGS.RANDOM],
    basedOn: 'https://github.com/inconvergent/hyphae/blob/master/hyphae.py'
  },
  {
    name: 'Logomatic',
    tags: [TAGS.RANDOM],
    basedOn: 'https://github.com/jackrusher/logomatic/tree/master/src/logomatic'
  },
  {
    name: 'PlainWebgl',
    tags: [TAGS.RANDOM],
    img: '/thumbnails/Random/PlainWebgl.jpg',
  },
  {
    name: 'PlainWebgpu',
    tags: [TAGS.RANDOM, TAGS.WEBGPU],
    img: '/thumbnails/Random/PlainWebgpu.jpg',
  },
]

export const random_demos = () => {
  return Random.map((route) => {
    return generateRoute(route.name, 'Random', route.basedOn, {
      ...(route.tags ? { tags: route.tags } : {}),
      ...(route.img ? { img: route.img } : {}),
    })
  })
}
