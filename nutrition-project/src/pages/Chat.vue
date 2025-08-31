<template>
  <div class="chat-container">
    <h1>Chat de Nutrição</h1>

    <div class="chat-messages">
      <div v-for="(msg, i) in user.chatHistory" :key="i" :class="['message', msg.from]">
        <strong>{{ msg.from === 'user' ? 'Você' : 'Agente' }}:</strong>
        <span>{{ msg.message }}</span>
      </div>
    </div>

    <div class="chat-input">
      <input v-model="newMessage" @keyup.enter="sendMessage" placeholder="Digite sua mensagem..." />
      <button @click="sendMessage">Enviar</button>
    </div>
 </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { useUserStore } from '../stores/user';
import { sendMessageToAI } from '../api/chat.vue';

export default defineComponent({
  setup() {
    const userStore = useUserStore();
    const user = userStore.user;
    const newMessage = ref('');

    const sendMessage = async () => {
      if (!newMessage.value.trim()) return;

      // adiciona mensagem do usuário
      userStore.addChatMessage(newMessage.value, 'user');

      const reply = await sendMessageToAI(newMessage.value);
      userStore.addChatMessage(reply, 'agent');

      newMessage.value = '';
    };

    return { user, newMessage, sendMessage };
  },
});
</script>

<style scoped>
.chat-container { max-width: 600px; margin: 0 auto; }
.chat-messages { height: 400px; overflow-y: auto; border: 1px solid #ccc; padding: 10px; margin-bottom: 10px; }
.message.user { text-align: right; color: blue; }
.message.agent { text-align: left; color: green; }
.chat-input { display: flex; gap: 5px; }
.chat-input input { flex: 1; padding: 5px; }
</style>
