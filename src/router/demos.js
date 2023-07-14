import defaultLayout from '@/layouts/defaultLayout.vue'

export const demos = [
  {
    path: '/avatar_demo',
    name: 'Avatar Demo',
    meta: {
      layout: defaultLayout,
      name: 'Simple 3D Avatar',
      difficulty: 'Easy',
      isOnTres: false,
      section: 'Demo',
      img: '/gifs/avatar_model.gif',
      sourceCode:
        'https://github.com/JaimeTorrealba/creative-lab/blob/main/src/views/demos/AvatarDemo.vue',
      description:
        'You can create a 3D model avatar, exporting in glb in just a few minutes using https://readyplayer.me/es'
    },
    component: () => import('../views/demos/AvatarDemo.vue')
  },
  {
    path: '/earth_demo',
    name: 'Earth Demo',
    meta: {
      layout: defaultLayout,
      name: 'Simple 3D Earth with markers',
      difficulty: 'Easy',
      isOnTres: false,
      section: 'Demo',
      img: '/gifs/earth_demo.gif',
      sourceCode:
        'https://github.com/JaimeTorrealba/creative-lab/blob/main/src/views/demos/EarthDemo.vue',
      description:
        'In this demo we can see how to create a 3D earth, make it draggable, some parallax clouds on top and add some markers (to any citiy). It has also stars, MouseParallax effects and a simple GUI to control the rotation speed.'
    },
    component: () => import('../views/demos/EarthDemo.vue')
  }
]
