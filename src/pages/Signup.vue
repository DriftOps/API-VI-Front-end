<template>
  <div class="signup-page" :class="{ dark: darkMode }">
    <!-- Toggle de tema -->
    <button @click="toggleTheme" class="theme-btn" :title="darkMode ? 'Modo Claro' : 'Modo Escuro'">
      <SunIcon v-if="darkMode" :size="18" />
      <MoonIcon v-else :size="18" />
    </button>

    <!-- Barra de progresso -->
    <div class="progress-bar-container">
      <div class="progress-bar" :style="{ width: currentStep === 1 ? '50%' : '100%' }"></div>
    </div>

    <h1 class="signup-text">
      {{ currentStep === 1 ? 'Criar Conta' : 'Anamnese' }}
    </h1>

    <!-- Mensagens -->
    <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
    <div v-if="successMessage" class="success-message">{{ successMessage }}</div>
    <div v-if="loading" class="loading">Criando conta...</div>

    <div class="form-container">
      <!-- Etapa 1: Dados da conta -->
      <div v-if="currentStep === 1" class="form-section">
        <h3>Dados Pessoais</h3>
        <input v-model="formData.name" placeholder="Nome completo" type="text" required />
        <input v-model="formData.email" placeholder="Email" type="email" required />
        <input v-model="formData.password" type="password" placeholder="Senha" required />
        <input v-model="confirmPassword" type="password" placeholder="Confirmar senha" required />
        <button @click="nextStep" :disabled="!passwordsMatch || !formData.name || !formData.email" class="signup-btn">
          Próximo
        </button>
        <p v-if="!passwordsMatch" class="password-error">As senhas não coincidem</p>
      </div>

      <!-- Etapa 2: Anamnese -->
      <div v-if="currentStep === 2" class="form-section">
        <h3>Dados de Anamnese</h3>

        <div class="input-group">
          <input v-model="formData.weight" type="number" placeholder="Peso (kg)" step="0.1" />
          <input v-model="formData.height" type="number" placeholder="Altura (cm)" />
        </div>

        <input v-model="formData.birthDate" type="date" placeholder="Data de nascimento" />

        <select v-model="formData.goal" class="select-field">
          <option value="">Selecione seu objetivo</option>
          <option value="LOSE_WEIGHT">Perder peso rápido</option>
          <option value="LOSE_FAT">Reduzir gordura corporal</option>
          <option value="GAIN_WEIGHT">Ganhar peso saudável</option>
          <option value="BUILD_MUSCLE">Aumentar massa magra</option>
          <option value="IMPROVE_ENDURANCE">Melhorar resistência física</option>
          <option value="IMPROVE_STRENGTH">Aumentar força muscular</option>
          <option value="MAINTAIN_WEIGHT">Manter peso ideal</option>
        </select>

        <select v-model="formData.activityLevel" class="select-field">
          <option value="">Nível de atividade</option>
          <option value="SEDENTARY">Sedentário</option>
          <option value="LIGHT">Leve</option>
          <option value="MODERATE">Moderado</option>
          <option value="ACTIVE">Ativo</option>
          <option value="VERY_ACTIVE">Muito Ativo</option>
        </select>

        <!-- Preferências alimentares -->
        <div class="tags-section">
          <label>Preferências alimentares (opcional)</label>
          <div class="tags-input">
            <select v-model="newPreference" class="select-field">
              <option disabled value="">Selecione uma preferência</option>
              <option value="Vegano">Vegano</option>
              <option value="Vegetariano">Vegetariano</option>
              <option value="Low Carb">Low Carb</option>
              <option value="Sem Glúten">Sem Glúten</option>
            </select>
            <button @click="addPreference" class="add-tag-btn">+</button>
          </div>
          <div class="tags-list">
            <span v-for="(pref, index) in formData.dietaryPreferences" :key="index" class="tag">
              {{ pref }}
              <button @click="removePreference(index)" class="remove-tag">×</button>
            </span>
          </div>
        </div>

        <!-- Restrições alimentares -->
        <div class="tags-section">
          <label>Restrições alimentares (opcional)</label>
          <div class="tags-input">
            <select v-model="newRestriction" class="select-field">
              <option disabled value="">Selecione uma restrição</option>
              <option value="Intolerância à Lactose">Intolerância à Lactose</option>
              <option value="Intolerância à Glúten">Intolerância à Glúten</option>
              <option value="Alergia a Amendoim">Alergia a Amendoim</option>
              <option value="Diabetes">Diabetes</option>
              <option value="Hipertensão">Hipertensão</option>
            </select>
            <button @click="addRestriction" class="add-tag-btn">+</button>
          </div>
          <div class="tags-list">
            <span v-for="(rest, index) in formData.restrictions" :key="index" class="tag">
              {{ rest }}
              <button @click="removeRestriction(index)" class="remove-tag">×</button>
            </span>
          </div>
        </div>

        <!-- Botões de navegação -->
        <div class="button-group">
          <button @click="prevStep" class="signup-btn secondary-btn">Voltar</button>
          <button @click="signup" :disabled="loading" class="signup-btn">
            {{ loading ? 'Criando conta...' : 'Concluir Cadastro' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Login -->
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

interface SignupResponse {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface SignupForm {
  name: string;
  email: string;
  password: string;
  goal: string;
  weight?: number;
  height?: number;
  birthDate: string;
  activityLevel: string;
  dietaryPreferences: string[];
  restrictions: string[];
}

export default defineComponent({
  name: "Signup",
  components: { SunIcon, MoonIcon },
  setup() {
    const router = useRouter();
    const currentStep = ref(1);

    const formData = ref<SignupForm>({
      name: "",
      email: "",
      password: "",
      goal: "",
      weight: undefined,
      height: undefined,
      birthDate: "",
      activityLevel: "",
      dietaryPreferences: [],
      restrictions: [],
    });

    const confirmPassword = ref("");
    const newPreference = ref("");
    const newRestriction = ref("");
    const loading = ref(false);
    const errorMessage = ref("");
    const successMessage = ref("");
    const darkMode = ref(localStorage.getItem("theme") === "dark");

    const API_URL = "http://localhost:8080/api";

    const passwordsMatch = computed(
      () =>
        formData.value.password === confirmPassword.value &&
        formData.value.password.length > 0
    );

    const addPreference = () => {
      if (
        newPreference.value.trim() &&
        !formData.value.dietaryPreferences.includes(newPreference.value.trim())
      ) {
        formData.value.dietaryPreferences.push(newPreference.value.trim());
        newPreference.value = "";
      }
    };

    const removePreference = (index: number) =>
      formData.value.dietaryPreferences.splice(index, 1);

    const addRestriction = () => {
      if (
        newRestriction.value.trim() &&
        !formData.value.restrictions.includes(newRestriction.value.trim())
      ) {
        formData.value.restrictions.push(newRestriction.value.trim());
        newRestriction.value = "";
      }
    };

    const removeRestriction = (index: number) =>
      formData.value.restrictions.splice(index, 1);

    const nextStep = () => {
      if (!formData.value.name || !formData.value.email || !passwordsMatch.value) {
        errorMessage.value = "Preencha todos os campos corretamente antes de prosseguir.";
        return;
      }
      errorMessage.value = "";
      currentStep.value = 2;
    };

    const prevStep = () => {
      currentStep.value = 1;
    };

    const signup = async () => {
      loading.value = true;
      errorMessage.value = "";
      successMessage.value = "";

      try {
        const response = await fetch(`${API_URL}/users/signup`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData.value),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Erro ao criar conta");
        }

        const userData: SignupResponse = await response.json();
        successMessage.value = "Conta criada com sucesso! Aguarde a aprovação do administrador.";

        setTimeout(() => router.push("/login"), 3000);
      } catch (error: any) {
        console.error("Erro no signup:", error);
        errorMessage.value = error.message || "Erro ao criar conta.";
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
      newPreference,
      newRestriction,
      loading,
      errorMessage,
      successMessage,
      darkMode,
      passwordsMatch,
      currentStep,
      nextStep,
      prevStep,
      signup,
      addPreference,
      removePreference,
      addRestriction,
      removeRestriction,
      toggleTheme,
    };
  },
});
</script>

<style scoped>
/* Mantém TODO o estilo original */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap');

/* Barra de progresso */
.progress-bar-container {
  width: 80%;
  height: 10px;
  background: #e5e7eb;
  border-radius: 10px;
  margin-bottom: 25px;
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

.secondary-btn {
  background-color: #6b7280;
}

.secondary-btn:hover {
  background-color: #4b5563;
}

.signup-page {
  width: 85vw;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: #FFFFFF;
  padding: 20px;
  box-sizing: border-box;
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

.logo {
  width: 250px;
  margin-bottom: 20px;
}

.signup-text {
  font-size: 36px;
  color: #555;
  margin-bottom: 30px;
}

.signup-page.dark .signup-text {
  color: white;
}

.form-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  max-width: 900px;
  width: 100vw;
  margin-bottom: 30px;
}

.form-section {
  background: white;
  width: 70vw;
  padding: 25px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.signup-page.dark .form-section {
  background: #2a2a2a;
  color: white;
}

.form-section h3 {
  margin-bottom: 20px;
  color: #4f46e5;
  border-bottom: 2px solid #4f46e5;
  padding-bottom: 10px;
}

.signup-page.dark .form-section h3 {
  color: #8b5cf6;
  border-color: #8b5cf6;
}

input,
.select-field {
  width: 100%;
  padding: 12px;
  margin: 8px 0;
  border: 2px solid #ddd;
  border-radius: 8px;
  font-size: 16px;
  box-sizing: border-box;
}

.signup-page.dark input,
.signup-page.dark .select-field {
  background: #1a1a1a;
  color: white;
  border-color: #444;
}

input:focus,
.select-field:focus {
  outline: none;
  border-color: #4f46e5;
}

.signup-page.dark input:focus,
.signup-page.dark .select-field:focus {
  border-color: #8b5cf6;
}

.input-group {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.tags-section {
  margin: 20px 0;
}

.tags-section label {
  display: block;
  margin-bottom: 10px;
  font-weight: bold;
}

.tags-input {
  display: flex;
  gap: 8px;
  margin-bottom: 10px;
}

.tags-input input {
  flex: 1;
  margin: 0;
}

.add-tag-btn {
  padding: 0 15px;
  background: #4f46e5;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

  .tag {
    background: #e0e7ff;
    color: #4f46e5;
    padding: 6px 6px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 14px;
  }

.signup-page.dark .tag {
  background: #3730a3;
  color: #e0e7ff;
}

.remove-tag {
  background: #ef4444;
  color: white;
  border: none;
  margin-bottom: 10px;
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 12px;
}

.signup-btn {
  padding: 15px 40px;
  background-color: #10b981;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.3s ease;
  margin-bottom: 15px;
}

.signup-btn:hover:not(:disabled) {
  background-color: #059669;
}

.signup-btn:disabled {
  background-color: #9ca3af;
  cursor: not-allowed;
}

.password-error {
  color: #ef4444;
  margin-bottom: 15px;
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
  text-decoration: underline;
  cursor: pointer;
}

.signup-page.dark .login-link {
  color: #8b5cf6;
}

.error-message {
  background-color: #fee2e2;
  border: 1px solid #fecaca;
  color: #dc2626;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
  max-width: 600px;
  width: 100%;
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
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
  max-width: 600px;
  width: 100%;
}

.signup-page.dark .success-message {
  background-color: #064e3b;
  border-color: #047857;
  color: #6ee7b7;
}

.loading {
  color: #4f46e5;
  margin-bottom: 15px;
  font-size: 16px;
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

/* Responsividade */
@media (max-width: 768px) {
  .form-container {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .signup-page {
    padding: 15px;
  }

  .logo {
    width: 200px;
  }

  .signup-text {
    font-size: 28px;
  }
}

@media (max-width: 480px) {
  .input-group {
    grid-template-columns: 1fr;
  }

  .form-section {
    padding: 15px;
  }
}
</style>