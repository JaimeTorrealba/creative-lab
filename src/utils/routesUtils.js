import defaultLayout from '@/layouts/defaultLayout.vue'

export const BLACK_LIST_PATHS = ['/', '/template', '/cartesiancoords']

export const generateRoute = (name, section, description, howTo = false) => {
  const lowerCase = name.toLocaleLowerCase()
  const splitLowerText = lowerCase.split('-')
  const path = `/${splitLowerText[0]}${
    splitLowerText.length > 1 ? '_' + splitLowerText[1] : ''
  }`
  console.log('jaime ~ generateRoute ~ splitLowerText:', name);

  return {
    path,
    name: `${name} ${section}`,
    meta: {
      layout: defaultLayout,
      howTo,
      section,
      img: `/gifs/${section}/${name}.gif`,
      sourceCode: `https://github.com/JaimeTorrealba/creative-lab/blob/main/src/views/${section}/${name}View.vue`,
      description
    },
    component: () => import(`../views/${section}/${name}View.vue`)
  }
}
