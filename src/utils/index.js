import defaultLayout from '@/layouts/defaultLayout.vue'

export const generateRoute = (name, section, description, howTo = false, test = false) => {
  const lowerCase = name.toLocaleLowerCase()
  const splitLowerText = lowerCase.split('-')
  const path = `/${splitLowerText[0]}${
    splitLowerText.length > 1 ? '_' + splitLowerText[1] : ''
  }_${section.toLocaleLowerCase()}`

  return {
    path,
    name: `${name} ${section}`,
    meta: {
      test,
      layout: defaultLayout,
      howTo,
      section,
      img: `/gifs${path}.gif`,
      sourceCode: `https://github.com/JaimeTorrealba/creative-lab/blob/main/src/views/demos/${name}${section}.vue`,
      description
    },
    component: () => import(`../views/demos/${name}${section}.vue`)
  }
}
