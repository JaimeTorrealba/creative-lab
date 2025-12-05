import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/HomeView.vue'
import { basic } from './basic.js'
import { textures_demos } from './textures_effects.js'
import { fun } from './fun.js'
import { shaders } from './shaders'
import { html_demos } from './html_demos'
import { controls_demos } from './controls_demos'
import { complex } from './complex_demos.js'
import { noc_demos } from './nature_of_code.js'
import { random_demos } from './random.js'
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
    ...fun(),
    ...html_demos(),
    ...controls_demos(),
    ...textures_demos(),
    ...shaders(),
    ...complex(),
    ...noc_demos(),
    ...random_demos()
    // }
    // { path: '/:pathMatch(.*)*', name: 'NotFound', component: NotFound },
    //     meta: {
    //   layout: 'errorLayout'
    // },
  ]
})

export default router
