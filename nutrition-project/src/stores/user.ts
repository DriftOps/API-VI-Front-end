import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { User } from '../types/user'

export const useUserStore = defineStore('user', () => {
  const user = ref<User | null>(null)
  const isAuthenticated = ref(false)

  const setUser = (userData: User) => {
    user.value = userData
    isAuthenticated.value = true
    // Salva no localStorage
    localStorage.setItem('user', JSON.stringify(userData))
    localStorage.setItem('token', userData.token)
  }

  const clearUser = () => {
    user.value = null
    isAuthenticated.value = false
    localStorage.removeItem('user')
    localStorage.removeItem('token')
  }

  // Verifica se há usuário salvo no localStorage ao inicializar
  const initUser = () => {
    const savedUser = localStorage.getItem('user')
    const savedToken = localStorage.getItem('token')
    
    if (savedUser && savedToken) {
      user.value = JSON.parse(savedUser)
      isAuthenticated.value = true
    }
  }

  return {
    user,
    isAuthenticated,
    setUser,
    clearUser,
    initUser
  }
})