<template>
  <div class="signup-page" :class="{ dark: darkMode }">
    <!-- Logo -->
    <img
      :src="darkMode ? '/NutriXBlack.gif' : '/NutriX.gif'"
      alt="NutriX Logo"
      class="logo"
    />

    <h1 class="signup-text">Cadastro</h1>

    <input v-model="name" placeholder="Nome" />
    <input v-model="email" placeholder="Email" />
    <input v-model="password" type="password" placeholder="Senha" />

    <button @click="signup">Cadastrar</button>

    <!-- Voltar -->
    <p class="back-text">
      Já tem uma conta?
      <router-link to="/" class="back-link">Voltar para login</router-link>
    </p>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import { useUserStore } from "../stores/user";
import { useRouter } from "vue-router";
import { useThemeStore } from "@/stores/theme"; // usa a mesma store

export default defineComponent({
  setup() {
    const userStore = useUserStore();
    const router = useRouter();
    const theme = useThemeStore();

    const name = ref("");
    const email = ref("");
    const password = ref("");

    const signup = () => {
      if (!name.value || !email.value || !password.value) return;

      // mock: cadastra e já loga
      userStore.setUser({
        email: email.value,
        name: name.value,
        id: Date.now(),
      });
      router.push("/dashboard");
    };

    return {
      name,
      email,
      password,
      signup,
      darkMode: theme.darkMode,   // usa o estado global
      toggleTheme: theme.toggleTheme, // se quiser botão aqui também
    };
  },
});
</script>

<style scoped>
.signup-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: #f9f9f9;
  text-align: center;
}

.signup-page.dark {
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

.signup-page.dark input {
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

.signup-text {
  font-size: 42px;
  color: #555;
}

.back-text {
  margin-top: 16px;
  font-size: 16px;
  color: #555;
}

.back-link {
  color: #4f46e5;
  font-weight: bold;
  text-decoration: underline;
  cursor: pointer;
}

.back-link:hover {
  color: #4338ca;
}
</style>