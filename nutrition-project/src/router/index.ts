import { createRouter, createWebHistory } from 'vue-router';
import Login from '../pages/Login.vue';
import Dashboard from '../pages/Dashboard.vue';
import Chat from '../pages/Chat.vue';
import Signup from "../pages/Signup.vue"

const routes = [
  { path: '/', component: Login },
  { path: "/signup", name: "Signup", component: Signup },
  { path: '/dashboard', component: Dashboard },
  { path: '/chat', component: Chat },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;