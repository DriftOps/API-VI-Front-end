import { createRouter, createWebHistory } from 'vue-router';
import Login from '../pages/Login.vue';
import Dashboard from '../pages/Dashboard.vue';
import Chat from '../pages/Chat.vue';
import Profile from '../pages/Profile.vue';
import Signup from '../pages/Signup.vue';
import AdminUsers from '../pages/admin/AdminUsers.vue';

const routes = [
  { path: '/', component: Login },
  { path: '/login', component: Login },
  { path: '/signup', component: Signup },
  { 
    path: '/dashboard', 
    component: () => import('../pages/Dashboard.vue'),
    children: [
      { path: 'admin/users', component: () => import('../pages/admin/AdminUsers.vue') }
    ]
  },
  { 
    path: '/chat', 
    component: Chat,
    meta: { requiresAuth: true }
  },
  { 
    path: '/perfil', 
    component: Profile,
    meta: { requiresAuth: true }
  },
  { 
    path: '/admin/users', 
    component: AdminUsers,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;