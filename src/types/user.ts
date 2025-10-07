import type { ChatMessage } from '@/stores/user'

export interface User {
  id: number
  name: string
  email: string
  role: string
  token: string
  goal?: string
  weight?: number
  height?: number
  birthDate?: string
  age?: number
  activityLevel?: string
  dietaryPreferences: string[]
  restrictions: string[]
  plan?: string
  chatHistory?: ChatMessage[]
  approved: boolean
  createdAt?: string
}

export interface UserUpdateDTO {
  goal?: string
  weight?: number
  height?: number
  birthDate?: string
  activityLevel?: string
  dietaryPreferences?: string[]
  restrictions?: string[]
  plan?: string
}
