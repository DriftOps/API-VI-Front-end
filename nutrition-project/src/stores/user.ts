import { defineStore } from 'pinia';
import type { User, AuthResponse } from '../types/user';

export const useUserStore = defineStore('user', {
  state: () => ({
    user: {
      id: null,
      name: '',
      email: '',
      goal: '',
      height: null,
      weight: null,
      age: null,
      restrictions: [] as string[],
      activityLevel: '',
      dietaryPreferences: [] as string[],
      chatHistory: [] as { message: string; from: 'user' | 'agent'; date: string }[],
      plan: null as { meals: { name: string; calories: number }[] } | null,
      token: '',
    } as User,
    isAuthenticated: false,
  }),
  actions: {
    // Para login - recebe dados completos do backend
    setAuthUser(authData: AuthResponse) {
      this.user = { ...authData.user, token: authData.token };
      this.isAuthenticated = true;
      
      // Salva no localStorage
      localStorage.setItem('token', authData.token);
      localStorage.setItem('user', JSON.stringify(authData.user));
    },
    
    // Para atualizar dados parciais (mantém a autenticação)
    setUser(data: Partial<User>) {
      this.user = { ...this.user, ...data };
      localStorage.setItem('user', JSON.stringify(this.user));
    },
    
    // Logout
    clearUser() {
      this.user = {
        id: null,
        name: '',
        email: '',
        goal: '',
        height: null,
        weight: null,
        age: null,
        restrictions: [],
        activityLevel: '',
        dietaryPreferences: [],
        chatHistory: [],
        plan: null,
        token: '',
      };
      this.isAuthenticated = false;
      
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
    
    // Recuperar usuário do localStorage ao iniciar app
    loadFromStorage() {
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');
      
      if (token && userStr) {
        try {
          const user = JSON.parse(userStr);
          this.user = { ...user, token };
          this.isAuthenticated = true;
        } catch (error) {
          this.clearUser();
        }
      }
    },
    
    addChatMessage(message: string, from: 'user' | 'agent') {
      this.user.chatHistory.push({ message, from, date: new Date().toISOString() });
    },
    
    setPlan(plan: { meals: { name: string; calories: number }[] }) {
      this.user.plan = plan;
    },
  },
});