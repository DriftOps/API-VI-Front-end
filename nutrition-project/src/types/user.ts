export interface User {
  id: number | null;
  name: string;
  email: string;
  password: string;
  goal: string;
  height: number | null;
  weight: number | null;
  age: number | null;
  restrictions: string[];
  activityLevel: string;
  dietaryPreferences: string[];
  chatHistory: { message: string; from: 'user' | 'agent'; date: string }[];
  plan?: {
    meals?: {
      name: string;
      calories: number;
    }[];
    description?: string;
  };
}
