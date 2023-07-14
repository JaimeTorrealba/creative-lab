import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/HomeView.vue'
import defaultLayout from '@/layouts/defaultLayout.vue'
import { demos } from './demos.js'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'Home',
      meta:{
        // layout: defaultLayout
      },
      component: Home,
    },
    ...demos

    // {
    //   path: '/fire',
    //   name: 'Fire',
    //   meta:{
    //     layout: defaultLayout
    //   },
    //   component: () => import('../views/FireDemo.vue'),
    // },
    // {
    //   path: '/snake',
    //   name: 'Snake',
    //   meta:{
    //     layout: defaultLayout
    //   },
    //   component: () => import('../views/MotionPathDemo.vue'),
    // },
    // {
    //   path: '/nebula',
    //   name: 'Nebula',
    //   meta:{
    //     layout: defaultLayout
    //   },
    //   component: () => import('../views/NebulaDemo.vue'),
    // },
    // {
    //   path: '/slider',
    //   name: 'Slider',
    //   meta:{
    //     layout: defaultLayout
    //   },
    //   component: () => import('../views/SliderDemo.vue'),
    // },
    // {
    //   path: '/image_particles',
    //   name: 'Image_Particles',
    //   meta:{
    //     layout: defaultLayout
    //   },
    //   component: () => import('../views/ImageParticles.vue'),
    // },
    // {
    //   path: '/grass_demo',
    //   name: 'Grass_demo',
    //   meta:{
    //     layout: defaultLayout
    //   },
    //   component: () => import('../views/GrassDemo.vue'),
    // },
    // {
    //   path: '/drop_demo',
    //   name: 'Drop_Demo',
    //   meta:{
    //     layout: defaultLayout
    //   },
    //   component: () => import('../views/DropDemo.vue'),
    // },
    // {
    //   path: '/avatar_model',
    //   name: 'Avatar_Model',
    //   meta:{
    //     layout: defaultLayout
    //   },
    //   component: () => import('../views/AvatarModelDemo.vue'),
    // },
    // // {
    // //   path: '/DynamicTextEffect',
    // //   name: 'Dynamic_Form',
    // //   meta:{
    // //     layout: defaultLayout
    // //   },
    // //   component: () => import('../views/DynamicTextEffect.vue'),
    // // },
    // {
    //   path: '/multiCamera',
    //   name: 'Multi_Camera',
    //   meta:{
    //     layout: defaultLayout
    //   },
    //   component: () => import('../views/MultiCamera.vue'),
    // },
    // // {
    // //   path: '/infiniteBeam',
    // //   name: 'Infinite_Beam',
    // //   meta:{
    // //     layout: defaultLayout
    // //   },
    // //   component: () => import('../views/InfiniteBeamDemo.vue'),
    // // },
    // {
    //   path: '/glassmorphism',
    //   name: 'GlassMorphism',
    //   meta:{
    //     layout: defaultLayout
    //   },
    //   component: () => import('../views/GlassMorphism.vue'),
    // },
    // // {
    // //   path: '/mixHtml',
    // //   name: 'Mix_HTML',
    // //   meta:{
    // //     layout: defaultLayout
    // //   },
    // //   component: () => import('../views/MixHTMLDemo.vue'),
    // // },
    // // // Shaders
    // {
    //   path: '/MouseReveal',
    //   name: 'Mouse_Reveal',
    //   meta:{
    //     layout: defaultLayout
    //   },
    //   component: () => import('../views/MouseReveal.vue'),
    // },
    // {
    //   path: '/darkStar',
    //   name: 'Dark_Star',
    //   meta:{
    //     layout: defaultLayout
    //   },
    //   component: () => import('../views/DarkStarDemo.vue'),
    // },
    // // {
    // //   path: '/shaderParkIntegration',
    // //   name: 'ShaderParkIntegration',
    // //   component: () => import('../views/ShaderParkIntegrationDemo.vue'),
    // //     meta: {
    // //   layout: 'defaultLayout'
    // // },
    // // },
    // {
    //   path: '/destroyObject',
    //   name: 'Destroy_Objects',
    //   meta:{
    //     layout: defaultLayout
    //   },
    //   component: () => import('../views/DestroyGeosDemo.vue'),
    // },
    // {
    //   path: '/wave',
    //   name: 'Wave',
    //   meta:{
    //     layout: defaultLayout
    //   },
    //   component: () => import('../views/WaveDemo.vue'),
    // },
    // playground
    // {
    //   path: '/playground',
    //   name: 'Playground',
    //   meta:{
    //     layout: defaultLayout
    //   },
    //   component: () => import('../components/Playground/index.vue'),
    // }
    // { path: '/:pathMatch(.*)*', name: 'NotFound', component: NotFound },
    //     meta: {
    //   layout: 'errorLayout'
    // },
  ]
})

export default router
