import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/HomeView.vue'
import defaultLayout from '@/layouts/defaultLayout.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'Home',
      meta:{
        layout: defaultLayout
      },
      component: Home,
    },
    {
      path: '/earth',
      name: 'Earth',
      meta:{
        layout: defaultLayout
      },
      component: () => import('../views/EarthView.vue'),
    },
    {
      path: '/fire',
      name: 'Fire',
      meta:{
        layout: defaultLayout
      },
      component: () => import('../views/FireView.vue'),
    },
    {
      path: '/snake',
      name: 'Snake',
      meta:{
        layout: defaultLayout
      },
      component: () => import('../views/MotionPathView.vue'),
    },
    {
      path: '/nebula',
      name: 'Nebula',
      meta:{
        layout: defaultLayout
      },
      component: () => import('../views/NebulaView.vue'),
    },
    // {
    //   path: '/DynamicTextEffect',
    //   name: 'Dynamic_Form',
    //   meta:{
    //     layout: defaultLayout
    //   },
    //   component: () => import('../views/DynamicTextEffect.vue'),
    // },
    {
      path: '/multiCamera',
      name: 'Multi_Camera',
      meta:{
        layout: defaultLayout
      },
      component: () => import('../views/MultiCamera.vue'),
    },
    // {
    //   path: '/infiniteBeam',
    //   name: 'Infinite_Beam',
    //   meta:{
    //     layout: defaultLayout
    //   },
    //   component: () => import('../views/InfiniteBeamView.vue'),
    // },
    {
      path: '/glassmorphism',
      name: 'GlassMorphism',
      meta:{
        layout: defaultLayout
      },
      component: () => import('../views/GlassMorphism.vue'),
    },
    // {
    //   path: '/mixHtml',
    //   name: 'Mix_HTML',
    //   meta:{
    //     layout: defaultLayout
    //   },
    //   component: () => import('../views/MixHTMLView.vue'),
    // },
    // // Shaders
    {
      path: '/MouseReveal',
      name: 'Mouse_Reveal',
      meta:{
        layout: defaultLayout
      },
      component: () => import('../views/MouseReveal.vue'),
    },
    {
      path: '/darkStar',
      name: 'Dark_Star',
      meta:{
        layout: defaultLayout
      },
      component: () => import('../views/DarkStarView.vue'),
    },
    // {
    //   path: '/shaderParkIntegration',
    //   name: 'ShaderParkIntegration',
    //   component: () => import('../views/ShaderParkIntegrationView.vue'),
    //     meta: {
    //   layout: 'defaultLayout'
    // },
    // },
    {
      path: '/destroyObject',
      name: 'Destroy_Objects',
      meta:{
        layout: defaultLayout
      },
      component: () => import('../views/DestroyGeosView.vue'),
    },
    {
      path: '/wave',
      name: 'Wave',
      meta:{
        layout: defaultLayout
      },
      component: () => import('../views/WaveView.vue'),
    },
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
