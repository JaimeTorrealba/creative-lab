import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/HomeView.vue'
import NotFound from '../views/NotFoundView.vue'
import { basic } from './basic.js'
import { fragment_routes } from './fragment.js'
import { intermediate } from './intermediate.js'
import { shaders } from './shaders'
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
    ...intermediate(),
    ...controls_demos(),
    ...fragment_routes(),
    ...shaders(),
    ...complex(),
    ...noc_demos(),
    ...random_demos(),
    { path: '/:pathMatch(.*)*', name: 'NotFound', component: NotFound },
  ]
})

export default router
