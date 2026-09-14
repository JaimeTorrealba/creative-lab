import defaultLayout from '@/layouts/defaultLayout.vue'

export const BLACK_LIST_PATHS = ['/', '/template', '/cartesiancoords', '/:pathMatch(.*)*']

const BUCKETS = [
  { folder: 'A-C', letters: 'ABC' },
  { folder: 'D-G', letters: 'DEFG' },
  { folder: 'H-N', letters: 'HIJKLMN' },
  { folder: 'O-S', letters: 'OPQRS' },
  { folder: 'T-Z', letters: 'TUVWXYZ' }
]

export const getBucket = (name) => {
  const firstLetter = name.charAt(0).toLocaleUpperCase()
  const bucket = BUCKETS.find(({ letters }) => letters.includes(firstLetter))
  return bucket.folder
}

export const generateRoute = (name, basedOn, extraMeta = {}) => {
  const lowerCase = name.toLocaleLowerCase()
  const splitLowerText = lowerCase.split('-')
  const path = `/${splitLowerText[0]}${splitLowerText.length > 1 ? '_' + splitLowerText[1] : ''}`
  const bucket = getBucket(name)
  const baseURL = 'https://github.com/JaimeTorrealba/creative-lab/blob/main/src/'
  const sourceCodePath = `${baseURL}views/${bucket}/${name}View.vue`

  return {
    path,
    name,
    meta: {
      layout: defaultLayout,
      bucket,
      img: `/thumbnails/${bucket}/${name}.mp4`,
      sourceCode: sourceCodePath,
      basedOn,
      ...extraMeta
    },
    component: () => import(`../views/${bucket}/${name}View.vue`)
  }
}
