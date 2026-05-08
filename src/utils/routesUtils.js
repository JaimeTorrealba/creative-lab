import defaultLayout from '@/layouts/defaultLayout.vue'

export const BLACK_LIST_PATHS = ['/', '/template', '/cartesiancoords', '/:pathMatch(.*)*']

export const generateRoute = (name, section, description, basedOn, extraMeta = {}) => {
  const lowerCase = name.toLocaleLowerCase()
  const splitLowerText = lowerCase.split('-')
  const path = `/${splitLowerText[0]}${
    splitLowerText.length > 1 ? '_' + splitLowerText[1] : ''
  }`
  const baseURL = 'https://github.com/JaimeTorrealba/creative-lab/blob/main/src/'
  const sourceCodePath = `${baseURL}views/${section}/${name}View.vue`

  return {
    path,
    name: `${name} ${section}`,
    meta: {
      layout: defaultLayout,
      section,
      img: `/gifs/${section}/${name}.gif`,
      sourceCode: sourceCodePath,
      description,
      basedOn,
      ...extraMeta
    },
    component: () => import(`../views/${section}/${name}View.vue`)
  }
}
