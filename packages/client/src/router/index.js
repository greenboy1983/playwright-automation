import { createRouter, createWebHistory } from 'vue-router'
import CreateClient from '../views/CreateClient.vue'
import Kyc from '../views/Kyc.vue'
import Reports from '../views/Reports.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/createclient'
    },
    {
      path: '/createclient',
      name: 'createclient',
      component: CreateClient
    },
    {
      path: '/kyc',
      name: 'kyc',
      component: Kyc
    },
    {
      path: '/reports',
      name: 'reports',
      component: Reports
    }
  ]
})

export default router 