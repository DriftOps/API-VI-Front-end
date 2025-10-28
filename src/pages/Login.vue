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

    <div class="password-field">
      <input :type="showPassword ? 'text' : 'password'" v-model="password" placeholder="Senha" />
      <button type="button" class="eye-btn" @click="togglePassword">
        <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
      </button>
    </div>

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
    const showPassword = ref(false)

    function togglePassword() {
      showPassword.value = !showPassword.value
    }

    const loading = ref(false);
    const errorMessage = ref("");

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

        const contentType = response.headers.get('content-type');
        const isJson = contentType?.includes('application/json');

        if (!response.ok) {
          let errorMsg = "Email ou senha incorretos";

          // Tenta obter mensagem mais específica do backend
          if (isJson) {
            try {
              const errorData = await response.json();
              errorMsg = errorData.message || errorMsg;
            } catch {
            }
          }

          // Se a mensagem contém indicativos de "não aprovado", usa mensagem específica
          if (errorMsg.toLowerCase().includes('aprovado') ||
            errorMsg.toLowerCase().includes('approved') ||
            errorMsg.toLowerCase().includes('aguarde') ||
            response.status === 403) {
            errorMsg = "Seu cadastro ainda não foi aprovado. Aguarde a aprovação do administrador.";
          }

          throw new Error(errorMsg);
        }
        if (!isJson) {
          throw new Error("Resposta inválida do servidor");
        }

        const userData: LoginResponse = await response.json();

        if (userData.approved === false) {
          throw new Error("Seu cadastro ainda não foi aprovado. Aguarde a aprovação do administrador.");
        }

        userStore.setUser({
          ...userData,
          approved: userData.approved !== undefined ? userData.approved : true,
          dietaryPreferences: userData.dietaryPreferences ?? [],
          restrictions: userData.restrictions ?? [],
        });

        router.push("/dashboard");

      } catch (error: any) {
        console.error("Erro no login:", error);
        errorMessage.value = error.message || "Erro ao conectar com o servidor";
      } finally {
        loading.value = false;
      }
    };


    const darkMode = ref(localStorage.getItem("theme") === "dark");

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

      if (userStore.isAuthenticated) {
        router.push("/dashboard");
      }
    });

    return {
      email,
      password,
      showPassword,
      togglePassword,
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
  background-color: white;
  text-align: center;
}

.login-page.dark {
  background-color: #181818;
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
  background: #181818;
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

.password-field {
  position: relative;
  display: flex;
  align-items: center;
}

.password-field input {
  width: 100%;
  padding-right: 40px;
}

.eye-btn {
  position: absolute;
  right: 10px;
  background: none;
  border: none;
  cursor: pointer;
  color: #555;
  font-size: 18px;
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