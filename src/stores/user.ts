import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import type { User } from '../types/user'
import { fetchChatHistory } from '@/api/chatApi' 


export interface ChatMessage {
  id: number
  from: string
  message: string
  timestamp: Date
}

export const useUserStore = defineStore('user', () => {
  const router = useRouter()
  
  const user = ref<User | null>(null)
  const pendingApprovals = ref(0)
  const chatHistory = ref<ChatMessage[]>([]) 

  const isAuthenticated = computed(() => !!user.value)

  const setUser = (userData: User) => {
    user.value = userData
    
    localStorage.setItem('user', JSON.stringify(userData))
    localStorage.setItem('token', userData.token)
  }

  const clearUser = () => {
    user.value = null
    pendingApprovals.value = 0
    chatHistory.value = [] 
    localStorage.removeItem('user')
    localStorage.removeItem('token')
  }

  
  const initUser = async () => {
    const savedUser = localStorage.getItem('user')
    const savedToken = localStorage.getItem('token')

    if (savedUser && savedToken) {
      const userData = JSON.parse(savedUser)
      user.value = userData
      
      
      await loadChatHistory();
    }
  }
  
  
  const loadChatHistory = async () => {
    if (!isAuthenticated.value) return;
    try {
      console.log("Carregando histórico de chat do backend...");
      const history = await fetchChatHistory();
      chatHistory.value = history;
      console.log("Histórico carregado:", history.length, "mensagens.");
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
    console.log("Histórico de chat local limpo.");
    
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