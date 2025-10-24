<template>
  <DashboardLayout>
    <div class="chat-container">
      <!-- Header -->
      <div class="chat-header">
        <div class="chat-info">
          <div class="nutritionist-avatar">
            <UserIcon :size="24" />
          </div>
          <div class="chat-details">
            <h2>Chat com Nutricionista</h2>
            <div class="status">
              <div class="status-indicator" :class="{ online: isNutritionistOnline }"></div>
              <span>{{ isNutritionistOnline ? 'Online' : 'Offline' }}</span>
              <span class="response-time">• Resposta em até 24h</span>
            </div>
          </div>
        </div>
        <div class="chat-actions">
          <button @click="clearChat" class="action-btn" title="Limpar conversa">
            <Trash2Icon :size="18" />
          </button>
          <button @click="toggleSound" class="action-btn" :title="soundEnabled ? 'Desativar som' : 'Ativar som'">
            <BellIcon v-if="soundEnabled" :size="18" />
            <BellOffIcon v-else :size="18" />
          </button>
        </div>
      </div>

      <!-- Mensagens -->
      <div class="chat-messages" ref="messagesContainer">
        <!-- Boas-vindas -->
        <div v-if="chatHistory.length === 0" class="welcome-message">
          <div class="welcome-avatar">
            <UserCheckIcon :size="32" />
          </div>
          <div class="welcome-content">
            <h3>Olá! Sou sua nutricionista</h3>
            <p>Estou aqui para ajudar você com orientações personalizadas sobre alimentação, suplementação e hábitos saudáveis. Como posso ajudar você hoje?</p>
            <div class="quick-questions">
              <button @click="sendQuickQuestion('Gostaria de uma orientação para perda de peso')" class="quick-btn">Perda de peso</button>
              <button @click="sendQuickQuestion('Preciso de ajuda com ganho de massa muscular')" class="quick-btn">Ganho de massa</button>
              <button @click="sendQuickQuestion('Tenho dúvidas sobre suplementação')" class="quick-btn">Suplementação</button>
              <button @click="sendQuickQuestion('Preciso de um plano alimentar')" class="quick-btn">Plano alimentar</button>
            </div>
          </div>
        </div>

        <!-- Histórico -->
        <div 
          v-for="message in chatHistory" 
          :key="message.id"
          :class="['message', message.from === user?.name ? 'own-message' : 'other-message']"
        >
          <div class="message-avatar">
            {{ message.from === user?.name ? user.name.charAt(0) : 'N' }}
          </div>
          <div class="message-content-wrapper">
            <div class="message-header">
              <span class="message-sender">{{ message.from }}</span>
              <span class="message-time">{{ formatTime(message.timestamp) }}</span>
            </div>
            <!-- Aqui entra o markdown -->
            <div class="message-content" v-html="renderMarkdown(message.message)"></div>

            <div v-if="message.from !== user?.name" class="message-actions">
              <button @click="copyMessage(message.message)" class="msg-action" title="Copiar mensagem">
                <CopyIcon :size="14" />
              </button>
            </div>
          </div>
        </div>

        <!-- Digitando -->
        <div v-if="isTyping" class="message other-message typing-indicator">
          <div class="message-avatar">N</div>
          <div class="message-content-wrapper">
            <div class="typing-dots">
              <span></span><span></span><span></span>
            </div>
          </div>
        </div>
      </div>

      <!-- Input -->
      <div class="chat-input-area">
        <div class="input-actions">
          <button @click="toggleEmojiPicker" class="action-btn" title="Emojis">
            <SmileIcon :size="20" />
          </button>
          <button @click="attachFile" class="action-btn" title="Anexar arquivo">
            <PaperclipIcon :size="20" />
          </button>
        </div>
        
        <div class="message-input-wrapper">
          <input 
            v-model="newMessage" 
            @keyup.enter="sendMessage"
            placeholder="Digite sua mensagem..."
            :disabled="loading"
            ref="messageInput"
            class="message-input"
          />
          
          <!-- Emoji Picker -->
          <div v-if="showEmojiPicker" class="emoji-picker">
            <div class="emoji-grid">
              <button v-for="emoji in quickEmojis" :key="emoji" @click="addEmoji(emoji)" class="emoji-btn">
                {{ emoji }}
              </button>
            </div>
          </div>
        </div>

        <button @click="sendMessage" :disabled="loading || !newMessage.trim()" class="send-btn" :class="{ 'has-message': newMessage.trim() }">
          <SendIcon v-if="!loading" :size="20" />
          <LoaderIcon v-else :size="20" class="loading-spinner" />
        </button>
      </div>
    </div>
  </DashboardLayout>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, nextTick, watch } from 'vue'
import { useUserStore } from '@/stores/user'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import { sendMessageToAI } from "@/api/chatApi"
import MarkdownIt from "markdown-it"
import { useMealStore } from '@/stores/meal'

// Ícones
import {
  User as UserIcon,
  UserCheck as UserCheckIcon,
  Send as SendIcon,
  Loader as LoaderIcon,
  Trash2 as Trash2Icon,
  Bell as BellIcon,
  BellOff as BellOffIcon,
  Smile as SmileIcon,
  Paperclip as PaperclipIcon,
  Copy as CopyIcon
} from 'lucide-vue-next'

interface ChatMessage {
  id: number
  from: string
  message: string
  timestamp: Date
  type?: 'text' | 'system'
}

export default defineComponent({
  name: 'Chat',
  components: {
    DashboardLayout,
    UserIcon,
    UserCheckIcon,
    SendIcon,
    LoaderIcon,
    Trash2Icon,
    BellIcon,
    BellOffIcon,
    SmileIcon,
    PaperclipIcon,
    CopyIcon
  },
  setup() {
    const userStore = useUserStore()
    const mealStore = useMealStore()
    const messagesContainer = ref<HTMLDivElement>()
    const messageInput = ref<HTMLInputElement>()
    const newMessage = ref('')
    const loading = ref(false)
    const isTyping = ref(false)
    const soundEnabled = ref(true)
    const showEmojiPicker = ref(false)
    const isNutritionistOnline = ref(false)

    const user = computed(() => userStore.user)
    const chatHistory = computed(() => userStore.chatHistory)
    

    // Markdown parser
    const md = new MarkdownIt({
      breaks: true,        // quebra de linha
      linkify: true        // transformar links em <a>
    })

    const renderMarkdown = (text: string) => {
      return md.render(text)
    }

    // Emojis rápidos
    const quickEmojis = ['😊', '👍', '❤️', '🔥', '💪', '🥗', '🍎', '💧', '🏃‍♂️', '🎯']

    const sendMessage = async () => {
      if (!newMessage.value.trim() || !user.value) return
      loading.value = true

      try {
        const userMessage: ChatMessage = {
          id: Date.now(),
          from: user.value.name,
          message: newMessage.value,
          timestamp: new Date()
        }
        userStore.addChatMessage(userMessage)
        newMessage.value = ''
        showEmojiPicker.value = false
        isTyping.value = true

        const resposta = await sendMessageToAI(userMessage.message)

        isTyping.value = false

        const botMessage: ChatMessage = {
          id: Date.now() + 1,
          from: 'Nutricionista',
          message: resposta,
          timestamp: new Date()
        }
        userStore.addChatMessage(botMessage)

        if (soundEnabled.value) playNotificationSound()
      } catch (error) {
        console.error('Erro ao enviar mensagem:', error)
        const errorMessage: ChatMessage = {
          id: Date.now() + 2,
          from: 'Nutricionista',
          message: "⚠️ Ocorreu um erro ao conectar com o servidor.",
          timestamp: new Date()
        }
        userStore.addChatMessage(errorMessage)
      } finally {
        loading.value = false
      }
    }

    const sendQuickQuestion = (question: string) => {
      newMessage.value = question
      sendMessage()
    }

    const formatTime = (timestamp: Date) => {
      return new Date(timestamp).toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    const clearChat = () => {
      if (confirm('Tem certeza que deseja limpar todo o histórico do chat?')) {
        userStore.clearChatHistory()
      }
    }

    const toggleSound = () => soundEnabled.value = !soundEnabled.value
    const toggleEmojiPicker = () => showEmojiPicker.value = !showEmojiPicker.value
    const addEmoji = (emoji: string) => { newMessage.value += emoji; messageInput.value?.focus() }
    const attachFile = () => alert('Funcionalidade de anexar arquivo será implementada em breve!')
    const copyMessage = (text: string) => navigator.clipboard.writeText(text)

    const playNotificationSound = () => {
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+Dyvm0iBjiN1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+Dyvm0iBjiN1/LMeSw=')
      audio.volume = 0.3
      audio.play().catch(() => {})
    }

    const scrollToBottom = () => {
      if (messagesContainer.value) {
        messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
      }
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (showEmojiPicker.value && !(event.target as Element).closest('.emoji-picker')) {
        showEmojiPicker.value = false
      }
    }

    onMounted(() => {
      scrollToBottom()
      document.addEventListener('click', handleClickOutside)
      isNutritionistOnline.value = Math.random() > 0.3
    })

    watch(chatHistory, () => nextTick(() => scrollToBottom()))

    return {
      user, chatHistory, newMessage, loading, isTyping, soundEnabled,
      showEmojiPicker, isNutritionistOnline, messagesContainer, messageInput,
      quickEmojis, sendMessage, sendQuickQuestion, formatTime, clearChat,
      toggleSound, toggleEmojiPicker, addEmoji, attachFile, copyMessage,
      renderMarkdown
    }
  }
})
</script>

<style scoped>
.chat-container {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 10px);
  width: 69vw;
  /* max-width: 100%; */
  margin: 0;
  background: var(--card-bg);
  border-radius: 0;
  box-shadow: none;
  overflow: hidden;
}

.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  background: var(--sidebar-bg);
  color: white;
  border-bottom: 1px solid var(--card-border);
  width: 100%; 
  border-radius: 10px;
}

.chat-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.nutritionist-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--primary-color);
  display: flex;
  align-items: center;
  justify-content: center;
}

.chat-details h2 {
  margin: 0 0 4px 0;
  font-size: 18px;
  font-weight: 600;
}

.status {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  opacity: 0.8;
}

.status-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #ef4444;
}

.status-indicator.online {
  background: #10b981;
}

.response-time {
  font-size: 11px;
}

.chat-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: white;
  padding: 8px;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s;
}

.action-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background: var(--color-background);
  width: 100%;
  box-sizing: border-box;
}

.message {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  max-width: 90%;
  width: fit-content;
}

.own-message {
  margin-left: auto;
  flex-direction: row-reverse;
}

.message-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--primary-color);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 14px;
  flex-shrink: 0;
}

.other-message .message-avatar {
  background: #6b7280;
}

.message-content-wrapper {
  flex: 1;
  min-width: 0;
  max-width: none;
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.message-sender {
  font-weight: 600;
  font-size: 14px;
  color: var(--color-heading);
}

.message-time {
  font-size: 11px;
  color: var(--color-text-secondary);
}

.message-content {
  background: var(--card-bg);
  padding: 12px 16px;
  border-radius: 12px;
  line-height: 1.4;
  word-wrap: break-word;
  white-space: normal;
  word-break: break-word;
}

.own-message .message-content {
  background: var(--primary-color);
  color: white;
  border-bottom-right-radius: 4px;
}

.other-message .message-content {
  border-bottom-left-radius: 4px;
  border: 1px solid var(--card-border);
}

.message-actions {
  margin-top: 4px;
  display: flex;
  gap: 4px;
}

.msg-action {
  background: none;
  border: none;
  color: var(--color-text-secondary);
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  font-size: 12px;
}

.msg-action:hover {
  background: var(--card-border);
  color: var(--color-text);
}

.welcome-message {
  display: flex;
  gap: 16px;
  padding: 24px;
  background: var(--card-bg);
  border-radius: 12px;
  margin-bottom: 20px;
  border: 1px solid var(--card-border);
  width: 100%;
  box-sizing: border-box;
}

.welcome-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: var(--primary-color);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.welcome-content {
  flex: 1;
  min-width: 0;
}

.welcome-content h3 {
  margin: 0 0 8px 0;
  color: var(--color-heading);
}

.welcome-content p {
  margin: 0 0 16px 0;
  color: var(--color-text);
  line-height: 1.5;
}

.quick-questions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.quick-btn {
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  color: var(--color-text);
  padding: 8px 12px;
  border-radius: 20px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.quick-btn:hover {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

.typing-indicator .message-content-wrapper {
  display: flex;
  align-items: center;
}

.typing-dots {
  display: flex;
  gap: 4px;
  padding: 12px 16px;
}

.typing-dots span {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--color-text-secondary);
  animation: typing 1.4s infinite ease-in-out;
}

.typing-dots span:nth-child(1) { animation-delay: -0.32s; }
.typing-dots span:nth-child(2) { animation-delay: -0.16s; }

@keyframes typing {
  0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
  40% { transform: scale(1); opacity: 1; }
}

.chat-input-area {
  display: flex;
  align-items: flex-end;
  gap: 12px;
  padding: 20px 24px;
  background: var(--card-bg);
  border-top: 1px solid var(--card-border);
  position: relative;
  width: 100%;
}

.input-actions {
  display: flex;
  gap: 4px;
}

.message-input-wrapper {
  flex: 1;
  position: relative;
  width: 100%;
}

.message-input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid var(--card-border);
  border-radius: 24px;
  background: var(--input-bg);
  color: var(--input-text);
  font-size: 14px;
  transition: all 0.2s;
}

.message-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px var(--input-focus-ring);
}

.emoji-picker {
  position: absolute;
  bottom: 100%;
  left: 0;
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: 12px;
  padding: 12px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  z-index: 10;
  margin-bottom: 8px;
}

.emoji-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 4px;
}

.emoji-btn {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: background 0.2s;
}

.emoji-btn:hover {
  background: var(--card-border);
}

.send-btn {
  background: var(--card-border);
  border: none;
  color: var(--color-text-secondary);
  padding: 12px;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.send-btn.has-message {
  background: var(--primary-color);
  color: white;
}

.send-btn:not(:disabled):hover {
  transform: scale(1.05);
}

.send-btn:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.loading-spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Scrollbar personalizada */
.chat-messages::-webkit-scrollbar {
  width: 6px;
}

.chat-messages::-webkit-scrollbar-track {
  background: var(--card-bg);
}

.chat-messages::-webkit-scrollbar-thumb {
  background: var(--card-border);
  border-radius: 3px;
}

.chat-messages::-webkit-scrollbar-thumb:hover {
  background: var(--color-text-secondary);
}

/* Responsividade */
@media (max-width: 768px) {
  .chat-container {
    height: calc(100vh - 60px);
  }
  
  .chat-header {
    padding: 16px 20px;
  }
  
  .message {
    max-width: 95%;
  }
  
  .quick-questions {
    flex-direction: column;
  }
  
  .chat-input-area {
    padding: 16px 20px;
  }
}

@media (max-width: 480px) {
  .chat-messages {
    padding: 16px;
  }
  
  .welcome-message {
    flex-direction: column;
    text-align: center;
  }
  
  .message {
    max-width: 98%;
  }
}
</style>