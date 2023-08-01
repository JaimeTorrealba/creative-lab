import defaultLayout from '@/layouts/defaultLayout.vue'

export const fragment_demos = [
  {
    path: '/fragment_template',
    name: 'Fragment Template',
    meta: {
      layout: defaultLayout,
      name: 'Fragment shader template',
      difficulty: 'Easy',
      isOnTres: false,
      section: 'frag_demo',
      img: '/gifs/fragment_template.gif',
      sourceCode:
        'https://github.com/JaimeTorrealba/creative-lab/blob/main/src/views/fragment_demos/FragmentTemplate.vue',
      description: 'My personal fragment shader template.'
    },
    component: () => import('../views/fragment_demos/FragmentTemplate.vue')
  },
  {
    path: '/ray_marching_demo',
    name: 'Ray Marching Demo',
    meta: {
      layout: defaultLayout,
      name: 'Playing with ray march technique',
      difficulty: 'hard',
      isOnTres: false,
      section: 'frag_demo',
      img: '/gifs/ray_march_demo.gif',
      sourceCode:
        'https://github.com/JaimeTorrealba/creative-lab/blob/main/src/views/fragment_demos/RayMarching.vue',
      description:
        'Basic of the ray marching, understanding the distance function and how to use it. playing with it and creating kind of a template'
    },
    component: () => import('../views/fragment_demos/RayMarching.vue')
  },
  {
    path: '/ray_marching_operations',
    name: 'Ray Marching Operations',
    meta: {
      layout: defaultLayout,
      name: 'Playing with ray march operations',
      difficulty: 'hard',
      isOnTres: false,
      section: 'frag_demo',
      img: '/gifs/ray_march_union.gif',
      sourceCode:
        'https://github.com/JaimeTorrealba/creative-lab/blob/main/src/views/fragment_demos/RayMarchingOperations.vue',
      description:
        'An interesting effect of how to use transparency in combination with the mouse to reveal the content behind'
    },
    component: () => import('../views/fragment_demos/RayMarchingOperations.vue')
  },
  {
    path: '/ray_marching_tweaks',
    name: 'Ray Marching Tweaks',
    meta: {
      layout: defaultLayout,
      name: 'Tweaks in ray march',
      difficulty: 'hard',
      isOnTres: false,
      section: 'frag_demo',
      img: '/gifs/ray_march_demo.gif',
      sourceCode:
        'https://github.com/JaimeTorrealba/creative-lab/blob/main/src/views/fragment_demos/RayMarchingTweaks.vue',
      description:
        'Basic of the ray marching, understanding the distance function and how to use it. playing with it and creating kind of a template'
    },
    component: () => import('../views/fragment_demos/RayMarchingTweaks.vue')
  },
  {
    path: '/rinnegan_demo',
    name: 'Rinnegan Demo',
    meta: {
      layout: defaultLayout,
      name: 'Trying to replicate the Rinnegan',
      difficulty: 'medium',
      isOnTres: false,
      section: 'frag_demo',
      img: '/gifs/rinnegan_demo.png',
      sourceCode:
        'https://github.com/JaimeTorrealba/creative-lab/blob/main/src/views/fragment_demos/RinneganDemo.vue',
      description: 'My personal fragment shader template.'
    },
    component: () => import('../views/fragment_demos/RinneganDemo.vue')
  }
]
