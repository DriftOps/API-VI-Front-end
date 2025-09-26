import { useUserStore } from '../stores/user'

const API_URL = 'http://localhost:8080/api'

export const api = {
  async get(url: string) {
    const userStore = useUserStore()
    const token = localStorage.getItem('token')
    
    const response = await fetch(`${API_URL}${url}`, {
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json',
      },
    })
    
    if (response.status === 401) {
      // Token expirado
      userStore.clearUser()
      window.location.href = '/login'
    }
    
    return response
  },
  
  async post(url: string, data: any) {
    const userStore = useUserStore()
    const token = localStorage.getItem('token')
    
    const response = await fetch(`${API_URL}${url}`, {
      method: 'POST',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    
    if (response.status === 401) {
      userStore.clearUser()
      window.location.href = '/login'
    }
    
    return response
  },
  
  async patch(url: string, data?: any) {
    const userStore = useUserStore()
    const token = localStorage.getItem('token')
    
    const response = await fetch(`${API_URL}${url}`, {
      method: 'PATCH',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json',
      },
      body: data ? JSON.stringify(data) : undefined,
    })
    
    if (response.status === 401) {
      userStore.clearUser()
      window.location.href = '/login'
    }
    
    return response
  }
}