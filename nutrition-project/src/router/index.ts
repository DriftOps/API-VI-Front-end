import { createRouter, createWebHistory } from 'vue-router';
import Login from '../pages/Login.vue';
import Dashboard from '../pages/Dashboard.vue';
import Chat from '../pages/Chat.vue';
<<<<<<< HEAD
import Profile from '../pages/Profile.vue'

=======
>>>>>>> df8b2dd77dd6b12d2113462bdcaf232dc334dcdf

const routes = [
  { path: '/', component: Login },
  { path: '/dashboard', component: Dashboard },
  { path: '/chat', component: Chat },
<<<<<<< HEAD
  { path: '/perfil', component: Profile },
=======
>>>>>>> df8b2dd77dd6b12d2113462bdcaf232dc334dcdf
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;