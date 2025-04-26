import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      redirect: '/subscribe',
    },
    {
      path: '/subscribe',
      name: 'subscribe',
      component: () => import('../views/subscribe.vue'),
    },
    {
      path: '/form',
      name: 'form',
      component: () => import('../views/form.vue'),
    },
    {
      path: '/task',
      name: 'task',
      component: () => import('../views/task.vue'),
    },
    {
      path: '/log',
      name: 'log',
      component: () => import('../views/log.vue'),
    },
    {
      path: '/config',
      name: 'config',
      component: () => import('../views/config.vue'),
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/AboutView.vue'),
    },
  ],
})

export default router
