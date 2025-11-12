<template>
    <DashboardLayout>
      <div class="p-4 md:p-8 max-w-6xl mx-auto w-full">
  
        <div class="page-header">
          <h1 class="page-title">Minha Dieta</h1>
          <button 
            v-if="diet"
            @click="confirmCancelDiet" 
            class="cancel-diet-btn" 
            title="Cancelar Dieta"
          >
            <Trash2Icon :size="16" />
            <span>Cancelar Dieta</span>
          </button>
        </div>
  
        <div v-if="isLoading" class="loading-state">
          <LoaderIcon class="spinner" />
          <p>Carregando sua dieta...</p>
        </div>
        
        <div v-else-if="error" class="welcome-message error-card">
           <div class="welcome-avatar" style="background-color: #ef4444;">
             <AlertTriangleIcon :size="32" />
           </div>
           <div class="welcome-content">
              <h3 style="color: #ef4444;">Erro ao Carregar Dieta</h3>
              <p>{{ error }}</p>
              <div class="quick-questions">
                <button @click="retryLoad" class="quick-btn">Tentar Novamente</button>
              </div>
           </div>
        </div>
        
        <div v-else-if="!diet" class="welcome-message cta-card">
           <div class="welcome-avatar">
             <ClipboardPlusIcon :size="32" />
           </div>
           <div class="welcome-content">
              <h3>Você ainda não possui uma dieta ativa</h3>
              <p>Estou aqui para ajudar você a criar um plano focado nos seus objetivos. Quando estiver pronto, é só pedir!</p>
              <div class="quick-questions">
                <button @click="goToChat" class="quick-btn">Ir para o Chat</button>
              </div>
           </div>
        </div>
  
        <div v-else>
          
          <div class="diet-summary-grid">
            <div class="summary-main">
              <h1 class="diet-title">{{ diet.title }}</h1>
              <div v-if="diet.aiRationale" class="nutritionist-comment-bubble">
                <strong class="comment-sender-label">
                  <UserCheckIcon :size="14" /> 
                  Nota do NutriX:
                </strong>
                <p>{{ diet.aiRationale }}</p> 
              </div>
            </div>
            <div class="summary-stats">
              <div class="stat-card">
                <div class="stat-icon-bg" style="background-color: #ecfdf5; color: #10b981;">
                  <CalendarIcon :size="16" />
                </div>
                <span class="stat-label">Duração</span>
                <span class="stat-value">{{ formatDate(diet.startDate, false, true) }} até {{ formatDate(diet.endDate, false, true) }}</span>
              </div>
              <div class="stat-card">
                <div class="stat-icon-bg" style="background-color: #eef2ff; color: #6366f1;">
                  <FlagIcon :size="16" />
                </div>
                <span class="stat-label">Meta de Peso</span>
                <span class="stat-value">{{ diet.initialWeight }} kg &rarr; {{ diet.targetWeight }} kg</span>
              </div>
              <div class="stat-card">
                <div class="stat-icon-bg" style="background-color: #fefce8; color: #eab308;">
                  <TargetIcon :size="16" />
                </div>
                <span class="stat-label">Meta Calórica Base</span>
                <span class="stat-value">{{ diet.baseDailyCalories }} kcal</span>
              </div>
            </div>
          </div>
  
          <hr class="section-divider">
  
          <div v-if="todayTarget" class="today-focus-card">
            <h2 class="section-title">Hoje ({{ formatDate(todayTarget.targetDate, true) }})</h2>
            <div class="today-card-content">
              <div class="today-main-stats">
                <div class="today-stat">
                  <span class="label">Consumido</span>
                  <span class="value" :class="getConsumedClasses(todayTarget)">
                    {{ todayTarget.consumedCalories }} kcal
                  </span>
                </div>
                <div class="today-vs">/</div>
                <div class="today-stat">
                  <span class="label">Meta</span>
                  <span class="value">{{ todayTarget.adjustedCalories }} kcal</span>
                </div>
              </div>
              <div class="today-balance">
                <span class="label">Balanço</span>
                <span class="value" :class="getBalanceClasses(todayTarget)">
                  {{ getBalance(todayTarget) }} kcal
                </span>
              </div>
            </div>
            <div class="progress-bar-bg" style="height: 12px;">
              <div 
                class="progress-bar-fill" 
                :class="getProgressBarClasses(todayTarget)"
                :style="{ width: getProgressWidth(todayTarget) }"
              ></div>
            </div>
          </div>
  
          <div v-if="upcomingTargets.length > 0" class="mt-6">
            <h2 class="section-title">Próximos Dias</h2>
            <div class="diet-grid">
              <div 
                v-for="day in upcomingTargets" 
                :key="day.id"
                class="day-card" 
                :class="getDayClasses(day)"
              >
                <h3 class="day-card-title">{{ formatDate(day.targetDate, true) }}</h3>
                
                <div class="day-card-row">
                  <span class="day-card-label">Meta:</span>
                  <span class="day-card-value">{{ day.adjustedCalories }} kcal</span>
                </div>
                
                <div class="day-card-row">
                  <span class="day-card-label">Consumido:</span>
                  <span class="day-card-value" :class="getConsumedClasses(day)">
                    {{ day.consumedCalories }} kcal
                  </span>
                </div>
    
                <div class="progress-bar-bg">
                  <div 
                    class="progress-bar-fill" 
                    :class="getProgressBarClasses(day)"
                    :style="{ width: getProgressWidth(day) }"
                  ></div>
                </div>
                
                <div class="day-card-balance" :class="getBalanceClasses(day)">
                  Balanço: {{ getBalance(day) }} kcal
                </div>
    
                <button 
                  v-if="isFutureDate(day.targetDate)"
                  @click="editTarget(day)"
                  class="msg-action"
                >
                  <CopyIcon :size="14" /> Editar Meta
                </button>
              </div>
            </div>
          </div>
  
          <div v-if="pastTargets.length > 0" class="mt-6">
            <h2 class="section-title">Histórico</h2>
            <div class="diet-grid">
              <div 
                v-for="day in pastTargets" 
                :key="day.id"
                class="day-card is-past" 
                :class="getDayClasses(day)"
              >
                <h3 class="day-card-title">{{ formatDate(day.targetDate, true) }}</h3>
                
                <div class="day-card-row">
                  <span class="day-card-label">Meta:</span>
                  <span class="day-card-value">{{ day.adjustedCalories }} kcal</span>
                </div>
                
                <div class="day-card-row">
                  <span class="day-card-label">Consumido:</span>
                  <span class="day-card-value" :class="getConsumedClasses(day)">
                    {{ day.consumedCalories }} kcal
                  </span>
                </div>
    
                <div class="progress-bar-bg">
                  <div 
                    class="progress-bar-fill" 
                    :class="getProgressBarClasses(day)"
                    :style="{ width: getProgressWidth(day) }"
                  ></div>
                </div>
                
                <div class="day-card-balance" :class="getBalanceClasses(day)">
                  Balanço: {{ getBalance(day) }} kcal
                </div>
              </div>
            </div>
          </div>
  
        </div>
      </div>
    </DashboardLayout>
  </template>
  
  <script setup lang="ts">
    import { computed, onMounted } from 'vue';
    import { useRouter } from 'vue-router';
    import { useDietStore } from '@/stores/diet';
    import DashboardLayout from '@/layouts/DashboardLayout.vue';
    import { 
      Loader as LoaderIcon,
      Target as TargetIcon,
      Trash2 as Trash2Icon,
      ClipboardPlus as ClipboardPlusIcon,
      AlertTriangle as AlertTriangleIcon,
      UserCheck as UserCheckIcon,
      Copy as CopyIcon,
      Calendar as CalendarIcon, // NOVO: Ícone importado
      Flag as FlagIcon          // NOVO: Ícone importado
    } from 'lucide-vue-next';
    import type { DietDailyTarget } from '@/api/dietApi';
    
    // --- State Management ---
    const dietStore = useDietStore();
    const router = useRouter();
    
    const diet = computed(() => dietStore.diet);
    const isLoading = computed(() => dietStore.isLoading);
    const error = computed(() => dietStore.error);
  
    // --- Funções Utilitárias (Helpers) ---
    
    const formatDate = (dateString: string, includeWeekday = false, short = false): string => {
      const date = new Date(dateString + 'T00:00:00'); 
      const options: Intl.DateTimeFormatOptions = {
        day: 'numeric',
        month: short ? 'numeric' : 'long',
      };
      if (includeWeekday) {
        options.weekday = 'long';
      }
      if (short) {
        options.year = 'numeric';
      }
      return date.toLocaleDateString('pt-BR', options);
    };
    
    const isFutureDate = (dateString: string): boolean => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const targetDate = new Date(dateString + 'T00:00:00');
      return targetDate > today;
    };
    
    const isToday = (dateString: string): boolean => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const targetDate = new Date(dateString + 'T00:00:00');
      return targetDate.getTime() === today.getTime();
    };
  
    // --- NOVO: Computed Properties para listas de dias ---
  
    const todayTarget = computed(() => {
      return diet.value?.dailyTargets.find(day => isToday(day.targetDate)) || null;
    });
    
    const upcomingTargets = computed(() => {
      // Todos os dias futuros, *sem* incluir hoje
      return diet.value?.dailyTargets
        .filter(day => isFutureDate(day.targetDate))
        .sort((a, b) => new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime()) || []; // Do mais próximo para o mais distante
    });
    
    const pastTargets = computed(() => {
      // Todos os dias passados, *sem* incluir hoje
      return diet.value?.dailyTargets
        .filter(day => !isFutureDate(day.targetDate) && !isToday(day.targetDate))
        .sort((a, b) => new Date(b.targetDate).getTime() - new Date(a.targetDate).getTime()) || []; // Do mais recente para o mais antigo
    });
    
    // --- Actions ---
    const retryLoad = () => {
      dietStore.loadActiveDiet();
    };
  
    const goToChat = () => {
      router.push('/chat');
    };
  
    const confirmCancelDiet = () => {
      if (confirm('Tem certeza que deseja cancelar esta dieta? Esta ação não pode ser desfeita.')) {
        dietStore.cancelActiveDiet();
      }
    };
    
    const editTarget = async (day: DietDailyTarget) => {
      const newCaloriesStr = prompt(`Digite a nova meta de calorias para ${formatDate(day.targetDate, true)}:`, `${day.adjustedCalories}`);
      
      if (newCaloriesStr && !isNaN(Number(newCaloriesStr)) && Number(newCaloriesStr) > 0) {
        const newCalories = Number(newCaloriesStr);
        await dietStore.updateTargetCalories(day.id, newCalories);
      }
    };
    
    // --- Lifecycle ---
    onMounted(() => {
      dietStore.loadActiveDiet();
    });
    
    // --- Funções Utilitárias (Helpers) ---
    
    const getBalance = (day: DietDailyTarget): string => {
      if (day.consumedCalories === 0 && isFutureDate(day.targetDate)) return '...';
      if (day.consumedCalories === 0) return '0';
      const balance = day.consumedCalories - day.adjustedCalories;
      return balance > 0 ? `+${balance}` : `${balance}`;
    };
    
    const getProgressWidth = (day: DietDailyTarget): string => {
      if (day.adjustedCalories === 0 || day.consumedCalories === 0) return '0%';
      const percent = (day.consumedCalories / day.adjustedCalories) * 100;
      if (percent > 100) return '100%';
      if (percent < 0) return '0%';
      return `${percent}%`;
    };
    
    // --- Funções de Estilização Dinâmica ---
    
    const getDayClasses = (day: DietDailyTarget): string => {
      if (isToday(day.targetDate)) {
        return 'is-today'; // Classe CSS customizada
      }
      if (!isFutureDate(day.targetDate) && day.consumedCalories === 0) {
        return 'is-past-empty'; // Classe CSS customizada
      }
      return '';
    };
    
    const getConsumedClasses = (day: DietDailyTarget): string => {
      if (day.consumedCalories === 0 && isFutureDate(day.targetDate)) return 'text-gray';
      if (day.consumedCalories === 0) return 'text-gray';
      if (day.consumedCalories > day.adjustedCalories) {
        return 'text-red';
      }
      return 'text-green';
    };
    
    const getBalanceClasses = (day: DietDailyTarget): string => {
      const balance = day.consumedCalories - day.adjustedCalories;
      if (day.consumedCalories === 0 && isFutureDate(day.targetDate)) return 'text-gray';
      if (day.consumedCalories === 0) return 'text-gray';
      if (balance > 0) return 'text-red';
      if (balance < 0) return 'text-green';
      return 'text-gray';
    };
    
    const getProgressBarClasses = (day: DietDailyTarget): string => {
      if (day.consumedCalories === 0) return 'progress-empty';
      if (day.consumedCalories > day.adjustedCalories) {
        return 'progress-over';
      }
      return 'progress-ok';
    };
    
  </script>
    
  
  <style scoped>
    /* Variáveis de Cor (assumindo que estão em main.css ou :root) */
    :root {
      --primary-color: #4f46e5;
      --card-bg: #ffffff;
      --card-border: #e5e7eb;
      --color-background: #f9fafb;
      --color-heading: #111827;
      --color-text: #374151;
      --color-text-secondary: #6b7280;
      /* ... etc ... */
    }
    
    /* Modo Escuro (assumindo que estão em main.css ou :root) */
    .dark {
      --primary-color: #6366f1;
      --card-bg: #1f2937;
      --card-border: #374151;
      --color-background: #111827;
      --color-heading: #f9fafb;
      --color-text: #d1d5db;
      --color-text-secondary: #9ca3af;
    }
  
    /* Layout (Sem Mudanças) */
    .p-4 { padding: 1rem; }
    .md\:p-8 { @media (min-width: 768px) { padding: 2rem; } }
    .max-w-6xl { max-width: 72rem; }
    .mx-auto { margin-left: auto; margin-right: auto; }
    .w-full { width: 350%; } /* CORREÇÃO: O seu estava 300% */
    .mt-6 { margin-top: 1.5rem; }
  
    /* Cabeçalho da Página (Sem Mudanças) */
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid var(--card-border);
    }
    .page-title {
      font-size: 1.875rem; /* 3xl */
      font-weight: 700;
      color: var(--color-heading);
    }
    .cancel-diet-btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background-color: #ef4444; /* Vermelho */
      color: white;
      padding: 8px 16px;
      border-radius: 8px;
      font-weight: 500;
      font-size: 14px;
      border: none;
      cursor: pointer;
      transition: background-color 0.2s;
    }
    .cancel-diet-btn:hover {
      background-color: #dc2626; /* Vermelho mais escuro */
    }
  
    /* Estado de Loading (Sem Mudanças) */
    .loading-state {
      text-align: center;
      padding: 2.5rem 0;
      color: var(--color-text-secondary);
    }
    .spinner {
      height: 3rem;
      width: 3rem;
      margin-left: auto;
      margin-right: auto;
      color: var(--primary-color);
      animation: spin 1s linear infinite;
    }
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  
    /* Estilos reutilizados do Chat.vue (Sem Mudanças) */
    .welcome-message {
      display: flex;
      gap: 16px;
      padding: 24px;
      background: var(--card-bg);
      border-radius: 12px;
      margin-bottom: 20px;
      border: 1px solid var(--card-border);
    }
    .welcome-message.error-card {
      border-color: #ef4444;
    }
    .welcome-avatar {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: var(--primary-color);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      flex-shrink: 0;
    }
    .welcome-content { flex: 1; min-width: 0; }
    .welcome-content h3 { margin: 0 0 8px 0; color: var(--color-heading); font-size: 1.25rem; font-weight: 600; }
    .welcome-content p { margin: 0 0 16px 0; color: var(--color-text); line-height: 1.5; }
    .quick-questions { display: flex; flex-wrap: wrap; gap: 8px; }
    .quick-btn {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      color: var(--color-text);
      padding: 8px 12px;
      border-radius: 20px;
      font-size: 12px;
      cursor: pointer;
      transition: all 0.2s;
    }
    .quick-btn:hover {
      background: var(--primary-color);
      color: white;
      border-color: var(--primary-color);
    }
  
    /* Sumário da Dieta (Antigo) - REMOVIDO
    .diet-summary-header { ... }
    .diet-meta { ... }
    */
    
    /* Grid da Dieta (Sem Mudanças) */
    .diet-grid {
      display: grid;
      grid-template-columns: repeat(1, minmax(0, 1fr));
      gap: 1rem;
    }
    @media (min-width: 768px) {
      .diet-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    }
    @media (min-width: 1024px) {
      .diet-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
    }
  
    /* Card de Dia (Pequenas Mudanças) */
    .day-card {
      background: var(--card-bg);
      padding: 12px 16px;
      border-radius: 12px;
      border: 1px solid var(--card-border);
      transition: all 0.2s ease;
    }
    .day-card.is-today {
      /* Esta classe ainda existe, mas não é mais o principal destaque */
      border-color: var(--primary-color);
      border-width: 1px;
    }
    .day-card.is-past-empty {
      background-color: var(--color-background);
      opacity: 0.7;
    }
    .dark .day-card.is-past-empty {
      background-color: rgba(31, 41, 55, 0.5);
    }
    .day-card.is-past {
      /* NOVO: Estilo para dias passados no histórico */
      opacity: 0.85;
    }
    .day-card.is-past:hover {
      opacity: 1;
    }
  
    .day-card-title {
      font-weight: 700;
      font-size: 1rem; /* Um pouco menor que o original */
      color: var(--color-heading);
      margin-bottom: 0.75rem;
    }
    .day-card-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.25rem;
    }
    .day-card-label {
      font-size: 0.875rem;
      color: var(--color-text-secondary);
    }
    .day-card-value {
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--color-heading);
    }
    .day-card-balance {
      font-size: 0.875rem;
      font-weight: 500;
      text-align: right;
    }
    
    /* Classes de Cor para JS (Sem Mudanças) */
    .text-red { color: #ef4444; font-weight: 700; }
    .text-green { color: #22c55e; font-weight: 700; }
    .text-gray { color: var(--color-text-secondary); }
  
    /* Barra de Progresso (Sem Mudanças) */
    .progress-bar-bg {
      width: 100%;
      background-color: var(--card-border);
      border-radius: 9999px;
      height: 0.625rem;
      margin-top: 0.5rem;
      margin-bottom: 0.5rem;
      overflow: hidden;
    }
    .dark .progress-bar-bg {
      background-color: #374151;
    }
    .progress-bar-fill {
      height: 100%;
      border-radius: 9999px;
    }
    .progress-ok { background-color: #22c55e; }
    .progress-over { background-color: #ef4444; }
    .progress-empty { background-color: var(--card-border); }
    .dark .progress-empty { background-color: #374151; }
  
    /* Estilo do Racional da IA (Sem Mudanças) */
    .nutritionist-comment-bubble {
      background: #fefce8; 
      border: 1px solid #facc15;
      border-radius: 8px;
      padding: 10px 14px;
      color: #1f2937;
      line-height: 1.4;
      word-wrap: break-word;
      margin-top: 1rem;
    }
    .dark .nutritionist-comment-bubble {
      background: #3a3a1f;
      border-color: #a16207;
      color: #fef08a;
    }
    .comment-sender-label {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.8em;
      font-weight: 700;
      margin-bottom: 4px;
      color: #a16207;
    }
    .dark .comment-sender-label {
      color: #fef08a;
    }
    .nutritionist-comment-bubble p {
      margin: 0;
    }
  
    /* Estilo do Botão Editar (Sem Mudanças) */
    .msg-action {
      background: none;
      border: none;
      color: var(--color-text-secondary);
      cursor: pointer;
      padding: 4px;
      border-radius: 4px;
      font-size: 12px;
      display: inline-flex;
      align-items: center;
      gap: 4px;
      margin-top: 4px;
      opacity: 0.7;
    }
    .msg-action:hover {
      background: var(--card-border);
      color: var(--color-text);
      opacity: 1;
    }
  
    /* --- NOVOS ESTILOS PARA O REDESIGN --- */
  
    .diet-title {
      font-size: 1.875rem; /* 3xl */
      font-weight: 700;
      color: var(--color-heading);
      margin-bottom: 0; /* Ajustado */
    }
  
    .diet-summary-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 1.5rem;
    }
    @media (min-width: 1024px) {
      .diet-summary-grid {
        grid-template-columns: 1fr 1fr; /* 2 colunas em telas grandes */
      }
    }
  
    .summary-stats {
      display: grid;
      grid-template-columns: 1fr;
      gap: 1rem;
    }
    @media (min-width: 640px) {
      .summary-stats {
        grid-template-columns: repeat(3, 1fr); /* 3 colunas em telas pequenas */
      }
      @media (min-width: 1024px) {
        .summary-stats {
          grid-template-columns: 1fr; /* Volta a 1 coluna dentro do grid maior */
        }
      }
    }
  
    .stat-card {
      background-color: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 12px;
      padding: 1rem;
      display: flex;
      flex-direction: column;
    }
    
    .stat-icon-bg {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 0.75rem;
    }
    .dark .stat-icon-bg {
      /* Ajustes para modo escuro */
      background-color: var(--card-border) !important;
    }
    
    .stat-label {
      font-size: 0.875rem;
      color: var(--color-text-secondary);
      margin-bottom: 0.25rem;
    }
    
    .stat-value {
      font-size: 1.125rem;
      font-weight: 600;
      color: var(--color-heading);
    }
  
    .section-divider {
      border: none;
      border-top: 1px solid var(--card-border);
      margin: 2rem 0;
    }
  
    .section-title {
      font-size: 1.25rem; /* 2xl */
      font-weight: 600;
      color: var(--color-heading);
      margin-bottom: 1rem;
    }
  
    .today-focus-card {
      background: var(--card-bg);
      border: 2px solid var(--primary-color);
      border-radius: 16px;
      padding: 1.5rem;
      box-shadow: 0 4px 12px -1px rgba(0,0,0,0.05), 0 2px 8px -1px rgba(0,0,0,0.03);
    }
    .dark .today-focus-card {
      box-shadow: 0 0 0 1px var(--primary-color);
    }
    
    .today-card-content {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      margin-bottom: 1rem;
    }
    @media (min-width: 768px) {
      .today-card-content {
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
      }
    }
    
    .today-main-stats {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    
    .today-stat {
      display: flex;
      flex-direction: column;
    }
    .today-stat .label {
      font-size: 0.875rem;
      color: var(--color-text-secondary);
      margin-bottom: 0.25rem;
    }
    .today-stat .value {
      font-size: 1.875rem;
      font-weight: 700;
      color: var(--color-heading);
      line-height: 1;
    }
    
    .today-vs {
      font-size: 1.5rem;
      color: var(--color-text-secondary);
      padding-top: 1rem;
    }
  
    .today-balance {
      display: flex;
      flex-direction: column;
      text-align: left;
    }
    @media (min-width: 768px) {
      .today-balance {
        text-align: right;
      }
    }
    .today-balance .label {
      font-size: 0.875rem;
      color: var(--color-text-secondary);
      margin-bottom: 0.25rem;
    }
    .today-balance .value {
      font-size: 1.875rem;
      font-weight: 700;
      line-height: 1;
    }
    
  </style>