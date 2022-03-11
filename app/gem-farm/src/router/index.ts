import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import Farmer from '@/views/Farmer.vue';
import Manager from '@/views/Manager.vue';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/manager',
    name: 'Farm Manager',
    component: Manager,
  },
  {
    path: '/',
    name: 'Home',
    component: Farmer,
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
