import defaultLayout from '@/layouts/defaultLayout.vue'

export const demos = [
    {
        path: '/earth',
        name: 'Earth Demo',
        meta:{
          layout: defaultLayout,
          name: 'Simple 3D Earth with markers, draggable',
          difficulty: 'Easy',
          img: '',
          sourceCode: '',
          Description: 'In this demo we can see how to create a 3D earth, make it draggable, some parallax clouds on top and add some markers (to any citiy). It has also stars, MouseParallax effects and a simple GUI to control the rotation speed.',
        },
        component: () => import('../views/demos/EarthDemo.vue'),
      },
]