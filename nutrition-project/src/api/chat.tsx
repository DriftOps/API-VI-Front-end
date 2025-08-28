import React, { useRef, useState, useEffect } from 'react';
import { sendMessageToAI } from '../api/openaiChat';

interface ChatMessage {
  message: string;
  from: 'user' | 'agent';
}

interface User {
  chatHistory: ChatMessage[];
  addChatMessage: (msg: string, from: 'user' | 'agent') => void;
}

// Replace this with your actual user store hook
const useUserStore = (): { user: User } => {
  // Dummy implementation for demonstration
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const addChatMessage = (msg: string, from: 'user' | 'agent') => {
    setChatHistory((prev) => [...prev, { message: msg, from }]);
  };
  return { user: { chatHistory, addChatMessage } };
};

const Chat: React.FC = () => {
  const userStore = useUserStore();
  const user = userStore.user;
  const [newMessage, setNewMessage] = useState('');
  const messagesContainer = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (messagesContainer.current) {
      messagesContainer.current.scrollTop = messagesContainer.current.scrollHeight;
    }
  }, [user.chatHistory.length]);

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    user.addChatMessage(newMessage, 'user');
    const reply: string = await sendMessageToAI(newMessage);
    user.addChatMessage(reply, 'agent');
    setNewMessage('');
  };

  return (
    <div className="chat-container">
      <h1>Chat de Nutrição</h1>
      <div className="chat-messages" ref={messagesContainer}>
        {user.chatHistory.map((msg, i) => (
          <div key={i} className={`message ${msg.from}`}>
            <strong>{msg.from === 'user' ? 'Você' : 'Agente'}:</strong> {msg.message}
          </div>
        ))}
      </div>
      <div className="chat-input">
        <input
          value={newMessage}
          onChange={e => setNewMessage(e.target.value)}
          onKeyUp={e => { if (e.key === 'Enter') sendMessage(); }}
          placeholder="Digite sua mensagem..."
        />
        <button onClick={sendMessage}>Enviar</button>
      </div>
    </div>
  );
};

export default Chat;

<style scoped>
.chat-container {
  max-width: 600px;
  margin: 20px auto;
  display: flex;
  flex-direction: column;
}

h1 {
  text-align: center;
  margin-bottom: 20px;
  color: #2c3e50;
}

.chat-messages {
  height: 400px;
  overflow-y: auto;
  border: 1px solid #ccc;
  padding: 10px;
  margin-bottom: 10px;
  background-color: #f8f9fa;
  border-radius: 12px;
}

.message {
  margin-bottom: 10px;
  padding: 6px 10px;
  border-radius: 12px;
  max-width: 80%;
  word-wrap: break-word;
}

.message.user {
  background-color: #cce5ff;
  align-self: flex-end;
  text-align: right;
}

.message.agent {
  background-color: #d4edda;
  align-self: flex-start;
  text-align: left;
}

.chat-input {
  display: flex;
  gap: 10px;
}

.chat-input input {
  flex: 1;
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid #ccc;
  font-size: 16px;
}

.chat-input button {
  padding: 8px 16px;
  border-radius: 8px;
  border: none;
  background-color: #2c3e50;
  color: #fff;
  font-weight: bold;
  cursor: pointer;
}
</style>
