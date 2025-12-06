import { generateRoute } from '../utils'

const nature_of_code = [
  {
    name: 'Walker',
    description: 'This demo is based on the first chapter of the Nature of Code book by Daniel Shiffman. It simulates a random walker that moves around the canvas.',
  },
]

export const noc_demos = () => {
  return nature_of_code.map((route) => {
    return generateRoute(route.name, 'Noc', route.description, route.link, route.basedOn)
  })
}
