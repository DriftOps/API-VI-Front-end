<template>
  <div class="signup-page" :class="{ dark: darkMode }">
    <button @click="toggleTheme" class="theme-btn" :title="darkMode ? 'Modo Claro' : 'Modo Escuro'">
      <SunIcon v-if="darkMode" :size="18" />
      <MoonIcon v-else :size="18" />
    </button>

    <h1 class="signup-text">Criar Conta</h1>

    <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
    <div v-if="successMessage" class="success-message">{{ successMessage }}</div>
    <div v-if="loading" class="loading">Criando conta...</div>

    <form class="form-container" @submit.prevent="signup">
      <div class="form-section">
        <h3>Dados Pessoais</h3>
        <input v-model="formData.name" placeholder="Nome completo" type="text" required />
        <input v-model="formData.email" placeholder="Email" type="email" required />
        <input v-model="formData.password" type="password" placeholder="Senha" required />
        <input v-model="confirmPassword" type="password" placeholder="Confirmar senha" required />

        <div class="input-group">
          <input v-model.number="formData.weight" type="number" placeholder="Peso (kg)" step="0.1" />
          <input v-model.number="formData.height" type="number" placeholder="Altura (cm)" />
        </div>

        <input v-model="formData.birthDate" type="date" placeholder="Data de nascimento" class="input-full-width" />

        <div class="form-row">
          <label class="section-label">Sexo</label>
          <div class="radio-group">
            <label><input type="radio" value="Feminino" v-model="formData.gender" /> Feminino</label>
            <label><input type="radio" value="Masculino" v-model="formData.gender" /> Masculino</label>
            <label><input type="radio" value="Outro" v-model="formData.gender" /> Outro</label>
            <label><input type="radio" value="Prefiro não dizer" v-model="formData.gender" /> Prefiro não dizer</label>
          </div>
        </div>
        
        <div class="button-group-single">
          <button type="submit" :disabled="loading || !canSubmit" class="signup-btn">
            Criar Conta
          </button>
        </div>

        <p v-if="!passwordsMatch" class="password-error">As senhas não coincidem</p>
      </div>
    </form>

    <p class="login-text">
      Já tem uma conta?
      <router-link to="/" class="login-link">Faça login</router-link>
    </p>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch } from "vue";
import { useRouter } from "vue-router";
import { Sun as SunIcon, Moon as MoonIcon } from "lucide-vue-next";

export default defineComponent({
  name: "Signup",
  components: { SunIcon, MoonIcon },
  setup() {
    const router = useRouter();
    const formData = ref({
      name: "",
      email: "",
      password: "",
      weight: undefined as number | undefined,
      height: undefined as number | undefined,
      birthDate: "",
      gender: "",
    });

    const confirmPassword = ref("");
    const loading = ref(false);
    const errorMessage = ref("");
    const successMessage = ref("");
    const darkMode = ref(localStorage.getItem("theme") === "dark");
    const API_URL = "http://localhost:8080/api";

    const passwordsMatch = computed(() => formData.value.password === confirmPassword.value && formData.value.password.length > 0);
    const canSubmit = computed(() => !!formData.value.name && !!formData.value.email && passwordsMatch.value);

    const signup = async () => {
      loading.value = true;
      errorMessage.value = "";
      successMessage.value = "";

      try {
        const userPayload = {
          name: formData.value.name,
          email: formData.value.email,
          password: formData.value.password,
          weight: formData.value.weight,
          height: formData.value.height,
          birthDate: formData.value.birthDate || null,
          gender: formData.value.gender,
        };

        const userResponse = await fetch(`${API_URL}/users/signup`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(userPayload),
        });

        if (!userResponse.ok) {
          const errorData = await userResponse.json();
          throw new Error(errorData.message || "Falha ao criar a conta.");
        }

        successMessage.value = "Conta criada com sucesso! Aguarde a aprovação do admin.";
        setTimeout(() => router.push("/"), 3000);

      } catch (error: any) {
        console.error("Erro no signup:", error);
        errorMessage.value = error.message;
      } finally {
        loading.value = false;
      }
    };

    const toggleTheme = () => {
      darkMode.value = !darkMode.value;
      localStorage.setItem("theme", darkMode.value ? "dark" : "light");
      applyTheme();
    };

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

    watch(darkMode, applyTheme, { immediate: true });

    return {
      formData,
      confirmPassword,
      loading,
      errorMessage,
      successMessage,
      darkMode,
      passwordsMatch,
      canSubmit,
      signup,
      toggleTheme,
    };
  },
});
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap');

.signup-page {
  width: 1100px;
  max-width: 1100px; 
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: #FFFFFF;
  padding: 40px 20px; 
  box-sizing: border-box;
  font-family: 'Inter', sans-serif;
  margin: 0 auto; 
}

/* Barra de progresso */
.progress-bar-container {
  width: 100%; /* ✅ CORREÇÃO: Ocupa a largura do container */
  max-width: 600px;
  height: 10px;
  background: #e5e7eb;
  border-radius: 10px;
  margin-bottom: 25px;
  margin-top: 10px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background: #4f46e5;
  transition: width 0.4s ease;
  border-radius: 10px;
}

/* Botões */
.button-group {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
}

.button-group-single {
  display: flex;
  justify-content: flex-end;
  margin-top: 15px;
}

.secondary-btn {
  background-color: #6b7280;
}

.secondary-btn:hover {
  background-color: #4b5563;
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

.signup-page.dark {
  background-color: #181818;
  color: white;
}

.intro-text{
  margin-top: 18px;
  margin-bottom: 18px;
  border-bottom: 2px solid #4f46e5;
  padding-bottom: 10px;
}

.signup-text {
  font-size: 36px;
  color: #555;
  margin-bottom: 30px;
  text-align: center; /*  CORREÇÃO: Garante o alinhamento */
}

.signup-page.dark .signup-text {
  color: white;
}

.form-container {
  display: flex; 
  flex-direction: column;
  width: 1100px;
  max-width: 800px; /* Limita a largura do formulário */
  margin-bottom: 30px;
}

.form-section {
  background: white;
  padding: 25px; /*  CORREÇÃO: Mais respiro interno */
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08); /* ✅ CORREÇÃO: Sombra mais suave */
}

.signup-page.dark .form-section {
  background: #2a2a2a;
  color: white;
}

.form-section h3 {
  margin-top: 0; /* ✅ CORREÇÃO: Remove margem do topo */
  margin-bottom: 24px; /* ✅ CORREÇÃO: Aumenta margem inferior */
  color: #4f46e5;
  border-bottom: 2px solid #4f46e5;
  padding-bottom: 10px;
}

.input-group {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px; /* ✅ CORREÇÃO: Aumenta o espaçamento */
}

/* ✅ CORREÇÃO: Nova classe para linhas com um único item, como o input de data */
.input-full-width {
  grid-column: 1 / -1; /* Ocupa todas as colunas do grid pai se estiver dentro de um */
}

input,
select,
textarea {
  width: 100%; /* ✅ CORREÇÃO: Garante que o input ocupe todo o espaço do seu container */
  padding: 12px;
  margin: 8px 0;
  border: 2px solid #ddd;
  border-radius: 8px;
  font-size: 15px;
  box-sizing: border-box;
  resize: vertical;
}

/* ✅ CORREÇÃO: Remove margem de radio/checkbox para melhor alinhamento dentro dos labels */
input[type="radio"], 
input[type="checkbox"] {
  width: auto;
  margin: 0;
}

textarea {
  min-height: 80px;
}

.signup-page.dark input,
.signup-page.dark select,
.signup-page.dark textarea {
  background: #1a1a1a;
  color: white;
  border-color: #444;
}

input:focus,
select:focus,
textarea:focus {
  outline: none;
  border-color: #4f46e5;
}

/* ✅ CORREÇÃO: Nova classe para organizar campos como o de 'sexo' */
.form-row {
  margin: 15px 0;
}

/* Estilos específicos para anamnese */
.section {
  margin-top: 20px;
  margin-bottom: 20px;
  padding-top: 20px;
  border-top: 1px solid #e5e7eb;
}
.signup-page.dark .section {
  border-top-color: #374151;
}

.anamnese-section .section:first-of-type {
  border-top: none;
  padding-top: 0;
  margin-top: 0;
}

.section-label {
  font-weight: 600;
  color: #374151;
  display: block;
  margin-bottom: 12px; /* ✅ CORREÇÃO: Mais espaço */
}

.signup-page.dark .section-label {
  color: #d1d5db;
}

.radio-group,
.checkbox-grid,
.radio-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 15px; /* ✅ CORREÇÃO: Aumenta o espaçamento */
}

.radio-grid label,
.checkbox-grid label,
.radio-group label {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #f3f4f6;
  padding: 10px 14px;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  border: 1px solid transparent;
  transition: all 0.2s ease;
}
.signup-page.dark .radio-grid label,
.signup-page.dark .checkbox-grid label,
.signup-page.dark .radio-group label {
  background: #374151;
  color: #d1d5db;
}

/* ✅ CORREÇÃO: Efeito de hover e seleção para radios/checkboxes */
.radio-group label:hover, .checkbox-grid label:hover, .radio-grid label:hover {
  border-color: #c7d2fe;
}
.signup-page.dark .radio-group label:hover, .signup-page.dark .checkbox-grid label:hover, .signup-page.dark .radio-grid label:hover {
  border-color: #4f46e5;
}

.muted {
  color: #6b7280;
  margin: 16px 0 8px 0; /* ✅ CORREÇÃO: Ajuste de margens */
  font-size: 14px;
}

.signup-page.dark .muted {
  color: #9ca3af;
}

.password-error {
  color: #ef4444;
  margin-top: 8px;
  text-align: right;
}

.login-text {
  margin-top: 20px;
  font-size: 16px;
  color: #555;
}

.signup-page.dark .login-text {
  color: #ccc;
}

.login-link {
  color: #4f46e5;
  font-weight: bold;
  text-decoration: none; /*  CORREÇÃO: Remove sublinhado padrão */
}
.login-link:hover {
  text-decoration: underline;
}

.error-message, .success-message {
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
  width: 100%;
  max-width: 600px;
  box-sizing: border-box;
  text-align: center;
}

.error-message {
  background-color: #fee2e2;
  border: 1px solid #fecaca;
  color: #dc2626;
}
.signup-page.dark .error-message {
  background-color: #7f1d1d;
  border-color: #991b1b;
  color: #fca5a5;
}

.success-message {
  background-color: #d1fae5;
  border: 1px solid #a7f3d0;
  color: #065f46;
}
.signup-page.dark .success-message {
  background-color: #064e3b;
  border-color: #047857;
  color: #6ee7b7;
}


.theme-btn {
  position: absolute; /* CORREÇÃO: Posiciona o botão de tema */
  top: 20px;
  right: 20px;
  margin-top: 0;
  background: #f3f4f6;
  color: #1f2937;
}
.signup-page.dark .theme-btn {
  background: #374151;
  color: #d1d5db;
}

/* Responsividade */
@media (max-width: 768px) {
  .input-group {
    grid-template-columns: 1fr;
  }
  .signup-text {
    font-size: 28px;
  }
  .theme-btn {
    position: static; /* Volta ao fluxo normal em telas menores */
    align-self: flex-end; /* Alinha à direita */
    margin-bottom: 15px;
  }
  .signup-page {
    padding: 20px 15px;
  }
}

</style>