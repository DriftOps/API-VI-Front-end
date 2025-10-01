<template>
  
  <div class="login-page" :class="{ dark: darkMode }">
    <!-- Toggle de tema -->
     
    <button @click="toggleTheme" class="theme-btn" :title="darkMode ? 'Modo Claro' : 'Modo Escuro'">
      <ThemeToggle />
      <SunIcon v-if="darkMode" :size="18" />
      <MoonIcon v-else :size="18" />
    </button>

    <!-- Logo -->
    <img :src="darkMode ? '/NutriXBlack.png' : '/NutriXWhite.png'" alt="NutriX Logo" class="logo" />

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
import ThemeToggle from "@/components/ThemeToggle.vue";
import {
  Sun as SunIcon,
  Moon as MoonIcon
} from "lucide-vue-next";

// Interface para a resposta da API
interface LoginResponse {
  dietaryPreferences: never[];
  restrictions: never[];
  id: number;
  name: string;
  email: string;
  role: string;
  token: string;
  approved?: boolean;
}

export default defineComponent({
  components: {
    SunIcon,
    MoonIcon
  },
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

        // Verifica se a resposta está vazia
        const contentLength = response.headers.get('content-length');
        const contentType = response.headers.get('content-type');

        if (!response.ok) {
          // Se for status 403 (Forbidden) - usuário não aprovado
          if (response.status === 403) {
            throw new Error("Seu cadastro ainda não foi aprovado. Aguarde a aprovação do administrador.");
          }

          // Tenta obter mensagem de erro do backend
          let errorMsg = "Erro ao fazer login";
          try {
            if (contentLength !== '0' && contentType?.includes('application/json')) {
              const errorData = await response.json();
              errorMsg = errorData.message || errorMsg;
            }
          } catch {
            // Se não conseguir parsear JSON, usa mensagem padrão baseada no status
            if (response.status === 401) {
              errorMsg = "Email ou senha incorretos";
            } else if (response.status === 403) {
              errorMsg = "Acesso negado. Usuário não aprovado.";
            } else {
              errorMsg = `Erro ${response.status}: ${response.statusText}`;
            }
          }
          throw new Error(errorMsg);
        }

        // Processa resposta de sucesso
        let userData: LoginResponse;

        try {
          if (contentLength === '0' || !contentType?.includes('application/json')) {
            throw new Error("Resposta vazia do servidor");
          }
          userData = await response.json();
        } catch (parseError) {
          console.error("Erro ao parsear resposta:", parseError);
          throw new Error("Resposta inválida do servidor");
        }

        // Verifica se o usuário está aprovado (se o campo exists)
        if (userData.approved === false) {
          throw new Error("Seu cadastro ainda não foi aprovado. Aguarde a aprovação do administrador.");
        }

        // Adiciona propriedades faltantes com valores padrão
        const completeUser = {
          ...userData,
          approved: userData.approved !== undefined ? userData.approved : true, // Assume true se não existir
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
  width: 85vw;
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
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.3s, color 0.3s;
}

/* Light mode */
.theme-toggle {
  background: #f3f3f3;
  color: #333;
}

/* Dark mode */
:deep(html.dark) .theme-toggle {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.theme-toggle:hover {
  background: #e0e0e0;
}

:deep(html.dark) .theme-toggle:hover {
  background: rgba(255, 255, 255, 0.2);
}

.theme-btn {
  margin-bottom: 5px;
}
</style>