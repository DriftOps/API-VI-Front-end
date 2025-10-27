<template>
    <DashboardLayout>
      <div class="supervision-container">
        <div class="client-list-panel">
          <div class="panel-header">
            <h2>Clientes</h2>
            <input type="text" v-model="clientSearch" placeholder="Buscar cliente..." />
          </div>
          <ul class="client-list">
            <li
              v-for="client in filteredClients"
              :key="client.id"
              @click="selectClient(client.id)"
              :class="{ active: client.id === selectedClientId }"
              class="client-item"
            >
              <span class="client-name">{{ client.name }}</span>
              <span class="client-email">{{ client.email }}</span>
            </li>
          </ul>
        </div>
  
        <div class="chat-display-panel">
          <div class="panel-header" v-if="selectedClientId">
            <h2>Chat de {{ selectedClientName }}</h2>
          </div>
          <div class="panel-header" v-else>
            <h2>Selecione um cliente para revisar</h2>
          </div>
  
          <div class="messages-container" ref="messagesContainer">
            <div v-if="isLoadingChat" class="loading-chat">Carregando...</div>
  
            <div v-for="msg in selectedChatHistory" :key="msg.id" class="message-wrapper">
  
              <div :class="['message-bubble', msg.sender === 'user' ? 'user-msg' : 'ai-msg']">
                <strong class="sender-label">
                  {{ msg.sender === 'user' ? selectedClientName : 'Assistente (AI)' }}
                </strong>
                <p v-html="renderMarkdown(msg.message)"></p>
                <span class="timestamp">{{ formatTime(msg.timestamp) }}</span>
              </div>
  
              <div class="comment-wrapper">
                <div v-if="msg.nutritionistComment && editingMessageId !== msg.id" class="comment-bubble">
                  <strong class="sender-label">Seu Comentário:</strong>
                  <p>{{ msg.nutritionistComment }}</p>
                  <button @click="startEditComment(msg)" class="comment-btn-edit">Editar</button>
                </div>
  
                <div v-if="msg.sender === 'assistant' && !msg.nutritionistComment && editingMessageId !== msg.id" class="add-comment">
                  <button @click="startEditComment(msg)" class="comment-btn-add">
                    + Adicionar Comentário
                  </button>
                </div>
  
                <div v-if="editingMessageId === msg.id" class="comment-editor">
                  <textarea v-model="commentText" placeholder="Digite sua observação..."></textarea>
                  <div class="editor-actions">
                    <button @click="cancelEdit" class="btn-secondary">Cancelar</button>
                    <button @click="saveComment(msg.id)" class="btn-primary" :disabled="isSavingComment">
                      {{ isSavingComment ? 'Salvando...' : 'Salvar' }}
                    </button>
                  </div>
                </div>
              </div>
  
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  </template>
  
  <script setup lang="ts">
  import { ref, onMounted, computed, nextTick } from 'vue';
  import DashboardLayout from '@/layouts/DashboardLayout.vue';
  import { fetchClients, fetchClientChat, postNutriComment } from '@/api/nutritionistApi';
  import type { ClientDTO, ChatMessageDTO } from '@/api/nutritionistApi';
  import MarkdownIt from 'markdown-it';
  
  const md = new MarkdownIt({ breaks: true, linkify: true });
  const renderMarkdown = (text: string) => md.render(text);
  
  const clients = ref<ClientDTO[]>([]);
  const clientSearch = ref("");
  const selectedClientId = ref<number | null>(null);
  const selectedChatHistory = ref<ChatMessageDTO[]>([]);
  const isLoadingChat = ref(false);
  const messagesContainer = ref<HTMLDivElement | null>(null);
  
  const editingMessageId = ref<number | null>(null);
  const commentText = ref("");
  const isSavingComment = ref(false);
  
  // Carrega clientes ao montar
  onMounted(async () => {
    try {
      clients.value = await fetchClients();
    } catch (error) {
      console.error("Erro ao buscar clientes:", error);
      alert("Não foi possível carregar a lista de clientes.");
    }
  });
  
  // Filtra clientes baseado na busca
  const filteredClients = computed(() => {
    if (!clientSearch.value) return clients.value;
    return clients.value.filter(c =>
      c.name.toLowerCase().includes(clientSearch.value.toLowerCase()) ||
      c.email.toLowerCase().includes(clientSearch.value.toLowerCase())
    );
  });
  
  const selectedClientName = computed(() => {
    return clients.value.find(c => c.id === selectedClientId.value)?.name || "";
  });
  
  // Ação: Selecionar um cliente
  const selectClient = async (userId: number) => {
    if (selectedClientId.value === userId) return;
  
    selectedClientId.value = userId;
    isLoadingChat.value = true;
    selectedChatHistory.value = [];
    cancelEdit();
  
    try {
      selectedChatHistory.value = await fetchClientChat(userId);
    } catch (error) {
      console.error("Erro ao buscar chat:", error);
      alert("Não foi possível carregar o chat deste cliente.");
    } finally {
      isLoadingChat.value = false;
      await nextTick();
      scrollToBottom();
    }
  };
  
  // --- Lógica de Comentários ---
  const startEditComment = (message: ChatMessageDTO) => {
    editingMessageId.value = message.id;
    commentText.value = message.nutritionistComment || "";
  };
  
  const cancelEdit = () => {
    editingMessageId.value = null;
    commentText.value = "";
  };
  
  const saveComment = async (messageId: number) => {
    isSavingComment.value = true;
    try {
      const updatedMessage = await postNutriComment(messageId, commentText.value);
  
      // Atualiza o histórico local
      const index = selectedChatHistory.value.findIndex(m => m.id === messageId);
      if (index !== -1) {
        selectedChatHistory.value[index] = updatedMessage;
      }
      cancelEdit();
    } catch (error) {
      console.error("Erro ao salvar comentário:", error);
      alert("Não foi possível salvar seu comentário.");
    } finally {
      isSavingComment.value = false;
    }
  };
  
  // --- Utilidades ---
  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const scrollToBottom = () => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  }
  </script>
  
  <style scoped>
 .supervision-container {
  display: flex;
  height: 100%; 
  background: var(--color-background);
}
  
  /* Painel da Esquerda (Clientes) */
  .client-list-panel {
    width: 320px;
    border-right: 1px solid var(--card-border);
    display: flex;
    flex-direction: column;
    background: var(--card-bg);
  }
  
  .panel-header {
    padding: 16px;
    border-bottom: 1px solid var(--card-border);
    width: 85vh;
  }
  .panel-header h2 {
    margin: 0 0 12px 0;
    font-size: 1.1em;
  }
  .panel-header input {
    width: 50%;
    padding: 8px 12px;
    border-radius: 6px;
    border: 1px solid var(--card-border);
    background: var(--input-bg);
    color: var(--input-text);
  }
  
  .client-list {
    list-style: none;
    padding: 0;
    margin: 0;
    flex: 1;
    overflow-y: auto;
  }
  .client-item {
    padding: 12px 16px;
    cursor: pointer;
    border-bottom: 1px solid var(--card-border);
    transition: background-color 0.2s;
  }
  .client-item:hover {
    background: var(--input-bg);
  }
  .client-item.active {
    background: var(--primary-color);
    color: white;
  }
  .client-name {
    display: block;
    font-weight: 600;
  }
  .client-email {
    display: block;
    font-size: 0.85em;
    opacity: 0.7;
  }
  
  /* Painel da Direita (Chat) */
  .chat-display-panel {
    flex: 1;
    display: flex;
    flex-direction: column;
  }
  
  .messages-container {
    flex: 1;
    overflow-y: auto;
    padding: 20px;
  }
  
  .message-wrapper {
    margin-bottom: 16px;
  }
  
  .message-bubble {
    padding: 10px 14px;
    border-radius: 12px;
    max-width: 70%;
    line-height: 1.5;
    /* Força o texto a ser escuro, corrigindo legibilidade no modo escuro.
    */
    color: #1f2937;
  }
  .sender-label {
    font-size: 0.8em;
    font-weight: 700;
    display: block;
    margin-bottom: 4px;
  }
  .message-bubble p {
    margin: 0;
    word-wrap: break-word;
  }
  .timestamp {
    font-size: 0.75em;
    opacity: 0.6;
    display: block;
    text-align: right;
    margin-top: 5px;
  }
  
  .user-msg {
    background: white;
    border: 1px solid var(--card-border);
    margin-left: auto;
    border-bottom-right-radius: 4px;
  }
  .ai-msg {
    background: #eef2ff; /* Fundo azul claro para AI */
    border: 1px solid #c7d2fe;
    margin-left: 0;
    border-bottom-left-radius: 4px;
  }
  
  .comment-wrapper {
    max-width: 65%;
    margin-left: 5%; /* Indentação para o comentário */
    margin-top: 8px;
  }
  .comment-bubble {
    background: #fefce8; /* Fundo amarelo claro para Comentário */
    border: 1px solid #fde047;
    border-radius: 8px;
    padding: 10px 14px;
    /* Força o texto a ser escuro, corrigindo legibilidade no modo escuro.
    */
    color: #1f2937;
  }
  .comment-bubble p { margin: 0; }
  
  .comment-btn-add {
    font-size: 0.8em;
    padding: 4px 8px;
    border: 1px dashed var(--card-border);
    background: none;
    cursor: pointer;
    border-radius: 4px;
    /* Adicionado para herdar a cor do texto do tema */
    color: var(--color-text);
    opacity: 0.7;
  }
  .comment-btn-add:hover {
    opacity: 1;
    background: var(--input-bg);
  }
  .comment-btn-edit {
    font-size: 0.8em;
    padding: 2px 6px;
    border: none;
    background: none;
    color: var(--primary-color);
    cursor: pointer;
    float: right;
  }
  
  .comment-editor {
    background: var(--card-bg);
    border: 1px solid var(--primary-color);
    border-radius: 8px;
    padding: 10px;
  }
  .comment-editor textarea {
    width: 100%;
    min-height: 60px;
    border: 1px solid var(--card-border);
    border-radius: 4px;
    padding: 8px;
    background: var(--input-bg);
    color: var(--color-text);
  }
  .editor-actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    margin-top: 8px;
  }
  
  .btn-primary, .btn-secondary {
    padding: 6px 12px;
    border-radius: 6px;
    border: none;
    font-weight: 600;
    cursor: pointer;
  }
  .btn-primary { background-color: var(--primary-color); color: white; }
  .btn-primary:disabled { opacity: 0.5; }
  .btn-secondary { background-color: var(--card-border); color: var(--color-text); }
  
  </style>