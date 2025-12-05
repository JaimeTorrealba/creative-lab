import { generateRoute } from '../utils'

const Random = [
  {
    name: 'Logomatic',
    description: 'Extract from the original clojure language, is a tool that create creative logos, created by Jack Rusher.',
    link: 'https://github.com/JaimeTorrealba/creative-lab/blob/main/src/views/Random/LogomaticView.vue',
    basedOn: 'https://github.com/jackrusher/logomatic/tree/master/src/logomatic'
  },
]

export const random_demos = () => {
  return Random.map((route) => {
    return generateRoute(route.name, 'Random', route.description, route.link, route.basedOn)
  })
}
