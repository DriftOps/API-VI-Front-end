import { useUserStore } from "@/stores/user";
import { useMealStore } from "@/stores/meal"; 
import type { ChatMessage } from '@/stores/user'

const API_URL = 'http://localhost:8080/api/chat' 


interface ChatMessageDTO {
  id: number;
  sender: 'user' | 'assistant';
  message: string;
  image: dto.image,
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
    image: dto.image,
    timestamp: new Date(dto.timestamp),
    nutritionistComment: dto.nutritionistComment, 
    feedback: dto.userFeedback || null        
  }));
}

export async function postNewMessage(message: string, image?: string): Promise<ChatMessage> {
  const token = localStorage.getItem('token');
  
  // Monta o corpo da requisição
  const body: any = { message: message };
  if (image) {
    body.image = image; // Adiciona a imagem em Base64 se existir
  }

  const response = await fetch(`${API_URL}/send`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) throw new Error('Erro ao enviar mensagem');
  
  const dto: ChatMessageDTO = await response.json();

  return {
    id: dto.id,
    from: 'NutriX',
    message: dto.message,
    image: dto.image,
    timestamp: new Date(dto.timestamp),
    nutritionistComment: dto.nutritionistComment,
    feedback: dto.userFeedback || null
  };
}

/**
 * Envia o feedback (positivo ou negativo) para uma mensagem específica.
 * @param messageId O ID da mensagem que está recebendo o feedback.
 * @param feedback O tipo de feedback ('positive', 'negative') ou null para remover.
 */
export async function postFeedback(messageId: number, feedback: 'positive' | 'negative' | null): Promise<void> {
  const token = localStorage.getItem('token');
  
  const response = await fetch(`${API_URL}/feedback/${messageId}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },

    body: JSON.stringify({ feedback: feedback }) 
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Erro ao enviar feedback:', errorText);
    throw new Error(`Erro ao enviar feedback: ${errorText}`);
  }
  
  
}