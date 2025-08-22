<template>
  <div class="login-page">
    <h1>Login</h1>
    <input v-model="email" placeholder="Email" />
    <input v-model="password" type="password" placeholder="Senha" />
    <button @click="login">Entrar</button>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { useUserStore } from '../stores/user';
import { useRouter } from 'vue-router';

export default defineComponent({
  setup() {
    const userStore = useUserStore();
    const router = useRouter();

    const email = ref('');
    const password = ref('');

    const login = () => {
      if (!email.value || !password.value) return;

      // Simula login
      userStore.setUser({ email: email.value, name: 'Felipe', id: 1 });

      // Redireciona pra dashboard
      router.push('/dashboard');
    };

    return { email, password, login };
  },
});
</script>