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

    <form class="form-container" @submit.prevent="handleSubmit">
      <!-- Etapa 1: Dados da conta -->
      <div v-if="currentStep === 1" class="form-section">
        <h3>Dados da Conta</h3>
        <input v-model="formData.name" placeholder="Nome completo" type="text" required />
        <input v-model="formData.email" placeholder="Email" type="email" required />
        <input v-model="formData.password" type="password" placeholder="Senha" required />
        <input v-model="confirmPassword" type="password" placeholder="Confirmar senha" required />

        <div class="input-group">
          <input v-model.number="formData.weight" type="number" placeholder="Peso (kg)" step="0.1" />
          <input v-model.number="formData.height" type="number" placeholder="Altura (cm)" />
        </div>

        <input v-model="formData.birthDate" type="date" placeholder="Data de nascimento" />

        <div class="button-group-single">
          <button type="button" @click="nextStep" :disabled="!canGoNextStep1" class="signup-btn">
            Próximo
          </button>
        </div>

        <p v-if="!passwordsMatch" class="password-error">As senhas não coincidem</p>
      </div>

      <!-- Etapa 2: Anamnese completa -->
      <div v-if="currentStep === 2" class="form-section anamnese-section">
        <!-- Seção: Dados pessoais ampliados -->
        <h3>Idade, Data de Nascimento, Sexo, Profissão</h3>
        <div class="input-group">
          <input v-model.number="formData.age" type="number" placeholder="Idade" />
          <input v-model="formData.profession" placeholder="Profissão" type="text" />
        </div>

        <div class="row">
          <label class="section-label">Sexo</label>
          <div class="radio-group">
            <label><input type="radio" value="Feminino" v-model="formData.sex" /> Feminino</label>
            <label><input type="radio" value="Masculino" v-model="formData.sex" /> Masculino</label>
            <label><input type="radio" value="Outro" v-model="formData.sex" /> Outro</label>
            <label><input type="radio" value="Prefiro não dizer" v-model="formData.sex" /> Prefiro não dizer</label>
          </div>
        </div>


        <!-- Texto introdutório -->
        <p class="intro-text">Aqui vamos conhecer um pouco mais sobre sua saúde!</p>

        <!-- Motivo da consulta (radio - único) -->
        <div class="section">
          <label class="section-label">Qual o principal motivo da sua consulta? *</label>
          <div class="radio-grid">
            <label><input type="radio" value="Emagrecimento" v-model="formData.mainReason" /> Emagrecimento</label>
            <label><input type="radio" value="Ganho de massa muscular" v-model="formData.mainReason" /> Ganho de massa muscular</label>
            <label><input type="radio" value="Controle de diabetes" v-model="formData.mainReason" /> Controle de diabetes</label>
            <label><input type="radio" value="Reeducação alimentar" v-model="formData.mainReason" /> Reeducação alimentar</label>
            <label><input type="radio" value="Performance física e mental" v-model="formData.mainReason" /> Performance física e mental</label>
          </div>
        </div>

        <!-- Condições de saúde (checkboxes) -->
        <div class="section">
          <label class="section-label">Você possui ou já teve alguma das condições abaixo? *</label>
          <div class="checkbox-grid">
            <label v-for="c in healthConditions" :key="c">
              <input type="checkbox" :value="c" v-model="formData.healthConditions" /> {{ c }}
            </label>
          </div>
          <input v-model="formData.healthConditionsOther" placeholder="Outro:" />
        </div>

        <!-- Alergias / intolerâncias -->
        <div class="section">
          <label class="section-label">Possui alguma alergia ou intolerância? *</label>
          <div class="checkbox-grid">
            <label v-for="a in allergiesOptions" :key="a">
              <input type="checkbox" :value="a" v-model="formData.allergies" /> {{ a }}
            </label>
          </div>
          <input v-model="formData.allergiesOther" placeholder="Outro:" />
        </div>

        <!-- Cirurgias -->
        <div class="section">
          <label class="section-label">Você já realizou alguma cirurgia? *</label>
          <div class="checkbox-grid">
            <label v-for="s in surgeriesOptions" :key="s">
              <input type="checkbox" :value="s" v-model="formData.surgeries" /> {{ s }}
            </label>
          </div>
          <input v-model="formData.surgeriesOther" placeholder="Outro:" />
        </div>

        <!-- Atividade física -->
        <div class="section">
          <label class="section-label">Atividade física — Agora vamos entender seus hábitos</label>
          <p class="muted">Qual atividade mais te descreve? *</p>
          <div class="radio-grid">
            <label v-for="a in activityOptions" :key="a">
              <input type="radio" :value="a" v-model="formData.activityType" /> {{ a }}
            </label>
          </div>

          <p class="muted">Frequência</p>
          <div class="radio-group">
            <label><input type="radio" value="Nenhuma vez por semana" v-model="formData.activityFrequency" /> Nenhuma vez por semana</label>
            <label><input type="radio" value="1-2x por semana" v-model="formData.activityFrequency" /> 1-2x por semana</label>
            <label><input type="radio" value="3-4x por semana" v-model="formData.activityFrequency" /> 3-4x por semana</label>
            <label><input type="radio" value="5 ou mais vezes por semana" v-model="formData.activityFrequency" /> 5 ou mais vezes por semana</label>
          </div>

          <p class="muted">Quantos minutos por dia de Atividade física?</p>
          <div class="radio-group">
            <label><input type="radio" value="Nenhum Minuto" v-model="formData.activityMinutes" /> Nenhum Minuto</label>
            <label><input type="radio" value="30 min" v-model="formData.activityMinutes" /> 30 min</label>
            <label><input type="radio" value="60 min" v-model="formData.activityMinutes" /> 60 min</label>
            <label><input type="radio" value="90 min" v-model="formData.activityMinutes" /> 90 min</label>
          </div>
        </div>

        <!-- Sono -->
        <div class="section">
          <label class="section-label">Como está seu sono — Me conte como você está dormindo, vai ajudar muito no seu
            planejamento</label>

          <p class="muted">Qualidade do sono *</p>
          <div class="radio-group">
            <label><input type="radio" value="Boa" v-model="formData.sleepQuality" /> Boa</label>
            <label><input type="radio" value="Regular" v-model="formData.sleepQuality" /> Regular</label>
            <label><input type="radio" value="Ruim" v-model="formData.sleepQuality" /> Ruim</label>
          </div>

          <p class="muted">Acorda durante a noite? *</p>
          <div class="radio-group">
            <label><input type="radio" value="Não" v-model="formData.wakesAtNight" /> Não</label>
            <label><input type="radio" value="Pelo menos 1x" v-model="formData.wakesAtNight" /> Pelo menos 1 x</label>
            <label><input type="radio" value="Mais que 1x por noite" v-model="formData.wakesAtNight" /> Mais que 1 x por noite</label>
          </div>
        </div>

        <!-- Evacuação / rotina -->
        <div class="section">
          <label class="section-label">Entender como é sua rotina vai ser valioso nesse processo</label>

          <p class="muted">Quantas vezes por semana você evacua? *</p>
          <div class="radio-group">
            <label><input type="radio" value="Todo dia" v-model="formData.bowelFrequency" /> Todo dia</label>
            <label><input type="radio" value="5 x por semana" v-model="formData.bowelFrequency" /> 5 x por semana</label>
            <label><input type="radio" value="3 x por semana" v-model="formData.bowelFrequency" /> 3 x por semana</label>
            <label><input type="radio" value="1 x por semana" v-model="formData.bowelFrequency" /> 1 x por semana</label>
          </div>
        </div>

        <!-- Estresse / álcool / tabagismo / hidratação -->
        <div class="section">
          <label class="section-label">Vamos aprofundar um pouco sobre você!</label>

          <p class="muted">Estresse *</p>
          <div class="radio-group">
            <label><input type="radio" value="Baixo" v-model="formData.stressLevel" /> Baixo</label>
            <label><input type="radio" value="Moderado" v-model="formData.stressLevel" /> Moderado</label>
            <label><input type="radio" value="Alto" v-model="formData.stressLevel" /> Alto</label>
          </div>

          <p class="muted">Consumo de álcool *</p>
          <div class="radio-group">
            <label><input type="radio" value="Não consome" v-model="formData.alcohol" /> Não consome</label>
            <label><input type="radio" value="Socialmente 1-2 x por semana" v-model="formData.alcohol" /> Socialmente 1-2 x por semana</label>
            <label><input type="radio" value="Frequente 3-4 x por semana" v-model="formData.alcohol" /> Frequente 3-4 x por semana</label>
            <label><input type="radio" value="Uso diário" v-model="formData.alcohol" /> Uso diário</label>
          </div>

          <p class="muted">Tabagismo *</p>
          <div class="radio-group">
            <label><input type="radio" value="Sim" v-model="formData.smoking" /> Sim</label>
            <label><input type="radio" value="Não" v-model="formData.smoking" /> Não</label>
          </div>

          <p class="muted">Hidratação (quantos litros por dia) *</p>
          <div class="radio-group">
            <label><input type="radio" value="Menos de 1L" v-model="formData.hydration" /> Menos de 1L</label>
            <label><input type="radio" value="Entre 1L e 2L" v-model="formData.hydration" /> Entre 1L e 2L</label>
            <label><input type="radio" value="Mais de 2L" v-model="formData.hydration" /> Mais de 2L</label>
          </div>
        </div>

        <!-- Medicações -->
        <div class="section">
          <label class="section-label">Lembre de tudo, inclusive suplementos.</label>
          <p class="muted">Faz uso de medicações contínuas? *</p>
          <div class="radio-group">
            <label><input type="radio" value="Sim" v-model="formData.continuousMedication" /> Sim</label>
            <label><input type="radio" value="Não" v-model="formData.continuousMedication" /> Não</label>
          </div>
        </div>

        <!-- Botões de navegação -->
        <div class="button-group">
          <button type="button" @click="prevStep" class="signup-btn secondary-btn">Voltar</button>
          <button type="button" @click="signup" :disabled="loading" class="signup-btn">
            {{ loading ? 'Criando conta...' : 'Concluir Cadastro' }}
          </button>
        </div>
      </div>
    </form>

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

export default defineComponent({
  name: "Signup",
  components: { SunIcon, MoonIcon },
  setup() {
    const router = useRouter();
    const currentStep = ref(1);

    // Form data - inclui todos os campos de anamnese
    const formData = ref({
      // Conta
      name: "",
      email: "",
      password: "",

      // Dados básicos/anamnese
      age: undefined as number | undefined,
      birthDate: "",
      sex: "",
      profession: "",
      weight: undefined as number | undefined,
      height: undefined as number | undefined,

      // Motivo
      mainReason: "",

      // Condições
      healthConditions: [] as string[],
      healthConditionsOther: "",

      // Alergias
      allergies: [] as string[],
      allergiesOther: "",

      // Cirurgias
      surgeries: [] as string[],
      surgeriesOther: "",

      // Atividade física
      activityType: "",
      activityFrequency: "",
      activityMinutes: "",

      // Sono
      sleepQuality: "",
      wakesAtNight: "",

      // Rotina / evacuação
      bowelFrequency: "",

      // Estresse / álcool / tabagismo / hidratação
      stressLevel: "",
      alcohol: "",
      smoking: "",
      hydration: "",

      // Medicações
      continuousMedication: "",
      medicationList: "",

      // Objetivo e nível de atividade (mantive campos anteriores)
      goal: "",
      activityLevel: "",
      dietaryPreferences: [] as string[],
      restrictions: [] as string[],
    });

    const confirmPassword = ref("");
    const newPreference = ref("");
    const newRestriction = ref("");
    const loading = ref(false);
    const errorMessage = ref("");
    const successMessage = ref("");
    const darkMode = ref(localStorage.getItem("theme") === "dark");

    const API_URL = "http://localhost:8080/api";

    // Opções usadas na UI
    const healthConditions = [
      "Diabetes tipo 1",
      "Diabetes tipo 2",
      "Hipertensão arterial",
      "Dislipidemia (colesterol, triglicerídeos)",
      "Doença renal",
      "Doença hepática",
      "Gastrite / refluxo",
      "intestino preso / diarreia",
      "Osteoporose",
      "Doença cardiovascular (infarto, insuficiência cardíaca)",
      "Câncer",
      "Depressão / Ansiedade",
      "Doenças autoimunes",
    ];

    const allergiesOptions = [
      "Não",
      "Intolerância à lactose",
      "Sensibilidade ao glúten / doença celíaca",
      "Alergia alimentar",
      "Alergia medicamentosa",
    ];

    const surgeriesOptions = [
      "Bariátrica",
      "Vesícula",
      "Hérnia de hiato (cirurgia do refluxo)",
      "Ortopédica",
      "Cesárea / Ginecológica",
    ];

    const activityOptions = ["Sedentário(a)", "Caminhada", "Musculação", "Corrida", "Crossfit", "Natação", "Outro"];

    // Computed
    const passwordsMatch = computed(
      () => formData.value.password === confirmPassword.value && formData.value.password.length > 0
    );

    const canGoNextStep1 = computed(() => {
      return !!formData.value.name && !!formData.value.email && passwordsMatch.value;
    });

    // Preference / restriction tag helpers (mantive para compatibilidade)
    const addPreference = () => {
      if (newPreference.value.trim() && !formData.value.dietaryPreferences.includes(newPreference.value.trim())) {
        formData.value.dietaryPreferences.push(newPreference.value.trim());
        newPreference.value = "";
      }
    };
    const removePreference = (index: number) => formData.value.dietaryPreferences.splice(index, 1);

    const addRestriction = () => {
      if (newRestriction.value.trim() && !formData.value.restrictions.includes(newRestriction.value.trim())) {
        formData.value.restrictions.push(newRestriction.value.trim());
        newRestriction.value = "";
      }
    };
    const removeRestriction = (index: number) => formData.value.restrictions.splice(index, 1);

    const nextStep = () => {
      if (!canGoNextStep1.value) {
        errorMessage.value = "Preencha todos os campos obrigatórios (nome, email e senha) corretamente antes de prosseguir.";
        return;
      }
      errorMessage.value = "";
      currentStep.value = 2;
      // scroll to top of form if needed
      window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const prevStep = () => {
      errorMessage.value = "";
      currentStep.value = 1;
      window.scrollTo({ top: 0, behavior: "smooth" });
    };

    // Envio final (POST com todo o formData)
    const signup = async () => {
      // Example minimal validation for some required anamnese fields (you can expand)
      if (!formData.value.mainReason) {
        errorMessage.value = "Por favor, selecione o principal motivo da sua consulta.";
        return;
      }
      loading.value = true;
      errorMessage.value = "";
      successMessage.value = "";

      try {
        // preparar payload (se quiser renomear campos para backend, faça aqui)
        const payload = { ...formData.value };

        const response = await fetch(`${API_URL}/users/signup`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || "Erro ao criar conta");
        }

        const userData: SignupResponse = await response.json();
        successMessage.value = "Conta criada com sucesso! Aguarde a aprovação do administrador.";

        // redirecionar após curto delay
        setTimeout(() => router.push("/login"), 3000);
      } catch (error: any) {
        console.error("Erro no signup:", error);
        errorMessage.value = error.message || "Erro ao criar conta.";
      } finally {
        loading.value = false;
      }
    };

    // handler usado pelo form submit para evitar envio de formulário padrão
    const handleSubmit = () => {
      if (currentStep.value === 1) {
        nextStep();
      } else {
        signup();
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
      healthConditions,
      allergiesOptions,
      surgeriesOptions,
      activityOptions,
      canGoNextStep1,
      handleSubmit,
    };
  },
});
</script>

<style scoped>
/* Mantém TODO o estilo original e adiciona estilos para as novas seções */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap');

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
  font-family: 'Inter', sans-serif;
}

/* Barra de progresso */
.progress-bar-container {
  width: 80%;
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
  grid-template-columns: 1fr;
  gap: 20px;
  max-width: 980px;
  width: 100%;
  margin-bottom: 30px;
}

/* mantendo aparência de "cards" para cada seção */
.form-section {
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
}

.signup-page.dark .form-section {
  background: #2a2a2a;
  color: white;
}

.form-section h3 {
  margin-bottom: 18px;
  color: #4f46e5;
  border-bottom: 2px solid #4f46e5;
  padding-bottom: 10px;
}

.signup-page.dark .form-section h3 {
  color: #8b5cf6;
  border-color: #8b5cf6;
}

.input-group {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

input,
select,
textarea {
  
  padding: 12px;
  margin: 8px 0;
  border: 2px solid #ddd;
  border-radius: 8px;
  font-size: 15px;
  box-sizing: border-box;
  resize: vertical;
}

textarea {
  min-height: 80px;
}

.signup-page.dark input,
.signup-page.dark .select-field,
.signup-page.dark textarea {
  background: #1a1a1a;
  color: white;
  border-color: #444;
}

input:focus,
.select-field:focus,
textarea:focus {
  outline: none;
  border-color: #4f46e5;
}

.signup-page.dark input:focus,
.signup-page.dark .select-field:focus,
.signup-page.dark textarea:focus {
  border-color: #8b5cf6;
}

/* Tags / lista */
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

/* Estilos específicos para anamnese */
.section {
  margin-top: 12px;
  margin-bottom: 12px;
  padding-top: 6px;
  padding-bottom: 6px;
  border-top: 1px dashed rgba(0,0,0,0.04);
}

.anamnese-section .section:first-of-type {
  border-top: none;
}

.section-label {
  font-weight: 600;
  color: #374151;
  display: block;
  margin-bottom: 8px;
}

.signup-page.dark .section-label {
  color: #d1d5db;
}

.radio-group,
.checkbox-grid,
.radio-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.radio-grid label,
.checkbox-grid label,
.radio-group label {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(79,70,229,0.05);
  padding: 8px 10px;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
}

.signup-page.dark .radio-grid label,
.signup-page.dark .checkbox-grid label,
.signup-page.dark .radio-group label {
  background: rgba(139,92,246,0.06);
}

.muted {
  color: #6b7280;
  margin: 6px 0;
  font-size: 14px;
}

.signup-page.dark .muted {
  color: #9ca3af;
}

.password-error {
  color: #ef4444;
  margin-top: 8px;
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
@media (max-width: 1024px) {
  .input-group {
    grid-template-columns: 1fr;
  }
  .radio-grid,
  .checkbox-grid,
  .radio-group {
    flex-direction: column;
  }
}

@media (max-width: 768px) {
  .form-section {
    padding: 18px;
  }
  .signup-text {
    font-size: 28px;
  }
}

@media (max-width: 480px) {
  .signup-page {
    padding: 15px;
  }
}
</style>

