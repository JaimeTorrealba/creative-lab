import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/HomeView.vue'


const router = createRouter({
    history: createWebHistory(),
    routes: [
        { path: '/', name: 'Home', component: Home },
        {
            path: "/MouseShaderEffect",
            name: "MouseShaderEffect",
            component: () => import("../views/MouseShaderEffect.vue"),
          },
        // { path: '/:pathMatch(.*)*', name: 'NotFound', component: NotFound },
    ],
})
export default router
