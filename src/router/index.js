import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/HomeView.vue'
import NotFound from '../views/NotFoundView.vue'
import { a_c } from './a-c.js'
import { d_g } from './d-g.js'
import { h_n } from './h-n.js'
import { o_s } from './o-s.js'
import { t_z } from './t-z.js'
import { generateRoute } from '../utils'

//playground is a route
const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'Home',
      meta: {},
      component: Home
    },
    generateRoute('template', ''),
    generateRoute('CartesianCoords', ''),
    ...a_c(),
    ...d_g(),
    ...h_n(),
    ...o_s(),
    ...t_z(),
    { path: '/:pathMatch(.*)*', name: 'NotFound', component: NotFound }
  ]
})

export default router
