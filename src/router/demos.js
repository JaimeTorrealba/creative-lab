import defaultLayout from '@/layouts/defaultLayout.vue'

export const demos = [
  {
    path: '/avatar_demo',
    name: 'Avatar Demo',
    meta: {
      layout: defaultLayout,
      name: 'Simple 3D Avatar',
      difficulty: 'Easy',
      howTo: false,
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
      howTo: false,
      section: 'Demo',
      img: '/gifs/earth_demo.gif',
      sourceCode:
        'https://github.com/JaimeTorrealba/creative-lab/blob/main/src/views/demos/EarthDemo.vue',
      description:
        'In this demo we can see how to create a 3D earth, make it draggable, some parallax clouds on top and add some markers (to any citiy). It has also stars, MouseParallax effects and a simple GUI to control the rotation speed.'
    },
    component: () => import('../views/demos/EarthDemo.vue')
  },
  {
    path: '/follow_path_demo',
    name: 'Follow path Demo',
    meta: {
      layout: defaultLayout,
      name: 'A model following a path',
      difficulty: 'Medium',
      howTo: false,
      section: 'Demo',
      img: '/gifs/snake_demo.gif',
      sourceCode:
        'https://github.com/JaimeTorrealba/creative-lab/blob/main/src/views/demos/FollowPathDemo.vue',
      description:
        'You can transform a model to follow a path (and svg one, in this case) and make it bend and rotate accordingly. This effect is base on: https://youtu.be/NH4rSzHLCp4'
    },
    component: () => import('../views/demos/FollowPathDemo.vue')
  },
  {
    path: '/glass_demo',
    name: 'Glass Demo',
    meta: {
      layout: defaultLayout,
      name: 'Glass/Plastic effect',
      difficulty: 'Medium',
      howTo: false,
      section: 'Demo',
      img: '/gifs/glass_plastic_demo.gif',
      sourceCode:
        'https://github.com/JaimeTorrealba/creative-lab/blob/main/src/views/demos/GlassDemo.vue',
      description:
        'A glass/plastic effect you can achieve using physical material. This effect is base on: https://tympanus.net/codrops/2021/10/27/creating-the-effect-of-transparent-glass-and-plastic-in-three-js/.'
    },
    component: () => import('../views/demos/GlassDemo.vue')
  },
  {
    path: '/grass_demo',
    name: 'Grass Demo',
    meta: {
      layout: defaultLayout,
      name: 'Sampler effect like grass',
      difficulty: 'Medium',
      howTo: false,
      section: 'Demo',
      img: '/gifs/grass_demo.gif',
      sourceCode:
        'https://github.com/JaimeTorrealba/creative-lab/blob/main/src/views/demos/GrassDemo.vue',
      description:
        'A way to simulate fur, hair, grass, etc. Using the sampler technique in ThreeJs. This effect is base on https://youtu.be/n98UO5sUyLo.'
    },
    component: () => import('../views/demos/GrassDemo.vue')
  },
  {
    path: '/infinity_demo',
    name: 'Infinite particles Demo',
    meta: {
      layout: defaultLayout,
      name: 'An infinite flow of particles',
      difficulty: 'Medium',
      howTo: false,
      section: 'Demo',
      img: '/gifs/infinite_particles.gif',
      sourceCode:
        'https://github.com/JaimeTorrealba/creative-lab/blob/main/src/views/demos/InfiniteBeamDemo.vue',
      description:
        'It creates an infinite flow of particles without using a shader. This is the native way, but you have available an abstraction to do it in TresJs. https://cientos.tresjs.org/guide/abstractions/precipitation.html'
    },
    component: () => import('../views/demos/InfiniteBeamDemo.vue')
  },
  {
    path: '/instance_mesh_demo',
    name: 'Instance Mesh Demo',
    meta: {
      layout: defaultLayout,
      name: 'An Instance mesh test',
      difficulty: 'Easy',
      howTo: 'https://medium.com/@Jaimebboyjt/how-to-use-instancemesh-with-tresjs-fae8e3b48dcc',
      section: 'Demo',
      img: '/gifs/instance_mesh.gif',
      sourceCode:
        'https://github.com/JaimeTorrealba/creative-lab/blob/main/src/views/demos/InstanceMeshDemo.vue',
      description:
        'A test to try how the instance mesh works on Tresjs, also i was experiment with the OrthographicCamera (normally I just use the PerspectiveCamera).'
    },
    component: () => import('../views/demos/InstanceMeshDemo.vue')
  },
  {
    path: '/multi_camera_demo',
    name: 'Multi-camera Demo',
    meta: {
      layout: defaultLayout,
      name: 'An array of cameras',
      difficulty: 'Medium',
      howTo: false,
      section: 'Demo',
      img: '/gifs/multi_camera.gif',
      sourceCode:
        'https://github.com/JaimeTorrealba/creative-lab/blob/main/src/views/demos/MultiCamera.vue',
      description:
        'You can create an array of cameras, each one with its own viewport and its own configurations.'
    },
    component: () => import('../views/demos/MultiCamera.vue')
  },
  {
    path: '/nebula_demo',
    name: 'Nebula generator Demo',
    meta: {
      layout: defaultLayout,
      name: 'A simple nebula generator',
      difficulty: 'Easy',
      howTo: false,
      section: 'Demo',
      img: '/gifs/nebula_generator_demo.gif',
      sourceCode:
        'https://github.com/JaimeTorrealba/creative-lab/blob/main/src/views/demos/NebulaDemo.vue',
      description:
        'A simple nebula generator using smoke abstraction on cientos, and post-processing. This effect is base on: https://youtu.be/5f5wwQb22tE'
    },
    component: () => import('../views/demos/NebulaDemo.vue')
  },
  {
    path: '/random_movements',
    name: 'Random Movements Ants Demo',
    meta: {
      layout: defaultLayout,
      name: 'A ant colony with random movements',
      difficulty: 'Easy',
      howTo: false,
      section: 'Demo',
      img: '/gifs/ants.gif',
      sourceCode:
        'https://github.com/JaimeTorrealba/creative-lab/blob/main/src/views/demos/RandomAntsMovement.vue',
      description:
        'A fun example using random movements to create a ant colony with gsap. Thanks to "Ant walkcycle" (https://skfb.ly/ZsMz) by Matrix Rex is licensed under Creative Commons Attribution (http://creativecommons.org/licenses/by/4.0/)'
    },
    component: () => import('../views/demos/RandomAntsMovement.vue')
  },
  // {
  //   path: '/transition_demo',
  //   name: 'Transition Vue API Demo',
  //   meta: {
  //     layout: defaultLayout,
  //     name: 'A ant colony with random movements',
  //     difficulty: 'Easy',
  //     howTo: false,
  //     section: 'Demo',
  //     img: '/gifs/antss.gif',
  //     sourceCode:
  //       'https://github.com/JaimeTorrealba/creative-lab/blob/main/src/views/demos/TransitionDemo.vue',
  //     description:
  //       'A fun example using random movements to create a ant colony with gsap. Thanks to "Ant walkcycle" (https://skfb.ly/ZsMz) by Matrix Rex is licensed under Creative Commons Attribution (http://creativecommons.org/licenses/by/4.0/)'
  //   },
  //   component: () => import('../views/demos/TransitionDemo.vue')
  // },
  {
    path: '/six_sides_demo',
    name: 'Six textures Demo',
    meta: {
      layout: defaultLayout,
      name: 'Render a cube with different textures',
      difficulty: 'Easy',
      howTo: false,
      section: 'Demo',
      img: '/gifs/six_sides_demo.gif',
      sourceCode:
        'https://github.com/JaimeTorrealba/creative-lab/blob/main/src/views/demos/SixSidesDemo.vue',
      description:
        'A fun example using random movements to create a ant colony with gsap. Thanks to "Ant walkcycle" (https://skfb.ly/ZsMz) by Matrix Rex is licensed under Creative Commons Attribution (http://creativecommons.org/licenses/by/4.0/)'
    },
    component: () => import('../views/demos/SixSidesDemo.vue')
  },
  {
    path: '/infinite_tube_demo',
    name: 'Infinite Tube Demo',
    meta: {
      layout: defaultLayout,
      name: 'Illution of infinite tube',
      difficulty: 'Easy',
      howTo: false,
      section: 'Demo',
      img: '/gifs/six_sides_demo.gif',
      sourceCode:
        'https://github.com/JaimeTorrealba/creative-lab/blob/main/src/views/demos/InfiniteTube.vue',
      description:
        ''
    },
    component: () => import('../views/demos/InfiniteTube.vue')
  },

]
