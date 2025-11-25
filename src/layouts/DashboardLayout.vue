<template>
    <div class="dashboard-container">
      <div class="sidebar" :class="{ 'sidebar-collapsed': sidebarCollapsed }">
        <div class="sidebar-header">
          <button @click="toggleSidebar" class="sidebar-toggle">
            <ChevronLeftIcon v-if="!sidebarCollapsed" :size="20" />
            <ChevronRightIcon v-else :size="20" />
          </button>
        </div>
        <div class="sidebar-scrollable">
          <nav class="sidebar-nav">
            <router-link to="/dashboard" class="nav-item" active-class="active">
              <BarChart3Icon :size="20" class="nav-icon" />
              <span class="nav-text">Meu Painel</span>
            </router-link>

            <router-link to="/chat" class="nav-item" active-class="active">
              <MessageSquareIcon :size="20" class="nav-icon" />
              <span class="nav-text">Chat</span>
            </router-link>

            <router-link to="/meal" class="nav-item" active-class="active">
              <CookingPot :size="20" class="nav-icon" />
              <span class="nav-text">Refeições</span>
            </router-link>

<<<<<<< Updated upstream
            <router-link to="/meal-plan" class="nav-item" active-class="active">
=======
            <router-link to="/diet" class="nav-item" active-class="active">
>>>>>>> Stashed changes
              <UtensilsIcon :size="20" class="nav-icon" />
              <span class="nav-text">Plano Alimentar</span>
            </router-link>

            <router-link to="/goals" class="nav-item" active-class="active">
              <TargetIcon :size="20" class="nav-icon" />
              <span class="nav-text">Metas e Progresso</span>
            </router-link>

            <router-link to="/perfil" class="nav-item" active-class="active">
              <UserIcon :size="20" class="nav-icon" />
              <span class="nav-text">Meu Perfil</span>
            </router-link>
  
            <div class="education-section">
              <div class="section-label" v-if="!sidebarCollapsed">Educação</div>
              <router-link to="/recommendplaces" class="nav-item recommendplaces-item" active-class="active">
                <MapPinIcon :size="20" class="nav-icon" />
                <span class="nav-text">Locais Recomendados</span>
              </router-link>

              <router-link to="/education" class="nav-item education-item" active-class="active">
                <GraduationCapIcon :size="20" class="nav-icon" />
                <span class="nav-text">Artigos e Dicas</span>
              </router-link>

              <router-link to="/recipes" class="nav-item" active-class="active">
                <ChefHatIcon :size="20" class="nav-icon" />
                <span class="nav-text">Receitas</span>
              </router-link>
            </div>

            <div v-if="user?.role === 'NUTRITIONIST'" class="nutri-section">
              <div class="section-label" v-if="!sidebarCollapsed">Nutricionista</div>
              <router-link to="/supervision" class="nav-item nutri-item" active-class="active">
                <StethoscopeIcon :size="20" class="nav-icon" />
                <span class="nav-text">Supervisão</span>
              </router-link>
            </div>

            <div v-if="user?.role === 'ADMIN'" class="admin-section">
              <div class="section-label" v-if="!sidebarCollapsed">Administração</div>
              <router-link to="/admin/users" class="nav-item admin-item" active-class="active">
                <UsersIcon :size="20" class="nav-icon" />
                <span class="nav-text">Gerenciar Usuários</span>
                <span v-if="pendingApprovals > 0" class="badge">{{ pendingApprovals }}</span>
              </router-link>

              <router-link to="/admin/analytics" class="nav-item admin-item" active-class="active">
                <PieChartIcon :size="20" class="nav-icon" />
                <span class="nav-text">Analytics</span>
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
              <button @click="handleLogout" class="logout-btn" title="Sair">
                <LogOutIcon :size="18" />
              </button>
            </div>
          </div>
        </div>
      </div>
      <main class="main-content" :class="{ 'expanded': sidebarCollapsed }">
        <slot></slot>
      </main>
    </div>
  </template>

  <script lang="ts">
  import { defineComponent, ref, computed, onMounted } from 'vue';
  import { useRouter } from 'vue-router';
  import { useUserStore } from '@/stores/user';
  import { getPendingApprovals } from '@/api/user';
  import {
    ChevronLeftIcon,
    ChevronRightIcon,
    BarChart3Icon,
    MessageSquareIcon,
    UserIcon,
    UsersIcon,
    SunIcon,
    MoonIcon,
    LogOutIcon,
    Utensils as UtensilsIcon,
    Target as TargetIcon,
    ChefHat as ChefHatIcon,
    GraduationCap as GraduationCapIcon,
    MapPinIcon as MapPinIcon,
    PieChart as PieChartIcon,
    CookingPot,
    StethoscopeIcon
  } from 'lucide-vue-next';

  export default defineComponent({
    name: 'DashboardLayout',
    components: {
      ChevronLeftIcon,
      ChevronRightIcon,
      BarChart3Icon,
      MessageSquareIcon,
      UserIcon,
      UsersIcon,
      SunIcon,
      MoonIcon,
      LogOutIcon,
      UtensilsIcon,
      TargetIcon,
      ChefHatIcon,
      GraduationCapIcon,
      MapPinIcon,
      PieChartIcon,
      CookingPot,
      StethoscopeIcon
    },
    setup() {
      const router = useRouter();
      const userStore = useUserStore();

      const sidebarCollapsed = ref(false);
      const darkMode = ref(localStorage.getItem('theme') === 'dark');

      // Computed properties
      const user = computed(() => userStore.user);
      const pendingApprovals = computed(() => userStore.pendingApprovals);

      // Methods
      const toggleSidebar = () => {
        sidebarCollapsed.value = !sidebarCollapsed.value;
      };

      const toggleTheme = () => {
        darkMode.value = !darkMode.value;
        if (darkMode.value) {
          document.documentElement.classList.add('dark');
          localStorage.setItem('theme', 'dark');
        } else {
          document.documentElement.classList.remove('dark');
          localStorage.setItem('theme', 'light');
        }
      };

      const handleLogout = () => {
        userStore.logout();
      };

      // Buscar pending approvals se for admin
      const loadPendingApprovals = async () => {
        if (user.value?.role === 'ADMIN') {
          try {
            const count = await getPendingApprovals();
            userStore.setPendingApprovals(count);
          } catch (error) {
            console.error('Erro ao carregar pending approvals:', error);
          }
        }
      };

      // Initialize
      onMounted(() => {
        if (darkMode.value) {
          document.documentElement.classList.add('dark');
        }

        // Carregar pending approvals
        loadPendingApprovals();
      });

      return {
        sidebarCollapsed,
        darkMode,
        user,
        pendingApprovals,
        toggleSidebar,
        toggleTheme,
        handleLogout
      };
    }
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
    left: 0;
    top: 0;
  }

  .sidebar-collapsed {
    width: 70px;
  }

  .sidebar-header {
    padding: 20px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-shrink: 0;
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

  .sidebar-footer {
    padding: 20px;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    flex-shrink: 0;
    /* Impede que o footer encolha */
    background: var(--sidebar-bg, #2c3e50);
    /* Garante que o background seja consistente */
  }

  .nav-item {
    display: flex;
    align-items: center;
    padding: 12px 20px;
    color: rgba(255, 255, 255, 0.8);
    text-decoration: none;
    transition: all 0.3s ease;
    position: relative;
  }

  .nav-item:hover {
    background: rgba(255, 255, 255, 0.1);
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
    border-top: 1px solid rgba(255, 255, 255, 0.1);
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
    background: rgba(255, 255, 255, 0.05);
  }

  .sidebar-scrollable {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
  }

  .sidebar-scrollable::-webkit-scrollbar {
    width: 4px;
  }

  .sidebar-scrollable::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
  }

  .sidebar-scrollable::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.3);
    border-radius: 2px;
  }

  .sidebar-scrollable::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.5);
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
    border-top: 1px solid rgba(255, 255, 255, 0.1);
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

  .theme-btn,
  .logout-btn {
    background: rgba(255, 255, 255, 0.1);
    border: none;
    color: white;
    padding: 8px;
    border-radius: 5px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .theme-btn:hover,
  .logout-btn:hover {
    background: rgba(255, 255, 255, 0.2);
  }

  .main-content {
    flex: 1;
    margin-left: 280px;
    /* Largura da sidebar */
    transition: margin-left 0.3s ease;
    background: var(--color-background);
    min-height: 100vh;
    /* width: calc(100vw - 280px); */
    /* max-width: none; */
  }

  .main-content.expanded {
    margin-left: 70px;
    /* width: calc(100vw - 70px); */
  }


  html,
  body {
    overflow-x: hidden;
  }

  .education-section {
    margin-top: 20px;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    padding-top: 20px;
  }

  .education-item {
    background: rgba(255, 255, 255, 0.03);
  }

  .education-item:hover {
    background: rgba(74, 222, 128, 0.1);
  }

  .education-item.active {
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  }

  .nutri-section {
    margin-top: 20px;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    padding-top: 20px;
  }

  .nutri-item {
    background: rgba(255, 255, 255, 0.03);
  }

  .nutri-item:hover {
    /* Usa a cor primária com transparência */
    background: rgba(79, 70, 229, 0.1);
  }

  .nutri-item.active {
    /* Usa um gradiente da cor primária, como no 'education' */
    background: linear-gradient(135deg, var(--primary-color, #4f46e5) 0%, #4338ca 100%);
  }


  /* Responsividade */
  @media (max-width: 768px) {
    .sidebar {
      width: 70px;
    }

    .main-content {
      margin-left: 70px;
    }
  }
  </style>
