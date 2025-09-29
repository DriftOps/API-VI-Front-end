<template>
  <div class="chat-container">
    <div class="top-bar">
      <h1>Chat de Nutrição</h1>
      <button class="theme-toggle" :class="{ dark: darkMode }" @click="toggleTheme">
        <div class="circle"></div>
        <span class="sun">☀️</span>
        <span class="moon">🌙</span>
      </button>
    </div>

    <div class="chat-messages">
      <div
        v-for="(msg, i) in user.chatHistory"
        :key="i"
        :class="['message', msg.from]"
      >
        <strong>{{ msg.from === 'user' ? '' : 'NutriX: ' }} </strong>
        <span>{{ msg.message }}</span>
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

<script lang="ts">
import { defineComponent, ref, onMounted } from "vue";
import { useUserStore } from "../stores/user";
import { sendMessageToAI } from "../api/chatApi";

export default defineComponent({
  setup() {
    const userStore = useUserStore();
    const user = userStore.user;
    const newMessage = ref("");
    const darkMode = ref(localStorage.getItem("theme") === "dark");

    const applyTheme = () => {
      const html = document.documentElement;
      if (darkMode.value) {
        html.classList.add("dark");
        html.classList.remove("light");
      } else {
        html.classList.add("light");
        html.classList.remove("dark");
      }
    };

    const toggleTheme = () => {
      darkMode.value = !darkMode.value;
      localStorage.setItem("theme", darkMode.value ? "dark" : "light");
      applyTheme();
    };

    onMounted(() => {
      applyTheme();
    });

    const sendMessage = async () => {
      if (!newMessage.value.trim()) return;

      userStore.addChatMessage(newMessage.value, "user");
      const reply = await sendMessageToAI(newMessage.value);
      userStore.addChatMessage(reply, "agent");

      newMessage.value = "";
    };

    return { user, newMessage, sendMessage, darkMode, toggleTheme };
  },
});
</script>

<style scoped>
* {
  transition: background 0.3s, color 0.3s, border-color 0.3s;
}

.chat-container {
  width: 90vw;
  margin: 40px auto;
  padding: 20px;
  background: var(--color-background);
  color: var(--color-text);
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  font-family: "Segoe UI", sans-serif;
  display: flex;
  flex-direction: column;
  height: 80vh;
}

.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

h1 {
  font-size: 24px;
  font-weight: bold;
  color: var(--color-heading, var(--color-text));
}

/* mensagens */
.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 15px;
  border-radius: 12px;
  border: 1px solid var(--card-border);
  background: var(--card-bg);
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.message {
  padding: 10px 14px;
  border-radius: 12px;
  max-width: 70%;
  word-wrap: break-word;
  line-height: 1.4;
}

.message.user {
  align-self: flex-end;
  background: #007bff;
  color: #fff;
  border-bottom-right-radius: 2px;
}

.message.agent {
  align-self: flex-start;
  background: #28a745;
  color: #fff;
  border-bottom-left-radius: 2px;
}

/* input */
.chat-input {
  display: flex;
  gap: 10px;
  margin-top: 15px;
}

.chat-input input {
  flex: 1;
  padding: 12px;
  border-radius: 10px;
  border: 1px solid var(--card-border);
  background: var(--card-bg);
  color: var(--color-text);
  outline: none;
  font-size: 14px;
}

.chat-input button {
  padding: 0 20px;
  border-radius: 10px;
  border: none;
  background: var(--save-btn-bg, #2c3e50);
  color: white;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.3s, transform 0.2s;
}

.chat-input button:hover {
  background: var(--save-btn-hover, #1a252f);
  transform: scale(1.05);
}

/* toggle theme */
.theme-toggle {
  width: 50px;
  height: 26px;
  border-radius: 13px;
  border: none;
  background: var(--card-border);
  cursor: pointer;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 4px;
}

.theme-toggle .circle {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #fff;
  position: absolute;
  top: 2px;
  left: 2px;
  transition: left 0.3s;
}

.theme-toggle.dark .circle {
  left: 26px;
}

.theme-toggle .sun,
.theme-toggle .moon {
  font-size: 14px;
  pointer-events: none;
}

.theme-toggle .sun {
  color: #ffbb33;
}

.theme-toggle .moon {
  color: #5555ff;
}
</style>
