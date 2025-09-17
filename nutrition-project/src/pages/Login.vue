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
import { useThemeStore } from "@/stores/theme";

export default defineComponent({
  setup() {
    const userStore = useUserStore();
    const router = useRouter();
    const theme = useThemeStore();

    const email = ref("");
    const password = ref("");

    const login = () => {
      if (!email.value || !password.value) return;
      userStore.setUser({ email: email.value, name: "Felipe", id: 1 });
      router.push("/dashboard");
    };

    return {
      email,
      password,
      login,
      darkMode: theme.darkMode,
      toggleTheme: theme.toggleTheme,
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
  box-sizing: border-box;
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
