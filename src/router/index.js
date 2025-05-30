import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/HomeView.vue'
import { basic } from './basic.js'
import { textures_demos } from './textures_effects.js'
import { demos } from './demos.js'
import { shaders_demos } from './shaders_demos'
import { html_demos } from './html_demos'
import { fragment_demos } from './fragment_demos'
import { controls_demos } from './controls_demos'
// import { webgpu_demos } from './webgpu_demos.js'
import { generateRoute } from '../utils'

//playground is a route
const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'Home',
      meta:{
      },
      component: Home,
    },
    generateRoute('template', 'Playground', ''),
    generateRoute('CartesianCoords', 'Playground', ''),
    ...basic(),
    ...demos(),
    ...html_demos(),
    ...controls_demos(),
    ...textures_demos(),
    ...shaders_demos(),
    ...fragment_demos(),
    // ...webgpu_demos
    // }
    // { path: '/:pathMatch(.*)*', name: 'NotFound', component: NotFound },
    //     meta: {
    //   layout: 'errorLayout'
    // },
  ]
})

export default router
