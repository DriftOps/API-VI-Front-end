import type { ChatMessage } from '@/stores/user'

// Representa os dados da tabela `user_anamnesis` (sem alterações aqui)
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

// Interface principal do usuário, usada para tipar o userStore
export interface User {
  id?: number
  userId?: number
  name: string
  email: string
  role: string
  token: string
  goal?: string
  activityLevel?: string // Campo vindo da anamnese
  weight?: number
  height?: number
  birthDate?: string
  dietaryPreferences: string[]
  restrictions: string[]
  plan?: string
  chatHistory?: ChatMessage[]
  approved: boolean
  createdAt?: string
}

// DTO de atualização que o formulário usa para enviar dados
// src/types/user.ts (ou similar)
export interface UserUpdateDTO {
  weight?: number;
  height?: number;
  birthDate?: string;
  dietaryPreferences?: string[];
  restrictions?: string[];

  goal?: string;
  activityLevel?: string;
  medicalConditions?: string;
  allergies?: string;
  surgeries?: string;
  frequency?: string;
  activityMinutesPerDay?: number;
  sleepQuality?: string;
  wakesDuringNight?: string;
  bowelFrequency?: string;
  alcoholUse?: string;
  smoking?: boolean;
  hydrationLevel?: string;
  continuousMedication?: boolean;
}