<template>
  <div class="login-page" :class="{ dark: darkMode }">
    <!-- Toggle de tema -->
    <button class="theme-toggle" @click="toggleTheme">
      <div class="icon" :class="{ dark: darkMode }">
        <span class="sun">☀️</span>
        <span class="moon">🌙</span>
      </div>
    </button>

    <!-- Logo -->
    <img
      :src="darkMode ? '/NutriXBlack.gif' : '/NutriX.gif'"
      alt="NutriX Logo"
      class="logo"
    />

    <h1 class="login-text">Login</h1>

    <!-- Mensagem de erro -->
    <div v-if="errorMessage" class="error-message">
      {{ errorMessage }}
    </div>

    <!-- Loading -->
    <div v-if="loading" class="loading">Carregando...</div>

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
import { defineComponent, ref, watch, onMounted } from "vue";
import { useUserStore } from "../stores/user";
import { useRouter } from "vue-router";

// Interface para a resposta da API
interface LoginResponse {
  dietaryPreferences: never[];
  restrictions: never[];
  id: number;
  name: string;
  email: string;
  role: string;
  token: string;
}

export default defineComponent({
  setup() {
    const userStore = useUserStore();
    const router = useRouter();

    const email = ref("");
    const password = ref("");
    const loading = ref(false);
    const errorMessage = ref("");

    // URL da sua API - ajuste conforme necessário
    const API_URL = "http://localhost:8080/api";

    const login = async () => {
      if (!email.value || !password.value) {
        errorMessage.value = "Por favor, preencha todos os campos";
        return;
      }

      loading.value = true;
      errorMessage.value = "";

      try {
        const response = await fetch(`${API_URL}/users/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.value,
            password: password.value,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Erro ao fazer login");
        }

        const userData: LoginResponse = await response.json();

        // Adiciona propriedades faltantes com valores padrão
        const completeUser = {
          ...userData,
          dietaryPreferences: userData.dietaryPreferences ?? [],
          restrictions: userData.restrictions ?? [],
        };

        // Salva o usuário na store
        userStore.setUser(completeUser);

        // Redireciona para dashboard
        router.push("/dashboard");

      } catch (error: any) {
        console.error("Erro no login:", error);
        errorMessage.value = error.message || "Erro ao conectar com o servidor";
      } finally {
        loading.value = false;
      }
    };

    // Estado do dark mode
    const darkMode = ref(localStorage.getItem("theme") === "dark");

    // Atualiza <html class="dark"> e salva no localStorage
    watch(darkMode, (val) => {
      if (val) {
        document.documentElement.classList.add("dark");
        localStorage.setItem("theme", "dark");
      } else {
        document.documentElement.classList.remove("dark");
        localStorage.setItem("theme", "light");
      }
    }, { immediate: true });

    const toggleTheme = () => {
      darkMode.value = !darkMode.value;
    };

    // Inicializa o usuário ao carregar o componente
    onMounted(() => {
      userStore.initUser();
      
      // Se já estiver autenticado, redireciona para dashboard
      if (userStore.isAuthenticated) {
        router.push("/dashboard");
      }
    });

    return { 
      email, 
      password, 
      login, 
      darkMode, 
      toggleTheme,
      loading,
      errorMessage
    };
  },
});
</script>

<style scoped>
.login-page {
  width: 85vw; /* ocupar toda a largura da viewport */
  min-height: 120vh;
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
}

input {
  margin: 10px 50px;
  padding: 10px;
  width: 450px;
  border-radius: 8px;
  border: 3px solid #ccc;
}

input:hover {
  border-color: #888;
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
}

button:hover:not(:disabled) {
  background-color: #4338ca;
}

button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.login-text {
  font-size: 42px;
  color: #555;
}

.signup-text {
  margin-top: 16px;
  font-size: 16px;
  color: #555;
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

/* Mensagem de erro */
.error-message {
  background-color: #fee;
  border: 1px solid #fcc;
  color: #c33;
  padding: 10px;
  border-radius: 5px;
  margin-bottom: 15px;
  max-width: 450px;
}

.login-page.dark .error-message {
  background-color: #322;
  border-color: #633;
  color: #f99;
}

/* Loading */
.loading {
  color: #4f46e5;
  margin-bottom: 15px;
}

/* Toggle */
.theme-toggle {
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 60px;
  height: 30px;
  border-radius: 30px;
  border: none;
  background: #ddd;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  position: relative;
}

.theme-toggle .icon {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: white;
  position: absolute;
  left: 4px;
  top: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  font-size: 14px;
}

.theme-toggle .icon.dark {
  left: 34px;
}

.theme-toggle .sun {
  display: block;
}

.theme-toggle .moon {
  display: none;
}

.theme-toggle .icon.dark .sun {
  display: none;
}

.theme-toggle .icon.dark .moon {
  display: block;
}
</style>