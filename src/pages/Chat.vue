<template>
  <DashboardLayout>
    <div class="chat-container">
      <div class="chat-header">
        <div class="chat-info">
          <div class="nutritionist-avatar">
            <UserIcon :size="24" />
          </div>
          <div class="chat-details">
            <h2>Chat com NutriX</h2>
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
        </div>
      </div>

      <div class="chat-messages" ref="messagesContainer">
        <div v-if="!isLoadingHistory && chatHistory.length === 0" class="welcome-message">
          <div class="welcome-avatar">
            <UserCheckIcon :size="32" />
          </div>
          <div class="welcome-content">
            <h3>Olá! Sou sua nutricionista virtual</h3>
            <p>Estou aqui para ajudar você com orientações personalizadas sobre alimentação, suplementação e hábitos
              saudáveis. Você também pode me enviar fotos das suas refeições para eu analisar!</p>
            <div class="quick-questions">
              <button @click="sendQuickQuestion('Gostaria de uma orientação para perda de peso')"
                class="quick-btn">Perda de peso</button>
              <button @click="sendQuickQuestion('Preciso de ajuda com ganho de massa muscular')" class="quick-btn">Ganho
                de massa</button>
              <button @click="sendQuickQuestion('Tenho dúvidas sobre suplementação')"
                class="quick-btn">Suplementação</button>
              <button @click="sendQuickQuestion('Preciso de um plano alimentar')" class="quick-btn">Plano
                alimentar</button>
            </div>
          </div>
        </div>

        <div v-if="isLoadingHistory" class="loading-history">
          Carregando histórico...
        </div>

        <div v-for="message in chatHistory" :key="message.id"
          :class="['message', message.from === user?.name ? 'own-message' : 'other-message']">
          <div class="message-avatar">
            {{ message.from === user?.name ? user.name.charAt(0).toUpperCase() : 'N' }}
          </div>
          <div class="message-content-wrapper">
            <div class="message-header">
              <span class="message-sender">{{ message.from }}</span>
              <span class="message-time">{{ formatTime(message.timestamp) }}</span>
            </div>

            <div class="message-content" v-if="message.message" v-html="renderMarkdown(message.message)"></div>

            <div v-if="(message as any).image" class="message-image">
              <img :src="(message as any).image" alt="Foto enviada" />
            </div>

            <div v-if="message.nutritionistComment" class="nutritionist-comment-bubble">
              <strong class="comment-sender-label">
                <UserCheckIcon :size="14" />
                Nota do Nutricionista:
              </strong>
              <p>{{ message.nutritionistComment }}</p>
            </div>

            <div v-if="message.from === 'NutriX'" class="feedback-buttons">
              <button class="feedback-btn" :class="{ active: message.feedback === 'positive' }"
                @click="giveFeedback(message.id, 'positive')" title="Resposta satisfatória">
                <ThumbsUpIcon :size="16" />
              </button>

              <button class="feedback-btn" :class="{ active: message.feedback === 'negative' }"
                @click="giveFeedback(message.id, 'negative')" title="Resposta não satisfatória">
                <ThumbsDownIcon :size="16" />
              </button>
            </div>
            <div v-if="message.from !== user?.name" class="message-actions">
              <button @click="copyMessage(message.message)" class="msg-action" title="Copiar mensagem">
                <CopyIcon :size="14" />
              </button>
            </div>
          </div>
        </div>

        <div v-if="isTyping" class="message other-message typing-indicator">
          <div class="message-avatar">N</div>
          <div class="message-content-wrapper">
            <div class="typing-dots">
              <span></span><span></span><span></span>
            </div>
          </div>
        </div>
      </div>

      <div class="chat-input-area">

        <div v-if="selectedImagePreview" class="image-preview-container">
          <div class="preview-wrapper">
            <img :src="selectedImagePreview" alt="Preview" class="preview-img" />
            <button @click="clearImage" class="remove-img-btn" title="Remover imagem">
              <XIcon :size="14" />
            </button>
          </div>
        </div>

        <div class="input-actions">
          <button @click="toggleEmojiPicker" class="action-btn" title="Emojis">
            <SmileIcon :size="20" />
          </button>

          <input type="file" ref="fileInput" accept="image/*" style="display: none" @change="handleFileUpload" />

          <button @click="triggerFileInput" class="action-btn" title="Anexar foto da refeição">
            <PaperclipIcon :size="20" />
          </button>
        </div>

        <div class="message-input-wrapper">
          <input v-model="newMessage" @keyup.enter="sendMessage" placeholder="Digite sua mensagem..."
            :disabled="loading" ref="messageInput" class="message-input" />

          <div v-if="showEmojiPicker" class="emoji-picker" ref="emojiPickerRef">
            <div class="emoji-grid">
              <button v-for="emoji in quickEmojis" :key="emoji" @click="addEmoji(emoji)" class="emoji-btn">
                {{ emoji }}
              </button>
            </div>
          </div>
        </div>

        <button @click="sendMessage" :disabled="loading || (!newMessage.trim() && !selectedImageBase64)"
          class="send-btn" :class="{ 'has-message': newMessage.trim() || selectedImageBase64 }">
          <SendIcon v-if="!loading" :size="20" />
          <LoaderIcon v-else :size="20" class="loading-spinner" />
        </button>
      </div>
    </div>
  </DashboardLayout>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, nextTick, watch } from 'vue';
import { useUserStore } from '@/stores/user';
import DashboardLayout from '@/layouts/DashboardLayout.vue';
import { postNewMessage, postFeedback } from "@/api/chatApi";
import MarkdownIt from "markdown-it";
// Ícones
import {
  User as UserIcon,
  UserCheck as UserCheckIcon,
  Send as SendIcon,
  Loader as LoaderIcon,
  Trash2 as Trash2Icon,
  Smile as SmileIcon,
  Paperclip as PaperclipIcon,
  Copy as CopyIcon,
  ThumbsUp as ThumbsUpIcon,
  ThumbsDown as ThumbsDownIcon,
  X as XIcon
} from 'lucide-vue-next'

import type { ChatMessage } from '@/stores/user';

export default defineComponent({
  name: 'Chat',
  components: {
    DashboardLayout,
    UserIcon,
    UserCheckIcon,
    SendIcon,
    LoaderIcon,
    Trash2Icon,
    SmileIcon,
    PaperclipIcon,
    CopyIcon,
    ThumbsUpIcon,
    ThumbsDownIcon,
    XIcon
  },
  setup() {
    const userStore = useUserStore();
    const messagesContainer = ref<HTMLDivElement>();
    const messageInput = ref<HTMLInputElement>();
    const emojiPickerRef = ref<HTMLDivElement>();

    const fileInput = ref<HTMLInputElement | null>(null);
    const selectedImageBase64 = ref<string | null>(null);
    const selectedImagePreview = ref<string | null>(null);

    const newMessage = ref('');
    const loading = ref(false);
    const isTyping = ref(false);
    const isLoadingHistory = ref(true);
    const soundEnabled = ref(true);
    const showEmojiPicker = ref(false);
    const isNutritionistOnline = ref(false);

    const user = computed(() => userStore.user);
    const chatHistory = computed(() => userStore.chatHistory);

    const md = new MarkdownIt({ breaks: true, linkify: true });
    const renderMarkdown = (text: string) => md.renderInline(text);

    const quickEmojis = ['😊', '👍', '❤️', '🔥', '💪', '🥗', '🍎', '💧', '🏃‍♂️', '🎯'];

    // --- FUNÇÕES DE IMAGEM ---

    const triggerFileInput = () => {
      fileInput.value?.click();
    };

    const handleFileUpload = (event: Event) => {
      const target = event.target as HTMLInputElement;
      if (target.files && target.files[0]) {
        const file = target.files[0];
        if (file.size > 5 * 1024 * 1024) {
          alert("A imagem é muito grande. Máximo 5MB.");
          return;
        }
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          selectedImagePreview.value = result;
          selectedImageBase64.value = result;
          messageInput.value?.focus();
        };
        reader.readAsDataURL(file);
      }
      if (fileInput.value) fileInput.value.value = '';
    };

    const clearImage = () => {
      selectedImageBase64.value = null;
      selectedImagePreview.value = null;
      if (fileInput.value) fileInput.value.value = '';
    };

    const userLocation = ref<{ lat: number, lng: number } | null>(null);

    const getLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            userLocation.value = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            };
          },
          (error) => { console.warn("Erro ao obter localização ou permissão negada."); }
        );
      }
    };
    // --- FUNÇÕES PRINCIPAIS ---

    const sendMessage = async () => {
      // Verifica se tem mensagem ou imagem
      if ((!newMessage.value.trim() && !selectedImageBase64.value) || !user.value) return;

      loading.value = true;
      const userMessageText = newMessage.value;
      const imageToSend = selectedImageBase64.value; // Salva a imagem antes de limpar

      // 1. Adiciona mensagem localmente (UI Otimista)
      const userMessage = {
        id: Date.now(),
        from: user.value.name,
        message: userMessageText,
        timestamp: new Date(),
        image: imageToSend
      };

      userStore.addChatMessage(userMessage as ChatMessage);

      // Limpa os campos
      newMessage.value = '';
      clearImage();
      showEmojiPicker.value = false;
      isTyping.value = true;

      await nextTick(() => scrollToBottom());

      try {
        // 2. Envia para o backend (AGORA COM LOCALIZAÇÃO)
        const botMessage = await postNewMessage(
          userMessageText,
          imageToSend || undefined,
          userLocation.value?.lat, // Latitude
          userLocation.value?.lng  // Longitude
        );

        isTyping.value = false;
        userStore.addChatMessage(botMessage);
        if (soundEnabled.value) playNotificationSound();

      } catch (error) {
        console.error('Erro ao enviar mensagem:', error);
        isTyping.value = false;
        const errorMessage: ChatMessage = {
          id: Date.now() + 2,
          from: 'Sistema',
          message: "⚠️ Ocorreu um erro ao processar sua mensagem. Tente novamente.",
          timestamp: new Date()
        };
        userStore.addChatMessage(errorMessage);
      } finally {
        loading.value = false;
        await nextTick(() => scrollToBottom());
      }
    };

    const sendQuickQuestion = (question: string) => {
      newMessage.value = question;
      sendMessage();
    };

    const clearChat = () => {
      if (confirm('Tem certeza que deseja limpar todo o histórico desta conversa?')) {
        userStore.clearChatHistory();
      }
    };

    const giveFeedback = async (messageId: number, type: 'positive' | 'negative') => {
      const msg = userStore.chatHistory.find(m => m.id === messageId);
      if (!msg) return;

      const newFeedback = msg.feedback === type ? null : type;
      const oldFeedback = msg.feedback;
      msg.feedback = newFeedback;

      try {
        await postFeedback(messageId, newFeedback);
      } catch (error) {
        console.error("Falha ao salvar feedback:", error);
        msg.feedback = oldFeedback;
      }
    };

    // --- FUNÇÕES AUXILIARES ---

    const formatTime = (timestamp: Date | string) => {
      const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
      if (isNaN(date.getTime())) return '';
      return date.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    const toggleSound = () => soundEnabled.value = !soundEnabled.value;
    const toggleEmojiPicker = () => showEmojiPicker.value = !showEmojiPicker.value;
    const addEmoji = (emoji: string) => { newMessage.value += emoji; messageInput.value?.focus(); };
    const copyMessage = (text: string) => navigator.clipboard.writeText(text);

    const playNotificationSound = () => {
      try {
        const audio = new Audio('/notification.wav');
        audio.volume = 0.3;
        audio.play().catch(e => console.warn("Erro som:", e));
      } catch (e) { }
    };

    const scrollToBottom = () => {
      if (messagesContainer.value) {
        messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (showEmojiPicker.value && emojiPickerRef.value && !emojiPickerRef.value.contains(event.target as Node) && !(event.target as Element).closest('.input-actions button:first-child')) {
        showEmojiPicker.value = false;
      }
    };

    onMounted(async () => {
      getLocation();
      isLoadingHistory.value = true;
      try {
        if (userStore.isAuthenticated && userStore.chatHistory.length === 0) {
          await userStore.loadChatHistory();
        }
      } catch (error) {
        console.error("Erro load history:", error);
      } finally {
        isLoadingHistory.value = false;
        await nextTick(() => scrollToBottom());
      }

      document.addEventListener('click', handleClickOutside);
      isNutritionistOnline.value = Math.random() > 0.3;
    });

    watch(chatHistory, async () => {
      await nextTick(() => scrollToBottom());
    }, { deep: true });

    return {
      user,
      chatHistory,
      newMessage,
      loading,
      isTyping,
      isLoadingHistory,
      showEmojiPicker,
      isNutritionistOnline,
      messagesContainer,
      messageInput,
      emojiPickerRef,
      quickEmojis,
      fileInput,
      selectedImagePreview,
      selectedImageBase64,
      triggerFileInput,
      handleFileUpload,
      clearImage,
      sendMessage,
      sendQuickQuestion,
      formatTime,
      clearChat,
      toggleEmojiPicker,
      addEmoji,
      copyMessage,
      renderMarkdown,
      giveFeedback
    };
  }
});
</script>

<style scoped>
/* ... (Styles inalterados omitidos para brevidade, adicionei apenas o novo abaixo) ... */
.chat-container {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 10px);
  width: 69vw;
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

.message-content :deep(a) {
  color: var(--primary-color);
  text-decoration: underline;
}

.message-content :deep(ul),
.message-content :deep(ol) {
  padding-left: 20px;
  margin-top: 5px;
  margin-bottom: 5px;
}

.message-content :deep(li) {
  margin-bottom: 4px;
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

/* Estilo para a imagem enviada no chat */
.message-image {
  margin-top: 8px;
}

.message-image img {
  max-width: 200px;
  max-height: 250px;
  border-radius: 12px;
  border: 1px solid var(--card-border);
  display: block;
}

/* Alinha a imagem à direita se for mensagem do próprio usuário */
.own-message .message-image {
  display: flex;
  justify-content: flex-end;
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

.typing-dots span:nth-child(1) {
  animation-delay: -0.32s;
}

.typing-dots span:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes typing {

  0%,
  80%,
  100% {
    transform: scale(0.8);
    opacity: 0.5;
  }

  40% {
    transform: scale(1);
    opacity: 1;
  }
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

.image-preview-container {
  position: absolute;
  bottom: 100%;
  left: 24px;
  margin-bottom: 10px;
  z-index: 5;
}

.preview-wrapper {
  position: relative;
  display: inline-block;
  background: var(--card-bg);
  padding: 4px;
  border-radius: 8px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  border: 1px solid var(--card-border);
}

.preview-img {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 6px;
  display: block;
}

.remove-img-btn {
  position: absolute;
  top: -8px;
  right: -8px;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 50%;
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  padding: 0;
}

.remove-img-btn:hover {
  background: #dc2626;
}

.input-actions {
  display: flex;
  gap: 4px;
}

.input-actions .action-btn {
  background: transparent;
  color: var(--color-text-secondary);
}

.input-actions .action-btn:hover {
  background: var(--card-border);
  color: var(--primary-color);
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
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

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

.feedback-buttons {
  display: flex;
  gap: 6px;
  margin-top: 6px;
}

.feedback-btn {
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  color: var(--color-text-secondary);
  border-radius: 8px;
  padding: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.feedback-btn:hover {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

.feedback-btn.active {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

.nutritionist-comment-bubble {
  background: #ffffff;
  border: 1px solid #4759fd;
  border-radius: 8px;
  padding: 10px 14px;
  margin-top: 8px;
  max-width: 95%;
  color: #1f2937;
  line-height: 1.4;
  word-wrap: break-word;
}

.other-message .nutritionist-comment-bubble {
  border-bottom-left-radius: 4px;
}

.comment-sender-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8em;
  font-weight: 700;
  margin-bottom: 4px;
  color: #3c09b4;
}

.nutritionist-comment-bubble p {
  margin: 0;
}
</style>