<template>
  <div class="chat-container">
    <h1>Chat de Nutrição</h1>
    <div class="chat-messages" ref="messagesContainer">
      <div
        v-for="(msg, i) in chatHistory"
        :key="i"
        :class="['message', msg.from]"
      >
        <strong>{{ msg.from === 'user' ? 'Você' : 'Agente' }}:</strong> {{ msg.message }}
      </div>
    </div>
    <div class="chat-input">
      <input
        v-model="newMessage"
        @keyup.enter="sendMessage"
        placeholder="Digite sua mensagem..."
      />
      <button @click="sendMessage">Enviar</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onUpdated } from 'vue'
import { sendMessageToAI } from '../api/chatApi.ts'

const chatHistory = ref([])
const newMessage = ref('')
const messagesContainer = ref(null)

function addChatMessage(msg, from) {
  chatHistory.value.push({ message: msg, from })
}

async function sendMessage() {
  if (!newMessage.value.trim()) return
  addChatMessage(newMessage.value, 'user')
  const reply = await sendMessageToAI(newMessage.value)
  addChatMessage(reply, 'agent')
  newMessage.value = ''
}

onUpdated(() => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
})
</script>

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
