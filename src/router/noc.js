import { generateRoute } from '../utils'
import { TAGS } from '../utils/constants'

const noc_routes = [
  {
    name: 'Attractor',
    basedOn: 'https://natureofcode.com/forces/#gravitational-attraction',
    tags: [TAGS.NOC],
  },
  {
    name: 'CellularAutomata',
    basedOn: 'https://natureofcode.com/cellular-automata/#example-71-wolfram-elementary-cellular-automata',
    tags: [TAGS.NOC],
  },
  {
    name: 'GameOfLife',
    basedOn: 'https://natureofcode.com/cellular-automata/#the-game-of-life',
    tags: [TAGS.NOC],
  },
  {
    name: 'FlowField',
    basedOn: 'https://natureofcode.com/autonomous-agents/',
    tags: [TAGS.NOC],
  },
  {
    name: 'Forces',
    basedOn: 'https://natureofcode.com/forces/#example-21-forces',
    tags: [TAGS.NOC],
  },
  {
    name: 'Mover',
    basedOn: 'https://natureofcode.com/vectors/#motion-with-vectors',
    tags: [TAGS.NOC],
  },
  {
    name: 'NBody',
    basedOn: 'https://natureofcode.com/forces/#example-29-n-bodies',
    tags: [TAGS.NOC],
  },
  {
    name: 'Particles',
    basedOn: 'https://natureofcode.com/particles/#example-47-a-particle-system-with-a-repeller',
    tags: [TAGS.NOC, TAGS.PARTICLES],
  },
  {
    name: 'PathFollowing',
    basedOn: 'https://natureofcode.com/autonomous-agents/',
    tags: [TAGS.NOC],
  },
  {
    name: 'Pendulum',
    basedOn: 'https://natureofcode.com/oscillation/#example-311-swinging-pendulum',
    tags: [TAGS.NOC],
  },
  {
    name: 'PointingDirectionMotion',
    basedOn: 'https://natureofcode.com/autonomous-agents/#vehicles-and-steering',
    tags: [TAGS.NOC],
  },
  {
    name: 'Spring',
    basedOn: 'https://natureofcode.com/oscillation/#example-310-a-spring-connection',
    tags: [TAGS.NOC],
  },
  {
    name: 'VehicleSeparation',
    basedOn: 'https://natureofcode.com/autonomous-agents/#example-59-separation',
    tags: [TAGS.NOC],
  },
  {
    name: 'VehicleSteering',
    basedOn: 'https://natureofcode.com/autonomous-agents/#example-51-seeking-a-target',
    tags: [TAGS.NOC],
  },
  {
    name: 'Walker',
    basedOn: 'https://natureofcode.com/random/',
    tags: [TAGS.NOC],
  },
].sort((a, b) => a.name.localeCompare(b.name))

export const noc = () => {
  return noc_routes.map((route) => {
    return generateRoute(route.name, 'Noc', route.basedOn, { tags: route.tags })
  })
}
