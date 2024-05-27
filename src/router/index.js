import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/HomeView.vue'
import { basic } from './basic.js'
import { demos } from './demos.js'
import { shaders_demos } from './shaders_demos'
import { html_demos } from './html_demos'
import { fragment_demos } from './fragment_demos'
import { controls_demos } from './controls_demos'
import { generateRoute } from '../utils'

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
    generateRoute('Template', 'Playground', ''),
    generateRoute('CartesianCoords', 'Playground', ''),
    ...basic,
    ...demos,
    ...html_demos,
    ...controls_demos,
    ...shaders_demos,
    ...fragment_demos,
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
