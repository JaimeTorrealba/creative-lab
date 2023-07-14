import defaultLayout from '@/layouts/defaultLayout.vue'

export const shaders_demos = [
    {
        path: '/CSMDemo',
        name: 'Custom Shader Material Demo',
        meta: {
          layout: defaultLayout,
          name: 'How to extend materials',
          difficulty: 'easy',
          isOnTres: true,
          section: 'shader_demo',
          img: '/gifs/CSM_demo.gif',
          sourceCode:
            'https://github.com/JaimeTorrealba/creative-lab/blob/main/src/views/shader_demos/CSMDemo.vue',
          description:
            'You can see how to extend any material to add shaders and different capabilities. We use the Custom Shader Material library. In this example we extend the MeshPhyiscalMaterial used in the previus glass example'
        },
        component: () => import('../views/shader_demos/CSMDemo.vue')
      },
    {
        path: '/destroy_geometry_demo',
        name: 'Destroy geometry Demo',
        meta: {
          layout: defaultLayout,
          name: 'Destroy the vertex of a geometry',
          difficulty: 'medium',
          isOnTres: false,
          section: 'shader_demo',
          img: '/gifs/destroy_geometry_demo.gif',
          sourceCode:
            'https://github.com/JaimeTorrealba/creative-lab/blob/main/src/views/shader_demos/DestroyGeometryDemo.vue',
          description:
            'With this demo, you can see how to destroy and manipulate the individual vertex of any type of geometries. This effect is base on: https://www.youtube.com/live/frgmk0Wu76A?feature=share'
        },
        component: () => import('../views/shader_demos/DestroyGeometryDemo.vue')
      },
    {
        path: '/fire_demo',
        name: 'Fire Demo',
        meta: {
          layout: defaultLayout,
          name: 'Realistic fire',
          difficulty: 'Hard',
          isOnTres: false,
          section: 'shader_demo',
          img: '/gifs/fire_demo.gif',
          sourceCode:
            'https://github.com/JaimeTorrealba/creative-lab/blob/main/src/views/shader_demos/FireDemo.vue',
          description:
            'An example of Fire made with shaders. This effect is base on: https://github.com/mattatz/THREE.Fire'
        },
        component: () => import('../views/shader_demos/FireDemo.vue')
      },
    {
        path: '/shader_star_demo',
        name: 'Shader star Demo',
        meta: {
          layout: defaultLayout,
          name: 'A star made with shaders',
          difficulty: 'Hard',
          isOnTres: false,
          section: 'shader_demo',
          img: '/gifs/shader_star.gif',
          sourceCode:
            'https://github.com/JaimeTorrealba/creative-lab/blob/main/src/views/shader_demos/StarDemo.vue',
          description:
            'A star made with shaders, a combination of colors and techniques like fresnel, matrix rotation, multi layer. This effect is base on: https://www.youtube.com/live/3krH52AhPqk?feature=share'
        },
        component: () => import('../views/shader_demos/StarDemo.vue')
      },
]