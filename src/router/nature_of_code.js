import { generateRoute } from '../utils'

const nature_of_code = [
  {
    name: 'Attractor',
    description: 'This demo is based on the second chapter of the Nature of Code book by Daniel Shiffman. It simulates an attractors that pull other objects towards it.',
  },

  {
    name: 'Forces',
    description: 'This demo is based on the second chapter of the Nature of Code book by Daniel Shiffman. It simulates some basics forces like gravity and wind.'
  },
  {
    name: 'Mover',
    description: 'This demo is based on the first chapter of the Nature of Code book by Daniel Shiffman. It simulates a random a ball with different movements.'
  },
  {
    name: 'Walker',
    description: 'This demo is based on the first chapter of the Nature of Code book by Daniel Shiffman. It simulates a random steps around the canvas.',
  },
]

export const noc_demos = () => {
  return nature_of_code.map((route) => {
    return generateRoute(route.name, 'Noc', route.description, route.link, route.basedOn)
  })
}