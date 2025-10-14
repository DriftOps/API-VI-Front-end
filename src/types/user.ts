// src/types/User.ts

import type { ChatMessage } from '@/stores/user'

// Representa os dados da tabela `user_anamnesis`
export interface UserAnamnesis {
  id?: number
  userId: number
  mainGoal: string
  medicalConditions?: string
  allergies?: string
  surgeries?: string
  activityType?: string
  frequency?: string
  activityMinutesPerDay?: number
  sleepQuality?: string
  wakesDuringNight?: string
  bowelFrequency?: string
  stressLevel?: string
  alcoholUse?: string
  smoking?: boolean
  hydrationLevel?: string
  continuousMedication?: boolean
}

// Interface principal do usuário, mais enxuta
export interface User {
  id: number
  name: string
  email: string
  role: string
  token: string
  weight?: number
  height?: number
  birthDate?: string
  dietaryPreferences: string[] // Mantido para exemplo, pode ser movido se necessário
  restrictions: string[] // Mantido para exemplo, pode ser movido se necessário
  plan?: string
  chatHistory?: ChatMessage[]
  approved: boolean
  createdAt?: string
}

// DTO para atualização de perfil (pode ser ajustado conforme necessário)
export interface UserUpdateDTO {
  weight?: number
  height?: number
  birthDate?: string
  dietaryPreferences?: string[]
  restrictions?: string[]
  plan?: string
}