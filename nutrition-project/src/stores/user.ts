import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import type { User } from '../types/user'

// Interface para mensagens do chat
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
    // Se o usuário tem histórico de chat, carrega
    if (userData.chatHistory) {
      chatHistory.value = userData.chatHistory
    }
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

  const initUser = () => {
    const savedUser = localStorage.getItem('user')
    const savedToken = localStorage.getItem('token')

    if (savedUser && savedToken) {
      const userData = JSON.parse(savedUser)
      user.value = userData
      if (userData.chatHistory) {
        chatHistory.value = userData.chatHistory
      }
    }
  }

  const logout = () => {
    clearUser()
    router.push('/')
  }

  const setPendingApprovals = (count: number) => {
    pendingApprovals.value = count
  }

  // Funções para o chat
  const addChatMessage = (message: ChatMessage) => {
    chatHistory.value.push(message)
    
    // Atualiza o localStorage
    if (user.value) {
      user.value.chatHistory = chatHistory.value
      localStorage.setItem('user', JSON.stringify(user.value))
    }
  }

  const clearChatHistory = () => {
    chatHistory.value = []
    
    // Atualiza o localStorage
    if (user.value) {
      user.value.chatHistory = []
      localStorage.setItem('user', JSON.stringify(user.value))
    }
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
    clearChatHistory
  }
})