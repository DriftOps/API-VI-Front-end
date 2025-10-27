import { useUserStore } from "@/stores/user";
import { useMealStore } from "@/stores/meal"; 
import type { ChatMessage } from '@/stores/user'

const API_URL = 'http://localhost:8080/api/chat' 


interface ChatMessageDTO {
  id: number;
  sender: 'user' | 'assistant';
  message: string;
  timestamp: string;
  nutritionistComment?: string;
  userId: number;
}

export async function fetchChatHistory(): Promise<ChatMessage[]> {
  const token = localStorage.getItem('token');
  const userStore = useUserStore();
  const userName = userStore.user?.name || 'Você';

  const response = await fetch(`${API_URL}/history`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!response.ok) throw new Error('Erro ao buscar histórico');
  
  const dtos: ChatMessageDTO[] = await response.json();

  return dtos.map(dto => ({
    id: dto.id,
    from: dto.sender === 'user' ? userName : 'Nutricionista',
    message: dto.message,
    timestamp: new Date(dto.timestamp) 
  }));
}

export async function postNewMessage(message: string): Promise<ChatMessage> {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/send`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ message: message })
  });

  if (!response.ok) throw new Error('Erro ao enviar mensagem');
  
  const dto: ChatMessageDTO = await response.json();

  return {
    id: dto.id,
    from: 'Nutricionista',
    message: dto.message,
    timestamp: new Date(dto.timestamp)
  };
}