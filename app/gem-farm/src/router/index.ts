import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import Farmer from '@/views/Farmer.vue';
import Manager from '@/views/Manager.vue';
import Home from '@/views/Home.vue';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/dsfnoiwnaefklaneuno2342134nkndfas',
    name: 'Farm Manager',
    component: Manager,
  },
  {
    path: '/',
    name: 'Welcome',
    component: Home,
  },
  {
    path: '/vault',
    name: 'Staking Vault',
    component: Farmer,
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
