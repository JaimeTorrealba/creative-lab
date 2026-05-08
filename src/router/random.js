import { generateRoute } from '../utils'
import { TAGS } from '../utils/constants'

const Random = [
  {
    name: 'DifferentialLattice',
    description: 'Nodes form a dynamic lattice through spring forces and relative-neighborhood connections, growing outward like slime mold or biological tissue.',
    basedOn: 'https://github.com/inconvergent/differential-lattice'
  },

  {
    name: 'Fracture',
    description: 'Generative crack patterns: fractures seek attractor points and stop when they collide, mimicking broken glass or craquelure.',
    basedOn: 'https://github.com/inconvergent/fracture'
  },

  {
    name: 'GenerativeTree',
    description: ''
  },

  {
    name: 'Hyphae',
    description: 'A generative art demo inspired by fungal growth patterns.',
    basedOn: 'https://github.com/inconvergent/hyphae/blob/master/hyphae.py'
  },

  {
    name: 'Logomatic',
    description: 'Extract from the original clojure language, is a tool that create creative logos, created by Jack Rusher.',
    basedOn: 'https://github.com/jackrusher/logomatic/tree/master/src/logomatic'
  },
  {
    name: 'PlainWebgl',
    description: 'Using plain WebGL to create the most simple demo, a triangle with colors'
  },
  {
    name: 'PlainWebgpu',
    description: 'Using plain WebGPU to create the most simple demo, a triangle with colors',
    tag: TAGS.WEBGPU
  },
]

export const random_demos = () => {
  return Random.map((route) => {
    return generateRoute(route.name, 'Random', route.description, route.basedOn, {
      tag: route.tag
    })
  })
}
