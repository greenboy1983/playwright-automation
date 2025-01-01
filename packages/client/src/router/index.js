import { createRouter, createWebHistory } from 'vue-router'
import HelloWorld from '../components/HelloWorld.vue'
import NewClient from '../views/NewClient.vue'
import Kyc from '../views/Kyc.vue'
import Reports from '../views/Reports.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HelloWorld
  },
  {
    path: '/new-client',
    name: 'newClient',
    component: NewClient
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

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router 