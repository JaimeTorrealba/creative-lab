import defaultLayout from '@/layouts/defaultLayout.vue'

export const html_demos = [
  {
    path: '/html_mix_demo',
    name: 'Mix with HTML Demo',
    meta: {
      layout: defaultLayout,
      name: 'A basic HTML-TresJs Mix',
      difficulty: 'mesium',
      isOnTres: true,
      section: 'html_demo',
      img: '/gifs/mixhtml_demo.gif',
      sourceCode:
        'https://github.com/JaimeTorrealba/creative-lab/blob/main/src/views/html_demos/MixHTMLDemo.vue',
      description:
        'A basic example of how to mix TresJs with some HTML. I use a camera config to make the units in ThreeJs match the pixels in HTML. Some hover effects on the image and some 3D icons. Also a simple fragment shader banner '
    },
    component: () => import('../views/html_demos/MixHTMLDemo.vue')
  }
]
