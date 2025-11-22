// src/stores/user.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import type { User } from '../types/user'
import { fetchChatHistory } from '@/api/chatApi' 

export interface ChatMessage {
  id: number
  from: string
  message: string
  image?: string
  timestamp: Date
}

export const useUserStore = defineStore('user', () => {
  const router = useRouter()
  
  const user = ref<User | null>(null)
  const pendingApprovals = ref(0)
  const chatHistory = ref<ChatMessage[]>([]) 

  const isAuthenticated = computed(() => !!user.value)

  const saveUserIdToStorage = (userData: User) => {
    // Tenta pegar ID ou userId
    const id = userData.userId || userData.id;
    
    console.log("Tentando salvar ID do usuário:", id, "Dados completos:", userData); // DEBUG

    if (id) {
      localStorage.setItem('userId', String(id));
    } else {
      console.error("ERRO CRÍTICO: Objeto User não tem 'id' nem 'userId'!");
    }
  }

  const setUser = (userData: User) => {
    user.value = userData
    
    localStorage.setItem('user', JSON.stringify(userData))
    localStorage.setItem('token', userData.token)
    
    saveUserIdToStorage(userData);
  }

  const clearUser = () => {
    user.value = null
    pendingApprovals.value = 0
    chatHistory.value = [] 
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    localStorage.removeItem('userId') // Importante limpar
  }
  
  const initUser = async () => {
    const savedUser = localStorage.getItem('user')
    const savedToken = localStorage.getItem('token')

    if (savedUser && savedToken) {
      try {
        const userData = JSON.parse(savedUser)
        user.value = userData
        
        // Garante que o ID seja restaurado ao dar F5
        saveUserIdToStorage(userData);

        await loadChatHistory();
      } catch (e) {
        console.error("Erro ao restaurar usuário:", e);
        clearUser(); 
      }
    }
  }
  
  const loadChatHistory = async () => {
    if (!isAuthenticated.value) return;
    try {
      const history = await fetchChatHistory();
      chatHistory.value = history;
    } catch (error) {
      console.error("Erro ao carregar histórico de chat:", error);
      chatHistory.value = []; 
    }
  }

  const logout = () => {
    clearUser()
    router.push('/')
  }

  const setPendingApprovals = (count: number) => {
    pendingApprovals.value = count
  }
  
  const addChatMessage = (message: ChatMessage) => {
    chatHistory.value.push(message)
  }

  const clearChatHistory = async () => {
    chatHistory.value = [] 
  }

  return {
    user,
    pendingApprovals,
    chatHistory,
    isAuthenticated,
    setUser,
    clearUser,
    initUser, 
    logout,
    setPendingApprovals,
    addChatMessage,
    clearChatHistory,
    loadChatHistory 
  }
})