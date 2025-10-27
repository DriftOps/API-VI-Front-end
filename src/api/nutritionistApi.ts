const API_URL = 'http://localhost:8080/api/nutritionist'; 

export interface ClientDTO {
  id: number;
  name: string;
  email: string;
  role: string;
  approved: boolean;
}

export interface ChatMessageDTO {
  id: number;
  sender: 'user' | 'assistant';
  message: string;
  timestamp: string;
  nutritionistComment?: string;
  userId: number;
}

const getToken = () => localStorage.getItem('token');

export async function fetchClients(): Promise<ClientDTO[]> {
  const response = await fetch(`${API_URL}/clients`, {
    headers: { 'Authorization': `Bearer ${getToken()}` }
  });
  if (!response.ok) throw new Error('Erro ao buscar clientes');
  return response.json();
}

export async function fetchClientChat(userId: number): Promise<ChatMessageDTO[]> {
  const response = await fetch(`${API_URL}/chat/${userId}`, {
    headers: { 'Authorization': `Bearer ${getToken()}` }
  });
  if (!response.ok) throw new Error('Erro ao buscar chat do cliente');
  return response.json();
}

export async function postNutriComment(messageId: number, comment: string): Promise<ChatMessageDTO> {
  const response = await fetch(`${API_URL}/comment/${messageId}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${getToken()}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ comment: comment })
  });
  if (!response.ok) throw new Error('Erro ao salvar comentário');
  return response.json();
}