import { createRouter, createWebHistory } from 'vue-router';
import Login from '../pages/Login.vue';
import Dashboard from '../pages/Dashboard.vue';
import Chat from '../pages/Chat.vue';
import Profile from '../pages/Profile.vue'


const routes = [
  { path: '/', component: Login },
  { path: '/dashboard', component: Dashboard },
  { path: '/chat', component: Chat },
  { path: '/perfil', component: Profile },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;