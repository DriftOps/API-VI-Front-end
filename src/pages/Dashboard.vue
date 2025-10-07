<template>
  <DashboardLayout>
    <div class="dashboard-content">
      <div class="content-header">
        <h1>
          <BarChart3Icon :size="24" class="header-icon" />
          {{ currentPageTitle }}
        </h1>
        <div class="header-actions">
          <span class="welcome-text">Olá, {{ user?.name }}!</span>
          <span class="user-role-badge">{{ user?.role }}</span>
        </div>
      </div>

      <div class="content-area">
        <div v-if="loading" class="loading">Carregando...</div>
        <div v-if="error" class="error-message">{{ error }}</div>

        <div v-else class="user-cards">
          <!-- Dados Pessoais -->
          <div class="card">
            <label class="card-label">
              <TargetIcon :size="16" class="label-icon" />
              Objetivo
            </label>
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
            <label class="card-label">
              <ScaleIcon :size="16" class="label-icon" />
              Peso (kg)
            </label>
            <input type="number" v-model.number="userData.weight" step="0.1" />
          </div>

          <!-- Altura -->
          <div class="card">
            <label class="card-label">
              <RulerIcon :size="16" class="label-icon" />
              Altura (cm)
            </label>
            <input type="number" v-model.number="userData.height" />
          </div>

          <!-- Data de Nascimento -->
          <div class="card">
            <label class="card-label">
              <CalendarIcon :size="16" class="label-icon" />
              Data de Nascimento
            </label>
            <input type="date" v-model="userData.birthDate" />
            <small v-if="userData.birthDate" class="age-text">
              <CalendarDaysIcon :size="12" />
              Idade: {{ calculateAge }} anos
            </small>
          </div>

          <!-- Atividade -->
          <div class="card">
            <label class="card-label">
              <ActivityIcon :size="16" class="label-icon" />
              Nível de Atividade
            </label>
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
            <label class="card-label">
              <HeartPulseIcon :size="16" class="label-icon" />
              IMC
            </label>
            <p class="imc">{{ imc }} <span class="imc-category">({{ imcCategory }})</span></p>
            <small class="imc-details">
              <ScaleIcon :size="14" />
              Peso: {{ userData.weight || 0 }}kg |
              <RulerIcon :size="14" />
              Altura: {{ userData.height || 0 }}cm
            </small>
          </div>

          <!-- Preferências Alimentares -->
          <div class="card preferences">
            <label class="card-label">
              <AppleIcon :size="16" class="label-icon" />
              Preferências Alimentares
            </label>
            <div class="tags">
              <span v-for="(pref, index) in userData.dietaryPreferences" :key="index" class="tag">
                {{ pref }}
                <button @click="removePreference(index)" class="remove-tag">
                  <XIcon :size="12" />
                </button>
              </span>
            </div>
            <div class="add-input">
              <input v-model="newPreference" placeholder="Nova preferência" @keyup.enter="addPreference" />
              <button @click="addPreference" class="add-btn-small">
                <PlusIcon :size="16" />
              </button>
            </div>
          </div>

          <!-- Restrições Alimentares -->
          <div class="card preferences">
            <label class="card-label">
              <BanIcon :size="16" class="label-icon" />
              Restrições Alimentares
            </label>
            <div class="tags">
              <span v-for="(restriction, index) in userData.restrictions" :key="index" class="tag">
                {{ restriction }}
                <button @click="removeRestriction(index)" class="remove-tag">
                  <XIcon :size="12" />
                </button>
              </span>
            </div>
            <div class="add-input">
              <input v-model="newRestriction" placeholder="Nova restrição" @keyup.enter="addRestriction" />
              <button @click="addRestriction" class="add-btn-small">
                <PlusIcon :size="16" />
              </button>
            </div>
          </div>

          <!-- Plano Alimentar -->
          <div class="card full">
            <label class="card-label">
              <BookOpenIcon :size="16" class="label-icon" />
              Plano Alimentar
            </label>
            <textarea v-model="userData.plan" placeholder="Descreva seu plano alimentar..." rows="4"></textarea>
          </div>

          <!-- Ações -->
          <div class="card actions">
            <button @click="saveUser" :disabled="saving" class="save-btn">
              <SaveIcon v-if="!saving" :size="18" />
              {{ saving ? 'Salvando...' : 'Salvar Alterações' }}
            </button>
            <button @click="resetForm" class="reset-btn">
              <RotateCcwIcon :size="18" />
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useUserStore } from "../stores/user";
import { fetchCurrentUser, updateUser } from "../api/user";
import type { User as UserType, UserUpdateDTO } from "../types/user";
import DashboardLayout from '@/layouts/DashboardLayout.vue';

// ✅ Importar apenas os ícones que você usa no dashboard
import {
  BarChart3 as BarChart3Icon,
  Target as TargetIcon,
  Scale as ScaleIcon,
  Ruler as RulerIcon,
  Calendar as CalendarIcon,
  CalendarDays as CalendarDaysIcon,
  Activity as ActivityIcon,
  HeartPulse as HeartPulseIcon,
  Apple as AppleIcon,
  Ban as BanIcon,
  BookOpen as BookOpenIcon,
  Plus as PlusIcon,
  X as XIcon,
  Save as SaveIcon,
  RotateCcw as RotateCcwIcon
} from 'lucide-vue-next';

export default defineComponent({
  name: 'Dashboard',
  components: {
    DashboardLayout,
    BarChart3Icon,
    TargetIcon,
    ScaleIcon,
    RulerIcon,
    CalendarIcon,
    CalendarDaysIcon,
    ActivityIcon,
    HeartPulseIcon,
    AppleIcon,
    BanIcon,
    BookOpenIcon,
    PlusIcon,
    XIcon,
    SaveIcon,
    RotateCcwIcon
  },
  setup() {
    const route = useRoute();
    const userStore = useUserStore();

    const loading = ref(true);
    const saving = ref(false);
    const error = ref("");

    const newPreference = ref("");
    const newRestriction = ref("");

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

    const user = computed(() => userStore.user);

    const pageTitles: Record<string, string> = {
      '/dashboard': 'Meu Painel Nutricional',
      '/chat': 'Chat com Nutricionista', 
      '/perfil': 'Meu Perfil',
      '/admin/users': 'Gerenciar Usuários'
    };

    const currentPageTitle = computed(() => {
      return pageTitles[route.path] || 'Dashboard';
    });

    // Carregar dados
    const loadData = async () => {
      try {
        loading.value = true;
        const userResponse = await fetchCurrentUser();

        const token = localStorage.getItem('token');
        const userWithToken: UserType = {
          ...userResponse,
          token: token || '',
          plan: typeof userResponse.plan === 'string'
            ? userResponse.plan
            : (userResponse.plan ? JSON.stringify(userResponse.plan) : '')
        };

        userStore.setUser(userWithToken);

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

    // Métodos calculados
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

    const saveUser = async () => {
      try {
        saving.value = true;
        const updatedUser = await updateUser(userData.value);

        const token = localStorage.getItem('token');
        const userWithToken: UserType = {
          ...updatedUser,
          token: token || ''
        };

        userStore.setUser(userWithToken);
        error.value = "";
      } catch (err) {
        error.value = "Erro ao salvar dados";
        console.error(err);
      } finally {
        saving.value = false;
      }
    };

    const resetForm = () => {
      loadData();
    };

    onMounted(() => {
      loadData();
    });

    return {
      user,
      userData,
      loading,
      saving,
      error,
      newPreference,
      newRestriction,
      currentPageTitle,
      calculateAge,
      imc,
      imcCategory,
      addPreference,
      removePreference,
      addRestriction,
      removeRestriction,
      saveUser,
      resetForm
    };
  },
});
</script>

<style scoped>
.dashboard-content {
  width: 69vw;
}

.content-header {
  background: var(--card-bg);
  padding: 20px 30px;
  border-bottom: 1px solid var(--card-border);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.content-header h1 {
  margin: 0;
  font-size: 28px;
  color: var(--color-heading);
  display: flex;
  align-items: center;
  gap: 10px;
}

.header-icon {
  color: var(--primary-color);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 15px;
}

.welcome-text {
  font-size: 16px;
  color: var(--color-text);
}

.user-role-badge {
  background: var(--primary-color);
  color: white;
  padding: 4px 8px;
  border-radius: 10px;
  font-size: 12px;
  text-transform: uppercase;
}

.content-area {
  padding: 30px;
  min-height: calc(100vh - 80px);
}

/* Seus estilos existentes para os cards */
.user-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
}

.card {
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: 12px;
  padding: 24px;
  transition: all 0.3s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.card-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  margin-bottom: 12px;
  color: var(--color-heading);
  font-size: 14px;
}

.label-icon {
  color: var(--primary-color);
}

/* Estilos específicos para diferentes tipos de cards */
.card.highlight {
  background: linear-gradient(135deg, var(--primary-color) 0%, #554946 100%);
  color: white;
  border: none;
  box-shadow: 0 4px 15px rgba(79, 70, 229, 0.3);
}

.card.highlight .card-label,
.card.highlight .label-icon {
  color: white;
}

.card.preferences {
  grid-column: span 2;
}

.card.full {
  grid-column: 1 / -1;
}

.card.actions {
  grid-column: 1 / -1;
  display: flex;
  gap: 15px;
  justify-content: flex-end;
}

/* Inputs e selects */
input, select, textarea {
  width: 100%;
  padding: 12px;
  border: 2px solid var(--input-border);
  border-radius: 8px;
  background: var(--input-bg);
  color: var(--input-text);
  font-size: 14px;
  transition: all 0.2s ease;
  font-family: inherit;
}

input::placeholder, textarea::placeholder {
  color: var(--input-placeholder);
}

input:focus, select:focus, textarea:focus {
  outline: none;
  border-color: var(--input-focus-border);
  box-shadow: 0 0 0 3px var(--input-focus-ring);
}

select {
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  background-size: 16px;
  padding-right: 40px;
}

/* Tags */
.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}

.tag {
  background: var(--primary-color);
  color: white;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.tag:hover {
  background: var(--primary-hover);
  transform: scale(1.05);
}

.remove-tag {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  cursor: pointer;
  padding: 2px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  transition: background 0.2s ease;
}

.remove-tag:hover {
  background: rgba(255, 255, 255, 0.3);
}

.add-input {
  display: flex;
  gap: 8px;
}

.add-input input {
  flex: 1;
  margin-bottom: 0;
}

.add-btn-small {
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 10px 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: all 0.2s ease;
  min-width: 44px;
}

.add-btn-small:hover {
  background: var(--primary-hover);
  transform: scale(1.05);
}

/* Botões */
.save-btn, .reset-btn {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.2s ease;
  min-height: 44px;
}

.save-btn {
  background: var(--primary-color);
  color: white;
  box-shadow: 0 2px 4px rgba(79, 70, 229, 0.2);
}

.save-btn:hover:not(:disabled) {
  background: var(--primary-hover);
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(79, 70, 229, 0.3);
}

.save-btn:disabled {
  background: var(--card-border);
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.reset-btn {
  background: var(--card-bg);
  color: var(--color-text);
  border: 2px solid var(--card-border);
}

.reset-btn:hover {
  background: var(--card-border);
  border-color: var(--color-text-secondary);
}

/* Textos auxiliares */
.age-text, .imc-details {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: var(#fff);
  margin-top: 8px;
  font-weight: 500;
}

.imc {
  font-size: 28px;
  font-weight: bold;
  margin: 8px 0;
}

.imc-category {
  font-size: 14px;
  font-weight: 500;
  opacity: 0.9;
}

.loading {
  text-align: center;
  padding: 60px 20px;
  color: var(--color-text-secondary);
  font-size: 16px;
}

.error-message {
  background: var(--error-bg);
  border: 1px solid var(--error-border);
  color: var(--error-text);
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 24px;
  font-weight: 500;
}

.user-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
}

/* Cards especiais */
.card.preferences {
  grid-column: span 2;
}

.card.full {
  grid-column: 1 / -1;
}

.card.actions {
  grid-column: 1 / -1;
  display: flex;
  gap: 16px;
  justify-content: flex-end;
  background: var(--card-bg);
  border: 1px solid var(--card-border);
}

/* Textarea específico */
textarea {
  resize: vertical;
  min-height: 100px;
  font-family: inherit;
  line-height: 1.5;
}

/* Header do conteúdo */
.content-header {
  background: var(--card-bg);
  padding: 24px 32px;
  border-bottom: 1px solid var(--card-border);
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0;
}

.content-header h1 {
  margin: 0;
  font-size: 28px;
  color: var(--color-heading);
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-icon {
  color: var(--primary-color);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.welcome-text {
  font-size: 16px;
  color: var(--color-text);
  font-weight: 500;
}

.user-role-badge {
  background: var(--primary-color);
  color: white;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  text-transform: uppercase;
  font-weight: 600;
  letter-spacing: 0.5px;
}

@media (max-width: 1024px) {
  .user-cards {
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 20px;
  }
  
  .card.preferences {
    grid-column: 1;
  }
}

@media (max-width: 768px) {
  .content-header {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
    padding: 20px;
  }
  
  .user-cards {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .card.preferences,
  .card.full,
  .card.actions {
    grid-column: 1;
  }
  
  .card.actions {
    flex-direction: column;
  }
  
  .save-btn, .reset-btn {
    width: 100%;
    justify-content: center;
  }
  
  .content-area {
    padding: 20px;
  }
}

@media (max-width: 480px) {
  .content-header h1 {
    font-size: 24px;
  }
  
  .card {
    padding: 20px;
  }
  
  .add-input {
    flex-direction: column;
  }
  
  .add-btn-small {
    width: 100%;
    justify-content: center;
  }
}
</style>