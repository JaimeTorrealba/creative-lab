import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/HomeView.vue'
// import { useTres } from '@tresjs/core'


const router = createRouter({
    history: createWebHistory(),
    routes: [
        { path: '/', name: 'Home', component: Home },
        {
            path: "/MouseShaderEffect",
            name: "MouseShaderEffect",
            component: () => import("../views/MouseShaderEffect.vue"),
          },
        {
            path: "/DynamicTextEffect",
            name: "DynamicTextEffect",
            component: () => import("../views/DynamicTextEffect.vue"),
          },
        {
            path: "/multiCamera",
            name: "MultiCamera",
            component: () => import("../views/MultiCamera.vue"),
          },
        {
            path: "/glassmorphism",
            name: "GlassMorphism",
            component: () => import("../views/GlassMorphism.vue"),
          },
        {
            path: "/darkStar",
            name: "DarkStar",
            component: () => import("../views/DarkStarView.vue"),
          },
        // { path: '/:pathMatch(.*)*', name: 'NotFound', component: NotFound },
    ],
})

// router.beforeEach((to, from) => {
//   const { setState } = useTres()
//   setState('scene', null)
//   setState('renderer', null)
//   setState('camera', null)
//   setState('cameras', [])
//   console.log(useTres().state)
//   return true
// })
export default router
