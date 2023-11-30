import defaultLayout from '@/layouts/defaultLayout.vue'

export const generateRoute = (name, section, description, howTo = false) => {
  const lowerCase = name.toLocaleLowerCase()
  const splitLowerText = lowerCase.split('-')
  const path = `/${splitLowerText[0]}${
    splitLowerText.length > 1 ? '_' + splitLowerText[1] : ''
  }_${section.toLocaleLowerCase()}`

  return {
    path,
    name: `${name} ${section}`,
    meta: {
      layout: defaultLayout,
      howTo,
      section: section + 's',
      img: `/gifs${path}.gif`,
      sourceCode: `https://github.com/JaimeTorrealba/creative-lab/blob/main/src/views/${section}/${name}.vue`,
      description
    },
    component: () => import(`../views/${section}/${name}.vue`)
  }
}
