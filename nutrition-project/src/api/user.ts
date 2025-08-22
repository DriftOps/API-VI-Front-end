import type { User } from '../types/user';

// simula um delay de chamada ao backend
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export const fetchUser = async (userId: number): Promise<User> => {
  await delay(500);
  // retorno fake, igual ao que o backend vai fornecer
  return {
    id: userId,
    name: 'Felipe Pereira',
    email: 'felipe@gmail.com',
    password: '',
    goal: 'Emagrecer',
    height: 184,
    weight: 84,
    age: 25,
    restrictions: ['glúten'],
    activityLevel: 'Ativo',
    dietaryPreferences: ['Low-carb', 'Vegetariano'],
    chatHistory: [],
    plan: { meals: [{ name: 'Café da manhã', calories: 350 }] },
  };
};

export const updateUser = async (user: User): Promise<User> => {
  await delay(300);
  // aqui só retorna o mesmo usuário como se tivesse salvo no backend
  return user;
};
