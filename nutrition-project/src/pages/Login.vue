<template>
  <div class="login-page" :class="{ dark: darkMode }">
    <!-- Toggle de tema -->
    <button class="theme-toggle" :class="{ dark: darkMode }" @click="toggleTheme">
      <div class="circle"></div>
      <span class="sun">☀️</span>
      <span class="moon">🌙</span>
    </button>

    <!-- Logo -->
    <img :src="darkMode ? '/NutriXBlack.gif' : '/NutriX.gif'" alt="NutriX Logo" class="logo" />

    <h1 class="login-text">Login</h1>

    <!-- Mensagens de erro -->
    <div v-if="errorMessage" class="error-message">
      {{ errorMessage }}
    </div>

    <input v-model="email" placeholder="Email" type="email" />
    <input v-model="password" type="password" placeholder="Senha" />

    <button @click="login" :disabled="loading">
      {{ loading ? 'Entrando...' : 'Entrar' }}
    </button>

    <!-- Cadastro -->
    <p class="signup-text">
      Não tem uma conta?
      <router-link to="/signup" class="signup-link">Clique aqui</router-link>
    </p>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from "vue";
import { useUserStore } from "../stores/user";
import { useRouter } from "vue-router";
import { useThemeStore } from "@/stores/theme";
import { api } from "@/services/api";
import type { AuthResponse } from "@/types/user";

export default defineComponent({
  name: "LoginPage",
  setup() {
    const userStore = useUserStore();
    const router = useRouter();
    const themeStore = useThemeStore();

    const email = ref("");
    const password = ref("");
    const loading = ref(false);
    const errorMessage = ref("");

    const login = async () => {
      if (!email.value || !password.value) {
        errorMessage.value = "Por favor, preencha todos os campos";
        return;
      }

      loading.value = true;
      errorMessage.value = "";

      try {
        const response = await api.post<AuthResponse>("/auth/login", {
          email: email.value,
          password: password.value
        });

        // Usa o novo método setAuthUser
        userStore.setAuthUser(response.data);
        
        // Redireciona para o dashboard
        router.push("/dashboard");

      } catch (error: any) {
        console.error("Erro no login:", error);
        
        if (error.response?.status === 401) {
          errorMessage.value = "Email ou senha incorretos";
        } else if (error.response?.data?.message) {
          errorMessage.value = error.response.data.message;
        } else {
          errorMessage.value = "Erro ao fazer login. Tente novamente.";
        }
      } finally {
        loading.value = false;
      }
    };

    return {
      email,
      password,
      loading,
      errorMessage,
      login,
      darkMode: themeStore.darkMode,
      toggleTheme: themeStore.toggleTheme,
    };
  },
});
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: #f9f9f9;
  text-align: center;
}

.login-page.dark {
  background-color: #121212;
  color: white;
}

.logo {
  width: 300px;
  margin-bottom: 20px;
}

input {
  margin: 10px 50px;
  padding: 10px;
  width: 450px;
  border-radius: 8px;
  border: 3px solid #ccc;
  font-size: 16px;
}

input:hover {
  border-color: #666;
  border-radius: 18px;
}

.login-page.dark input {
  background: #2a2a2a;
  color: white;
  border: 3px solid #444;
}

button {
  margin-top: 15px;
  padding: 10px 20px;
  background-color: #4f46e5;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s ease;
  font-size: 16px;
  min-width: 120px;
}

button:hover:not(:disabled) {
  background-color: #4338ca;
  border-radius: 18px;
}

button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.login-text {
  font-size: 42px;
  color: #555;
  margin-bottom: 20px;
}

.login-page.dark .login-text {
  color: white;
}

.signup-text {
  margin-top: 16px;
  font-size: 16px;
  color: #555;
}

.login-page.dark .signup-text {
  color: white;
}

.signup-link {
  color: #4f46e5;
  font-weight: bold;
  text-decoration: underline;
  cursor: pointer;
}

.signup-link:hover {
  color: #4338ca;
}

.error-message {
  color: #e53e3e;
  background-color: #fed7d7;
  padding: 10px 15px;
  border-radius: 8px;
  margin-bottom: 15px;
  border: 1px solid #feb2b2;
}

.login-page.dark .error-message {
  color: #fed7d7;
  background-color: #742a2a;
  border-color: #742a2a;
}

/* Toggle */
.theme-toggle {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 50px;
  height: 26px;
  border-radius: 13px;
  border: none;
  background: #ccc;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 4px;
  box-sizing: border-box;
}

.theme-toggle.dark {
  background: #4f46e5;
}

.theme-toggle .circle {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #fff;
  position: absolute;
  top: 2px;
  left: 2px;
  transition: left 0.3s ease;
}

.theme-toggle.dark .circle {
  left: 26px;
}

.theme-toggle .sun,
.theme-toggle .moon {
  font-size: 14px;
  pointer-events: none;
}
</style>