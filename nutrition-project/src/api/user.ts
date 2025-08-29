import type { User } from '../types/user';

let mockUser: User = {
  id: 1,
  name: "Felipe Pereira",
  email: "felipe@example.com",
  password: "123456",
  chatHistory: [],  
  age: 25,
  weight: 84,
  height: 184,
  goal: "Ganhar massa",
  activityLevel: "Ativo",
  dietaryPreferences: ["Proteína", "Arroz integral"],
  restrictions: ["Lactose"],

  plan: {
    meals: [
      { name: "Café da manhã", calories: 350 },
      { name: "Almoço", calories: 600 },
      { name: "Jantar", calories: 500 }
    ],
    description: "Plano alimentar focado em ganho de massa magra."
  }
};

export const fetchUser = async (id: number): Promise<User> => {
  console.log("Simulando fetch do usuário", id);
  return Promise.resolve(mockUser);
};

export const updateUser = async (user: User): Promise<User> => {
  console.log("Simulando update do usuário", user);
  mockUser = { ...user };
  return Promise.resolve(mockUser);
};
