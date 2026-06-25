import { generateRoute } from '../utils'
import { TAGS } from '../utils/constants'

const noc_routes = [
  {
    name: 'Attractor',
    tags: [TAGS.NOC],
  },
  {
    name: 'FlowField',
    basedOn: 'https://natureofcode.com/autonomous-agents/',
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
    name: 'VehicleSeparation',
    basedOn: 'https://natureofcode.com/autonomous-agents/#example-59-separation',
    tags: [TAGS.NOC],
  },
  {
    name: 'VehicleSteering',
    tags: [TAGS.NOC],
  },
  {
    name: 'Walker',
    tags: [TAGS.NOC],
  },
].sort((a, b) => a.name.localeCompare(b.name))

export const noc = () => {
  return noc_routes.map((route) => {
    return generateRoute(route.name, 'Noc', route.basedOn, { tags: route.tags })
  })
}
