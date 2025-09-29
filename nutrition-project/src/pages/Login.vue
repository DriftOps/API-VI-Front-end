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

    <input v-model="email" placeholder="Email" />
    <input v-model="password" type="password" placeholder="Senha" />

    <button @click="login">Entrar</button>

    <!-- Cadastro -->
    <p class="signup-text">
      Não tem uma conta?
      <router-link to="/signup" class="signup-link">Clique aqui</router-link>
    </p>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from "vue";
import { useUserStore } from "../stores/user";
import { useRouter } from "vue-router";

export default defineComponent({
  setup() {
    const userStore = useUserStore();
    const router = useRouter();

    const email = ref("");
    const password = ref("");

    const login = () => {
      if (!email.value || !password.value) return;

      userStore.setUser({ email: email.value, name: "Felipe", id: 1 });
      router.push("/dashboard");
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

    return { email, password, login, darkMode, toggleTheme };
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

button:hover {
  background-color: #4338ca;
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
