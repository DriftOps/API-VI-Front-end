export interface User {
  id: number | null;
  name: string;
  email: string;
  password?: string; // Opcional, pois não deve ser armazenado no frontend após login
  goal: string;
  height: number | null;
  weight: number | null;
  age: number | null;
  restrictions: string[];
  activityLevel: string;
  dietaryPreferences: string[];
  chatHistory: { message: string; from: 'user' | 'agent'; date: string }[];
  plan: { meals: { name: string; calories: number }[] } | null;
  token?: string; // Adicione o token para autenticação
}

export interface AuthResponse {
  user: User;
  token: string;
}