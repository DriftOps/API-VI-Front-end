<template>
  <div class="dashboard-container">
    <!-- Sidebar -->
    <div class="sidebar" :class="{ 'sidebar-collapsed': sidebarCollapsed }">
      <div class="sidebar-header">
        <img 
          :src="darkMode ? '/NutriXBlack.gif' : '/NutriX.gif'" 
          alt="NutriX Logo" 
          class="sidebar-logo"
        />
        <button @click="toggleSidebar" class="sidebar-toggle">
          <ChevronLeftIcon v-if="!sidebarCollapsed" :size="20" />
          <ChevronRightIcon v-else :size="20" />
        </button>
      </div>

      <nav class="sidebar-nav">
        <router-link to="/dashboard" class="nav-item" active-class="active">
          <BarChart3Icon :size="20" class="nav-icon" />
          <span class="nav-text">Meu Painel</span>
        </router-link>

        <router-link to="/chat" class="nav-item" active-class="active">
          <MessageSquareIcon :size="20" class="nav-icon" />
          <span class="nav-text">Chat</span>
        </router-link>

        <router-link to="/perfil" class="nav-item" active-class="active">
          <UserIcon :size="20" class="nav-icon" />
          <span class="nav-text">Meu Perfil</span>
        </router-link>

        <!-- Menu Admin -->
        <div v-if="user?.role === 'ADMIN'" class="admin-section">
          <div class="section-label" v-if="!sidebarCollapsed">Administração</div>
          <router-link to="/admin/users" class="nav-item admin-item" active-class="active">
            <UsersIcon :size="20" class="nav-icon" />
            <span class="nav-text">Gerenciar Usuários</span>
            <span v-if="pendingApprovals > 0" class="badge">{{ pendingApprovals }}</span>
          </router-link>
        </div>
      </nav>

      <div class="sidebar-footer">
        <div class="user-info">
          <div class="user-avatar">{{ user?.name?.charAt(0) || 'U' }}</div>
          <div v-if="!sidebarCollapsed" class="user-details">
            <div class="user-name">{{ user?.name }}</div>
            <div class="user-role">{{ user?.role }}</div>
          </div>
        </div>
        <div class="sidebar-actions">
          <button @click="toggleTheme" class="theme-btn" :title="darkMode ? 'Modo Claro' : 'Modo Escuro'">
            <SunIcon v-if="darkMode" :size="18" />
            <MoonIcon v-else :size="18" />
          </button>
          <button @click="logout" class="logout-btn" title="Sair">
            <LogOutIcon :size="18" />
          </button>
        </div>
      </div>
    </div>

    <!-- Conteúdo Principal -->
    <div class="main-content" :class="{ 'expanded': sidebarCollapsed }">
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
              <ScaleIcon :size="12" />
              Peso: {{ userData.weight || 0 }}kg | 
              <RulerIcon :size="12" />
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
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useUserStore } from "../stores/user";
import { fetchCurrentUser, updateUser, getPendingApprovals } from "../api/user";
import type { User as UserType, UserUpdateDTO } from "../types/user"; // ✅ Renomear import

// ✅ Renomear todos os ícones para evitar conflitos
import { 
  BarChart3 as BarChart3Icon, 
  MessageSquare as MessageSquareIcon, 
  User as UserIcon, 
  Users as UsersIcon, 
  Sun as SunIcon, 
  Moon as MoonIcon, 
  LogOut as LogOutIcon, 
  ChevronLeft as ChevronLeftIcon, 
  ChevronRight as ChevronRightIcon,
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
  name: 'DashboardLayout',
  components: {
    BarChart3Icon, 
    MessageSquareIcon, 
    UserIcon, 
    UsersIcon, 
    SunIcon, 
    MoonIcon, 
    LogOutIcon, 
    ChevronLeftIcon, 
    ChevronRightIcon,
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
    const router = useRouter();
    const route = useRoute();
    const userStore = useUserStore();
    
    const sidebarCollapsed = ref(false);
    const darkMode = ref(localStorage.getItem("theme") === "dark");
    const pendingApprovals = ref(0);
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

    // ✅ Corrigir o tipo do pageTitles
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
        const userWithToken: UserType = { // ✅ Usar UserType
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

        if (userResponse.role === 'ADMIN') {
          const approvals = await getPendingApprovals();
          pendingApprovals.value = approvals;
        }
      } catch (err) {
        error.value = "Erro ao carregar dados do usuário";
        console.error(err);
      } finally {
        loading.value = false;
      }
    };

    // Métodos existentes (calculateAge, imc, imcCategory, etc.)
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
        const userWithToken: UserType = { // ✅ Usar UserType
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

    const toggleSidebar = () => {
      sidebarCollapsed.value = !sidebarCollapsed.value;
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

    const logout = () => {
      userStore.clearUser();
      router.push("/login");
    };

    onMounted(() => {
      applyTheme();
      loadData();
    });

    watch(darkMode, applyTheme, { immediate: true });

    return {
      user,
      userData,
      sidebarCollapsed,
      darkMode,
      pendingApprovals,
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
      resetForm,
      toggleSidebar,
      toggleTheme,
      logout
    };
  },
});
</script>

<style scoped>
.dashboard-container {
  display: flex;
  min-height: 100vh;
  background: var(--color-background);
  color: var(--color-text);
}

.sidebar {
  width: 280px;
  background: var(--sidebar-bg, #2c3e50);
  color: white;
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease;
  position: fixed;
  height: 100vh;
  z-index: 1000;
}

.sidebar-collapsed {
  width: 70px;
}

.sidebar-header {
  padding: 20px;
  border-bottom: 1px solid rgba(255,255,255,0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.sidebar-logo {
  width: 40px;
  height: 40px;
  object-fit: contain;
}

.sidebar-toggle {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 5px;
}

.sidebar-nav {
  flex: 1;
  padding: 20px 0;
}

.nav-item {
  display: flex;
  align-items: center;
  padding: 12px 20px;
  color: rgba(255,255,255,0.8);
  text-decoration: none;
  transition: all 0.3s ease;
  position: relative;
}

.nav-item:hover {
  background: rgba(255,255,255,0.1);
  color: white;
}

.nav-item.active {
  background: var(--primary-color, #4f46e5);
  color: white;
}

.nav-icon {
  margin-right: 15px;
  min-width: 20px;
}

.sidebar-collapsed .nav-text {
  display: none;
}

.admin-section {
  margin-top: 20px;
  border-top: 1px solid rgba(255,255,255,0.1);
  padding-top: 20px;
}

.section-label {
  padding: 0 20px 10px;
  font-size: 12px;
  text-transform: uppercase;
  opacity: 0.6;
  font-weight: bold;
}

.admin-item {
  background: rgba(255,255,255,0.05);
}

.badge {
  background: #ef4444;
  color: white;
  border-radius: 10px;
  padding: 2px 8px;
  font-size: 12px;
  margin-left: auto;
}

.sidebar-footer {
  padding: 20px;
  border-top: 1px solid rgba(255,255,255,0.1);
}

.user-info {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--primary-color, #4f46e5);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  margin-right: 10px;
}

.user-details {
  flex: 1;
}

.user-name {
  font-weight: bold;
  font-size: 14px;
}

.user-role {
  font-size: 12px;
  opacity: 0.7;
  text-transform: uppercase;
}

.sidebar-actions {
  display: flex;
  gap: 10px;
}

.theme-btn, .logout-btn {
  background: rgba(255,255,255,0.1);
  border: none;
  color: white;
  padding: 8px;
  border-radius: 5px;
  cursor: pointer;
}

.theme-btn:hover, .logout-btn:hover {
  background: rgba(255,255,255,0.2);
}

.main-content {
  flex: 1;
  margin-left: 280px;
  transition: margin-left 0.3s ease;
}

.main-content.expanded {
  margin-left: 70px;
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
  padding: 20px;
  transition: transform 0.2s;
}

.card:hover {
  transform: translateY(-2px);
}

.card-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  margin-bottom: 10px;
  color: var(--color-heading);
}

.label-icon {
  color: var(--primary-color);
}

.user-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
}

.card {
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: 12px;
  padding: 20px;
  transition: transform 0.2s;
}

.card:hover {
  transform: translateY(-2px);
}

.card-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  margin-bottom: 10px;
  color: var(--color-heading);
}


/* Responsividade */
@media (max-width: 768px) {
  .sidebar {
    width: 70px;
  }
  
  .main-content {
    margin-left: 70px;
  }
  
  .content-header {
    flex-direction: column;
    gap: 10px;
    align-items: flex-start;
  }
}
</style>