import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/HomeView.vue'


const router = createRouter({
    history: createWebHistory(),
    routes: [
        { path: '/', name: 'Home', component: Home },
        // {
        //     path: "/newTask",
        //     name: "NewTask",
        //     component: () => import("../views/NewTaskView.vue"),
        //     meta: { requiresAuth: true },
        //   },
        // { path: '/:pathMatch(.*)*', name: 'NotFound', component: NotFound },
    ],
})
export default router
