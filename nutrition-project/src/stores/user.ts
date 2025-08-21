import { defineStore } from 'pinia';
import type { User } from '../types/user';

export const useUserStore = defineStore('user', {
  state: () => ({
    user: {
      id: null,
      name: '',
      email: '',
      password: '',
      goal: '',
      height: null,
      weight: null,
      age: null,
      restrictions: [] as string[],
      activityLevel: '',
      dietaryPreferences: [] as string[],
      chatHistory: [] as { message: string; from: 'user' | 'agent'; date: string }[],
      plan: null as { meals: { name: string; calories: number }[] } | null,
    } as User,
  }),
  actions: {
    setUser(data: Partial<User>) { // Partial permite atualizar só alguns campos
      this.user = { ...this.user, ...data };
    },
    addChatMessage(message: string, from: 'user' | 'agent') {
      this.user.chatHistory.push({ message, from, date: new Date().toISOString() });
    },
    setPlan(plan: { meals: { name: string; calories: number }[] }) {
      this.user.plan = plan;
    },
  },
});