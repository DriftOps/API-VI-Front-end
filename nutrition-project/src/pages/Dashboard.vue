<template>
  <div class="dashboard">
    <div class="top-bar">
      <h1>Meu Painel Nutricional</h1>
      <div class="user-info">
        <span>Olá, {{ user?.name }}!</span> <!-- ✅ Safe navigation -->
        <button @click="logout" class="logout-btn">Sair</button>
        <button class="theme-toggle" :class="{ dark: darkMode }" @click="toggleTheme">
          <div class="circle"></div>
          <span class="sun">☀️</span>
          <span class="moon">🌙</span>
        </button>
      </div>
    </div>

    <div v-if="loading" class="loading">Carregando...</div>
    <div v-if="error" class="error-message">{{ error }}</div>

    <div v-else class="user-cards">
      <!-- Dados Pessoais -->
      <div class="card">
        <label>Objetivo</label>
        <select v-model="userData.goal">
          <option value="">Selecione</option>
          <option value="LOSE_WEIGHT">Perder peso rápido</option>
          <option value="LOSE_FAT">Reduzir gordura corporal</option>
          <option value="GAIN_WEIGHT">Ganhar peso saudável</option>
          <option value="BUILD_MUSCLE">Aumentar massa magra</option>
          <option value="IMPROVE_ENDURANCE">Melhorar resistência física</option>
          <option value="IMPROVE_STRENGTH">Aumentar força muscular</option>
          <option value="MAINTAIN_WEIGHT">Manter peso ideal</option>
        </select>
      </div>

      <!-- Peso -->
      <div class="card">
        <label>Peso (kg)</label>
        <input type="number" v-model.number="userData.weight" step="0.1" />
      </div>

      <!-- Altura -->
      <div class="card">
        <label>Altura (cm)</label>
        <input type="number" v-model.number="userData.height" />
      </div>

      <!-- Data de Nascimento -->
      <div class="card">
        <label>Data de Nascimento</label>
        <input type="date" v-model="userData.birthDate" />
        <small v-if="userData.birthDate">Idade: {{ calculateAge }} anos</small>
      </div>

      <!-- Atividade -->
      <div class="card">
        <label>Nível de Atividade</label>
        <select v-model="userData.activityLevel">
          <option value="">Selecione</option>
          <option value="SEDENTARY">Sedentário</option>
          <option value="LIGHT">Leve</option>
          <option value="MODERATE">Moderado</option>
          <option value="ACTIVE">Ativo</option>
          <option value="VERY_ACTIVE">Muito Ativo</option>
        </select>
      </div>

      <!-- IMC -->
      <div class="card highlight">
        <label>IMC</label>
        <p class="imc">{{ imc }} <span>({{ imcCategory }})</span></p>
        <small>Peso: {{ userData.weight || 0 }}kg | Altura: {{ userData.height || 0 }}cm</small>
      </div>

      <!-- Preferências Alimentares -->
      <div class="card preferences">
        <label>Preferências Alimentares</label>
        <div class="tags">
          <span v-for="(pref, index) in userData.dietaryPreferences" :key="index" class="tag">
            {{ pref }}
            <button @click="removePreference(index)">×</button>
          </span>
        </div>
        <div class="add-input">
          <input v-model="newPreference" placeholder="Nova preferência" @keyup.enter="addPreference" />
          <button @click="addPreference" class="add-btn-small">+</button>
        </div>
      </div>

      <!-- Restrições Alimentares -->
      <div class="card preferences">
        <label>Restrições Alimentares</label>
        <div class="tags">
          <span v-for="(restriction, index) in userData.restrictions" :key="index" class="tag">
            {{ restriction }}
            <button @click="removeRestriction(index)">×</button>
          </span>
        </div>
        <div class="add-input">
          <input v-model="newRestriction" placeholder="Nova restrição" @keyup.enter="addRestriction" />
          <button @click="addRestriction" class="add-btn-small">+</button>
        </div>
      </div>

      <!-- Plano Alimentar -->
      <div class="card full">
        <label>Plano Alimentar</label>
        <textarea v-model="userData.plan" placeholder="Descreva seu plano alimentar..." rows="4"></textarea>
      </div>

      <!-- Ações -->
      <div class="card actions">
        <button @click="saveUser" :disabled="saving" class="save-btn">
          {{ saving ? 'Salvando...' : 'Salvar Alterações' }}
        </button>
        <button @click="resetForm" class="reset-btn">Cancelar</button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "../stores/user";
import { fetchCurrentUser, updateUser } from "../api/user";
import type { User, UserUpdateDTO } from "../types/user";

export default defineComponent({
  name: 'Dashboard',
  setup() {
    const router = useRouter();
    const userStore = useUserStore();

    const loading = ref(true);
    const saving = ref(false);
    const error = ref("");
    const darkMode = ref(localStorage.getItem("theme") === "dark");

    const newPreference = ref("");
    const newRestriction = ref("");

    // Inicializar com arrays vazios para evitar undefined
    const userData = ref<UserUpdateDTO>({
      goal: "",
      weight: undefined,
      height: undefined,
      birthDate: "",
      activityLevel: "",
      dietaryPreferences: [],
      restrictions: [],
      plan: ""
    });

    // Safe navigation para user
    const user = computed(() => userStore.user);

    // Carregar dados do usuário
    const loadUser = async () => {
      try {
        loading.value = true;
        const userResponse = await fetchCurrentUser();

        // Adicionar token do localStorage ao user
        const token = localStorage.getItem('token');
        const userWithToken: User = {
          ...userResponse,
          token: token || '',
          plan: typeof userResponse.plan === 'string'
            ? userResponse.plan
            : (userResponse.plan ? JSON.stringify(userResponse.plan) : '')
        };

        userStore.setUser(userWithToken);

        // Preencher formulário com dados do usuário
        userData.value = {
          goal: userResponse.goal || "",
          weight: userResponse.weight || undefined,
          height: userResponse.height || undefined,
          birthDate: userResponse.birthDate || "",
          activityLevel: userResponse.activityLevel || "",
          dietaryPreferences: userResponse.dietaryPreferences || [],
          restrictions: userResponse.restrictions || [],
          plan: String(userResponse.plan || "")
        };
      } catch (err) {
        error.value = "Erro ao carregar dados do usuário";
        console.error(err);
      } finally {
        loading.value = false;
      }
    };

    // Calcular idade a partir da data de nascimento
    const calculateAge = computed(() => {
      if (!userData.value.birthDate) return 0;
      const birthDate = new Date(userData.value.birthDate);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return age;
    });

    // Calcular IMC
    const imc = computed(() => {
      if (!userData.value.weight || !userData.value.height) return "—";
      const heightInMeters = userData.value.height / 100;
      return (userData.value.weight / (heightInMeters * heightInMeters)).toFixed(1);
    });

    const imcCategory = computed(() => {
      const value = parseFloat(imc.value);
      if (isNaN(value)) return "—";
      if (value < 18.5) return "Abaixo do peso";
      if (value < 24.9) return "Peso normal";
      if (value < 29.9) return "Sobrepeso";
      return "Obesidade";
    });

    // Métodos com verificação de array
    const addPreference = () => {
      if (newPreference.value.trim()) {
        if (!userData.value.dietaryPreferences) {
          userData.value.dietaryPreferences = [];
        }
        userData.value.dietaryPreferences.push(newPreference.value.trim());
        newPreference.value = "";
      }
    };

    const removePreference = (index: number) => {
      if (userData.value.dietaryPreferences) {
        userData.value.dietaryPreferences.splice(index, 1);
      }
    };

    const addRestriction = () => {
      if (newRestriction.value.trim()) {
        if (!userData.value.restrictions) {
          userData.value.restrictions = [];
        }
        userData.value.restrictions.push(newRestriction.value.trim());
        newRestriction.value = "";
      }
    };

    const removeRestriction = (index: number) => {
      if (userData.value.restrictions) {
        userData.value.restrictions.splice(index, 1);
      }
    };

    // Salvar dados
    const saveUser = async () => {
      try {
        saving.value = true;
        const updatedUser = await updateUser(userData.value);

        // Adicionar token ao user atualizado
        const token = localStorage.getItem('token');
        const userWithToken: User = {
          ...updatedUser,
          token: token || ''
        };

        userStore.setUser(userWithToken);
        error.value = "";
        alert("Dados salvos com sucesso!");
      } catch (err) {
        error.value = "Erro ao salvar dados";
        console.error(err);
      } finally {
        saving.value = false;
      }
    };

    const resetForm = () => {
      loadUser();
    };

    const logout = () => {
      userStore.clearUser();
      router.push("/");
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

    onMounted(() => {
      applyTheme();
      loadUser();
    });

    return {
      user,
      userData,
      loading,
      saving,
      error,
      darkMode,
      newPreference,
      newRestriction,
      calculateAge,
      imc,
      imcCategory,
      addPreference,
      removePreference,
      addRestriction,
      removeRestriction,
      saveUser,
      resetForm,
      logout,
      toggleTheme,
    };
  },
});
</script>

<style scoped>
* {
  transition: background 0.3s, color 0.3s, border-color 0.3s;
}

.dashboard {
  width: 100vw; /* ✅ Mudar para 100vw */
  min-height: 100vh;
  padding: 20px; /* ✅ Reduzir padding */
  box-sizing: border-box;
  font-family: "Segoe UI", sans-serif;
  background: var(--color-background);
  color: var(--color-text);
  overflow-x: hidden; /* ✅ Prevenir scroll horizontal */
}

.user-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); /* ✅ Ajustar minmax */
  gap: 20px;
  max-width: 100%; /* ✅ Limitar largura máxima */
  box-sizing: border-box;
}

.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  flex-wrap: wrap; /* ✅ Permitir quebra de linha */
  gap: 15px; /* ✅ Espaço entre elementos */
}

.user-info {
  display: flex;
  align-items: center;
  gap: 15px;
  flex-wrap: wrap; /* ✅ Permitir quebra */
}

h1 {
  margin-bottom: 30px;
  font-size: 28px;
  color: var(--color-text);
  text-align: left; /* ✅ Alinhar à esquerda */
}

/* Botão switch */
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

.logout-btn {
  padding: 8px 16px;
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  white-space: nowrap; /* ✅ Evitar quebra de texto */
}

.logout-btn:hover {
  background: #c82333;
}

.card {
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  color: var(--color-text);
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  padding: 20px;
  display: flex;
  flex-direction: column;
  transition: transform 0.2s, background 0.3s, color 0.3s;
  min-width: 0; /* ✅ Importante para grid */
}

.card:hover {
  transform: scale(1.02);
}

.card label {
  font-weight: bold;
  margin-bottom: 8px;
  color: var(--color-heading);
}

.card input,
.card select,
.card textarea {
  padding: 10px;
  border-radius: 10px;
  font-size: 15px;
  background: var(--card-bg);
  color: var(--color-text);
  border: 1px solid var(--card-border);
  outline: none;
  width: 100%; /* ✅ Garantir largura total */
  box-sizing: border-box; /* ✅ Incluir padding na largura */
}

.card textarea {
  min-height: 100px;
  resize: vertical;
}

/* ✅ CORREÇÃO: Ajustar cards full para telas menores */
.full {
  grid-column: 1 / -1; /* ✅ Ocupar todas as colunas */
}

@media (max-width: 768px) {
  .full {
    grid-column: 1; /* ✅ Em mobile, ocupar apenas uma coluna */
  }
}

.highlight {
  background: var(--highlight-bg, #eafaf1);
  border: 1px solid var(--highlight-border, #28a745);
}

.imc {
  font-size: 22px;
  font-weight: bold;
  color: var(--highlight-border, #28a745);
}

.preferences .tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 8px;
}

.preferences .tag {
  padding: 5px 10px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  gap: 6px;
  background: var(--card-bg);
  color: var(--color-text);
  font-size: 14px;
}

.dark .preferences .tag {
  background: var(--highlight-bg);
}

.preferences .tag button {
  background: #c92a2a;
  color: #fff;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  padding: 0;
  border: none;
  cursor: pointer;
  transition: background 0.2s;
}

.preferences .tag button:hover {
  background: #a61e1e;
}

.add-input {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.add-btn-small {
  padding: 8px 12px;
  background: #28a745;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  white-space: nowrap;
}

.actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap; /* ✅ Permitir quebra */
}

.save-btn {
  padding: 12px 24px;
  border-radius: 10px;
  border: none;
  background: var(--save-btn-bg, #2c3e50);
  color: white;
  font-weight: bold;
  font-size: 16px;
  cursor: pointer;
  transition: background 0.3s;
  flex: 1; /* ✅ Ocupar espaço disponível */
  min-width: 150px; /* ✅ Largura mínima */
}

.save-btn:hover {
  background: var(--save-btn-hover, #1a252f);
  transform: scale(1.03);
}

.save-btn:disabled {
  background: #6c757d;
  cursor: not-allowed;
  transform: none;
}

.reset-btn {
  padding: 12px 24px;
  background: #6c757d;
  color: white;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  flex: 1; /* ✅ Ocupar espaço disponível */
  min-width: 150px; /* ✅ Largura mínima */
}

.reset-btn:hover {
  background: #545b62;
}

/* ✅ Media Queries para responsividade */
@media (max-width: 1200px) {
  .user-cards {
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  }
}

@media (max-width: 768px) {
  .dashboard {
    padding: 15px; /* ✅ Reduzir padding em mobile */
  }
  
  .top-bar {
    flex-direction: column; /* ✅ Empilhar verticalmente */
    align-items: flex-start;
  }
  
  .user-info {
    width: 100%;
    justify-content: space-between;
  }
  
  .user-cards {
    grid-template-columns: 1fr; /* ✅ Uma coluna em mobile */
    gap: 15px;
  }
  
  h1 {
    font-size: 24px; /* ✅ Reduzir tamanho da fonte */
    text-align: center; /* ✅ Centralizar em mobile */
  }
}

@media (max-width: 480px) {
  .dashboard {
    padding: 10px;
  }
  
  .card {
    padding: 15px;
  }
  
  .actions {
    flex-direction: column; /* ✅ Empilhar botões */
  }
  
  .save-btn, .reset-btn {
    min-width: 100%; /* ✅ Largura total em mobile */
  }
}

.loading {
  text-align: center;
  padding: 20px;
  font-size: 18px;
  color: var(--color-text);
}

.error-message {
  background-color: #fee;
  border: 1px solid #fcc;
  color: #c33;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
  text-align: center;
}

.dark .error-message {
  background-color: #322;
  border-color: #633;
  color: #f99;
}
</style>