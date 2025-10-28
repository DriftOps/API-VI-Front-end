<template>
  <DashboardLayout>
    <div class="goals-content full-width">
      <div class="content-header">
        <h1>
          <TargetIcon :size="28" class="header-icon" />
          Metas e Progresso
        </h1>
      </div>

      <div class="content-area">
        <div class="active-goal-section card-style">
          <h2>Sua Meta Atual</h2>
          <p class="goal-description">{{ goalDescriptionText }}</p>

          <div v-if="userPlanGoal && userPlanGoal.goalWeight" class="goal-progress-bar">
             <div class="progress-track">
               <div class="progress-fill" :style="{ width: goalProgressPercentage + '%' }"></div>
             </div>
             <div class="progress-labels">
                <span v-if="typeof initialWeight === 'number'">{{ initialWeight.toFixed(1) }}kg</span>
                 <span v-else>-- kg</span>

                 <span class="current-weight-label" :style="{ left: goalProgressPercentage + '%' }" v-if="typeof currentWeight === 'number'">
                   {{ currentWeight.toFixed(1) }}kg
                 </span>

                 <span>{{ userPlanGoal.goalWeight }}kg</span>
             </div>
              <p class="progress-percentage" v-if="typeof goalProgressPercentage === 'number'">{{ goalProgressPercentage.toFixed(0) }}% concluído</p>
               <p v-else class="progress-percentage">Calculando...</p>
          </div>

          <button @click="showGoalSetterModal = true" class="redefine-goal-btn">
            {{ userPlanGoal && userPlanGoal.goalWeight ? 'Redefinir Meta' : 'Definir Meta de Peso' }}
          </button>
        </div>

        <div class="progress-section">
          <h2>Progresso Físico</h2>
          <div class="progress-grid">

            <div class="progress-card card-style weight-log-card">
              <h3>Peso Atual</h3>
              <div class="main-value" v-if="typeof currentWeight === 'number'">{{ currentWeight.toFixed(1) }}kg</div>
              <div class="main-value" v-else>-- kg</div>
              <div
                v-if="weightChange !== 0 && typeof weightChange === 'number'"
                class="sub-value change"
                :class="{ positive: weightChange > 0, negative: weightChange < 0 }"
              >
                {{ weightChange > 0 ? '▲' : '▼' }} {{ Math.abs(weightChange).toFixed(1) }}kg
                <span class="faint">(desde {{ initialDate }})</span>
              </div>
               <div v-else class="sub-value faint">Primeiro registro</div>
              <button @click="showWeightLogModal = true" class="action-button">
                <PlusIcon :size="16" /> Registrar Novo Peso
              </button>
            </div>

            <div class="progress-card card-style body-visualizer-card">
                <h3>Visualização Atual</h3>
                <BodyVisualizer :gender="userProfile?.gender" :weight="currentWeight" />
            </div>

            <div class="progress-card card-style bmi-card">
               <h3>IMC Atual</h3>
               <div class="main-value">{{ bmi.toFixed(1) }}</div>
               <div class="sub-value bmi-category" :class="bmiClass">
                 {{ bmiCategory }}
               </div>
               <p class="faint info-text">
                 Índice de Massa Corporal (calculado com {{ height.toFixed(2) }}m de altura).
               </p>
            </div>

            <div v-if="userPlanGoal && userPlanGoal.goalWeight" class="progress-card card-style goal-comparison-card">
              <h3>Rumo à Meta</h3>
              <div class="main-value" v-if="typeof weightDeltaGoal === 'number'" :class="{ positive: weightDeltaGoal <= 0 && userPlanGoal.goalType === 'PERDER_PESO' || weightDeltaGoal >= 0 && userPlanGoal.goalType === 'GANHAR_PESO', negative: weightDeltaGoal > 0 && userPlanGoal.goalType === 'PERDER_PESO' || weightDeltaGoal < 0 && userPlanGoal.goalType === 'GANHAR_PESO' }">
                 {{ Math.abs(weightDeltaGoal).toFixed(1) }}kg
              </div>
               <div v-else class="main-value">-- kg</div>
              <div class="sub-value">
                   {{ weightDeltaGoal === 0 ? 'Meta atingida!' : ( (userPlanGoal.goalType === 'PERDER_PESO' && weightDeltaGoal < 0) || (userPlanGoal.goalType === 'GANHAR_PESO' && weightDeltaGoal > 0) ? 'restantes' : ( (userPlanGoal.goalType === 'PERDER_PESO' && weightDeltaGoal > 0) || (userPlanGoal.goalType === 'GANHAR_PESO' && weightDeltaGoal < 0) ? 'além da meta' : '' ) ) }}
              </div>
               <p class="faint info-text">
                 Faltam {{ daysUntilDeadline }} dias até {{ formatDateGoal(userPlanGoal.targetDate) }}.
               </p>
            </div>

            <div class="progress-card card-style chart-card">
              <h3>Histórico de Peso</h3>
              <div class="chart-container">
                <Line v-if="chartData.datasets[0].data.length > 1" :data="chartData" :options="chartOptions" />
                <p v-else class="faint info-text">Registre seu peso mais vezes para ver a evolução no gráfico.</p>
              </div>
            </div>

          </div>
        </div>

      </div> </div> <Teleport to="body">
       <div v-if="showWeightLogModal" class="modal-overlay" @click.self="showWeightLogModal = false">
        <div class="modal-content">
          <h2>Registrar novo peso</h2>
          <p>Insira seu peso atual para acompanhar sua evolução.</p>
          <div class="input-group">
            <label for="newWeightModalInput">Peso (em kg)</label>
            <input type="number" id="newWeightModalInput" v-model.number="newWeightEntry" placeholder="Ex: 75.5" step="0.1"/>
          </div>
          <div class="modal-actions">
            <button @click="showWeightLogModal = false" class="btn-secondary">Cancelar</button>
            <button @click="logNewWeight" class="btn-primary" :disabled="!newWeightEntry || newWeightEntry <= 0">
              Salvar
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <Teleport to="body">
       <div v-if="showGoalSetterModal" class="modal-overlay" @click.self="showGoalSetterModal = false">
         <div class="modal-content goal-setter-modal-content">
           <h2>{{ userPlanGoal && userPlanGoal.goalWeight ? 'Redefinir' : 'Definir' }} Meta de Peso</h2>
           <form @submit.prevent="saveGoal">
                <div class="input-group">
                    <label for="goalWeightInputModal">Peso Meta (em kg):</label>
                    <input type="number" id="goalWeightInputModal" v-model.number="goalForm.goalWeight" placeholder="Ex: 75.0" step="0.1" required>
                </div>
                 <div class="input-group">
                    <label for="targetDateInputModal">Alcançar até:</label>
                    <input type="date" id="targetDateInputModal" v-model="goalForm.targetDate" :min="todayDate" required>
                </div>

                 <div class="goal-preview" v-if="goalForm.goalWeight && typeof currentWeight === 'number'">
                    <p>Objetivo:
                        <span v-if="goalForm.goalWeight < currentWeight" class="goal-type loss">Perder Peso</span>
                        <span v-else-if="goalForm.goalWeight > currentWeight" class="goal-type gain">Ganhar Peso</span>
                        <span v-else class="goal-type maintain">Manter Peso</span>
                    </p>
                    <BodyVisualizer :gender="userProfile?.gender" :weight="goalForm.goalWeight" />
                 </div>

                <div class="modal-actions">
                    <button type="button" @click="showGoalSetterModal = false" class="btn-secondary">Cancelar</button>
                    <button type="submit" class="btn-primary" :disabled="!isGoalFormValid">
                    Salvar Meta
                    </button>
                </div>
           </form>
        </div>
      </div>
    </Teleport>

  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive, watch } from 'vue';
import DashboardLayout from '@/layouts/DashboardLayout.vue';
import BodyVisualizer from '@/components/BodyVisualizer.vue'; // Importar o novo visualizador
import { TargetIcon, PlusIcon } from 'lucide-vue-next';
import { Line } from 'vue-chartjs';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { useUserStore } from '@/stores/user';
import type { User } from '@/types/user';

// Registrar Chart.js
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

// --- Interfaces ---
interface WeightLog { weight: number; logDate: string; }
interface UserPlanGoal {
  goalWeight: number | null;
  targetDate: string | null; // Formato YYYY-MM-DD
  goalType: 'PERDER_PESO' | 'GANHAR_PESO' | null;
}
interface GoalForm {
    goalWeight: number | null;
    targetDate: string | null;
}

// --- Refs de Estado ---
const showWeightLogModal = ref(false);
const newWeightEntry = ref<number | null>(null);
const userStore = useUserStore();
const weightHistory = ref<WeightLog[]>([]);
const userProfile = ref<User | null>(null);
const userPlanGoal = ref<UserPlanGoal>({ goalWeight: null, targetDate: null, goalType: null });
const showGoalSetterModal = ref(false);
const height = ref(1.70); // Valor padrão

const goalForm = reactive<GoalForm>({
    goalWeight: null,
    targetDate: null
});

// --- Lógica de Carregamento e Ações ---
onMounted(async () => {
  await fetchUserProfile();
  await fetchWeightHistory();
  // Não mostra modal automaticamente, usuário clica no botão
});

async function fetchUserProfile() {
  console.log("Fetching user profile...");
  try {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Token não encontrado, faça login.');
    const apiUrl = import.meta.env.VITE_API_URL;

    const response = await fetch(`${apiUrl}/api/users/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erro ao buscar perfil do usuário: ${response.status} ${errorText}`);
    }
    const data: User = await response.json();
    console.log("User profile data:", data);
    userProfile.value = data;

    userPlanGoal.value = { goalWeight: null, targetDate: null, goalType: null }; // Reset

    if (data.plan && typeof data.plan === 'string') {
       try {
         console.log("Attempting to parse 'plan':", data.plan);
         const parsedPlan = JSON.parse(data.plan);
         console.log("Parsed 'plan':", parsedPlan);
         userPlanGoal.value = {
            goalWeight: parsedPlan.goalWeight && !isNaN(parseFloat(parsedPlan.goalWeight)) ? parseFloat(parsedPlan.goalWeight) : null,
            targetDate: parsedPlan.targetDate && typeof parsedPlan.targetDate === 'string' && parsedPlan.targetDate.match(/^\d{4}-\d{2}-\d{2}$/) ? parsedPlan.targetDate : null,
            goalType: parsedPlan.goalType === 'PERDER_PESO' || parsedPlan.goalType === 'GANHAR_PESO' ? parsedPlan.goalType : null,
         }
         console.log("Meta extraída do 'plan':", userPlanGoal.value);
       } catch (e) { console.error("Erro ao parsear 'plan' do usuário:", data.plan, e); }
    } else { console.log("Campo 'plan' não encontrado ou inválido."); }

     if (data.height && data.height > 0) {
        height.value = data.height > 3 ? data.height / 100 : data.height;
        console.log("User height updated:", height.value);
     }
  } catch (error) { console.error("Error in fetchUserProfile:", error); }
}

async function fetchWeightHistory() {
  console.log("Fetching weight history...");
  try {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Token não encontrado.');
    const apiUrl = import.meta.env.VITE_API_URL;

    const response = await fetch(`${apiUrl}/api/users/me/weight-history`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erro ao buscar histórico: ${response.status} ${errorText}`);
    }
    const data: WeightLog[] = await response.json();
    console.log("Weight history data:", data);
    weightHistory.value = data;

    if (data.length > 0) {
      newWeightEntry.value = data[data.length - 1].weight;
    } else if (userProfile.value?.weight) {
        newWeightEntry.value = userProfile.value.weight;
    }
  } catch (error) { console.error("Error in fetchWeightHistory:", error); }
}

async function logNewWeight() {
  if (!newWeightEntry.value || newWeightEntry.value <= 0) {
      alert("Por favor, insira um peso válido."); return;
  }
  console.log("Logging new weight:", newWeightEntry.value);
  try {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Token não encontrado');
    const apiUrl = import.meta.env.VITE_API_URL;

    const response = await fetch(`${apiUrl}/api/users/me/weight`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ weight: newWeightEntry.value })
     });
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erro ao salvar peso: ${response.status} ${errorText}`);
    }
    console.log("New weight saved successfully.");
    showWeightLogModal.value = false;
    await fetchUserProfile();
    await fetchWeightHistory();
  } catch (error: any) {
    console.error("Error in logNewWeight:", error);
    alert(`Erro ao salvar peso: ${error.message}`);
  }
}

async function saveGoal() {
    if (!isGoalFormValid.value) { alert("Por favor, preencha a meta e a data corretamente."); return; }

    const goalPlanData = {
        goalWeight: goalForm.goalWeight,
        targetDate: goalForm.targetDate,
        goalType: (goalForm.goalWeight ?? 0) < currentWeight.value ? 'PERDER_PESO' : 'GANHAR_PESO'
    };
    console.log("Saving goal data:", goalPlanData);

    try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Token não encontrado');
        const apiUrl = import.meta.env.VITE_API_URL;

        const response = await fetch(`${apiUrl}/api/users/profile`, { // Endpoint de ATUALIZAÇÃO de perfil
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ plan: JSON.stringify(goalPlanData) }) // Envia SÓ o 'plan' atualizado
        });
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Erro ao salvar meta: ${response.status} ${errorText}`);
        }
        console.log("Goal saved successfully.");
        showGoalSetterModal.value = false;
        await fetchUserProfile(); // Recarrega perfil para buscar a nova meta
    } catch (error: any) {
        console.error('Erro ao salvar meta:', error);
        alert(`Erro ao salvar meta: ${error.message}`);
    }
}

watch(showGoalSetterModal, (newValue) => {
    if (newValue) {
        goalForm.goalWeight = userPlanGoal.value.goalWeight;
        goalForm.targetDate = userPlanGoal.value.targetDate;
    }
});

// --- Propriedades Computadas ---
function formatDate(dateString: string | null | undefined): string {
    if (!dateString) return 'N/A';
     try {
        const [year, month, day] = dateString.split('-');
        if (isNaN(parseInt(year)) || isNaN(parseInt(month)) || isNaN(parseInt(day))) return 'Inválido';
        return `${day}/${month}`;
    } catch { return 'Inválido'; }
}
function formatDateGoal(dateString: string | null): string {
    if (!dateString) return 'Data não definida';
    try {
        const [year, month, day] = dateString.split('-');
         if (isNaN(parseInt(year)) || isNaN(parseInt(month)) || isNaN(parseInt(day))) return 'Data inválida';
        return `${day}/${month}/${year}`;
    } catch { return 'Data inválida' }
}

const initialWeight = computed<number>(() => weightHistory.value[0]?.weight ?? userProfile.value?.weight ?? 0);
const initialDate = computed<string>(() => weightHistory.value.length > 0 ? formatDate(weightHistory.value[0].logDate) : 'N/A');
const currentWeight = computed<number>(() => weightHistory.value.length > 0 ? weightHistory.value[weightHistory.value.length - 1].weight : initialWeight.value);
const weightChange = computed<number>(() => weightHistory.value.length > 0 ? currentWeight.value - initialWeight.value : 0);

const bmi = computed<number>(() => {
  const h = height.value; const w = currentWeight.value;
  if (!h || h <= 0 || !w || w <= 0) return 0;
  return w / (h * h);
});
const bmiCategory = computed<string>(() => {
  const v = bmi.value; if (v <= 0) return 'N/A'; if (v < 18.5) return 'Abaixo do peso'; if (v < 25) return 'Peso normal'; if (v < 30) return 'Sobrepeso'; if (v < 35) return 'Obesidade I'; if (v < 40) return 'Obesidade II'; return 'Obesidade III';
});
const bmiClass = computed<string>(() => {
  const v = bmi.value; if (v <= 0) return ''; if (v < 18.5) return 'bmi-low'; if (v < 25) return 'bmi-ok'; if (v < 30) return 'bmi-mid'; if (v < 35) return 'bmi-high'; return 'bmi-very-high';
});

const chartData = computed(() => ({
  labels: weightHistory.value.map(log => formatDate(log.logDate)),
  datasets: [{
      label: 'Peso (kg)', data: weightHistory.value.map(log => log.weight),
      backgroundColor: 'rgba(79, 70, 229, 0.1)', borderColor: 'rgba(79, 70, 229, 1)',
      tension: 0.3, fill: true, pointBackgroundColor: 'rgba(79, 70, 229, 1)',
      pointBorderColor: '#fff', pointHoverBackgroundColor: '#fff', pointHoverBorderColor: 'rgba(79, 70, 229, 1)',
  }],
}));
const chartOptions = ref({
  responsive: true, maintainAspectRatio: false,
  plugins: { legend: { display: false }, tooltip: { enabled: true, backgroundColor: 'rgba(0,0,0,0.7)', titleColor: '#fff', bodyColor: '#fff' } },
  scales: {
    y: { beginAtZero: false, grid: { color: 'rgba(200, 200, 200, 0.1)' }, ticks: { color: 'grey' } },
    x: { grid: { display: false }, ticks: { color: 'grey' } }
  },
});

const goalProgressPercentage = computed<number>(() => {
  const goalW = userPlanGoal.value?.goalWeight; const initialW = initialWeight.value; const currentW = currentWeight.value;
  if (goalW === null || initialW === null || currentW === null || goalW === initialW) return 0;
  const totalChangeNeeded = goalW - initialW; if (totalChangeNeeded === 0) return (currentW === initialW) ? 100 : 0;
  const changeAchieved = currentW - initialW; const progress = (changeAchieved / totalChangeNeeded) * 100;
  return Math.max(0, Math.min(100, progress));
});
const weightDeltaGoal = computed<number>(() => {
   const goalW = userPlanGoal.value?.goalWeight; const currentW = currentWeight.value;
   if (goalW === null || currentW === null) return 0; return goalW - currentW;
});
const daysUntilDeadline = computed<string | number>(() => {
   const targetDateStr = userPlanGoal.value?.targetDate; if (!targetDateStr) return '?';
   try {
     const today = new Date(); today.setHours(0, 0, 0, 0); const deadline = new Date(targetDateStr); deadline.setHours(0,0,0,0);
     if (isNaN(deadline.getTime())) return '?'; const diffTime = deadline.getTime() - today.getTime();
     if (diffTime < 0) return 0; return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
   } catch { return '?'; }
});
const goalDescriptionText = computed<string>(() => {
    const mainGoalText = userProfile.value?.goal ? userProfile.value.goal.replace('_', ' ').toLowerCase() : 'definir seu objetivo';
    if (userPlanGoal.value?.goalWeight) {
        return `Seu objetivo principal é ${mainGoalText}, buscando alcançar ${userPlanGoal.value.goalWeight}kg até ${formatDateGoal(userPlanGoal.value.targetDate)}.`;
    }
    return `Seu objetivo principal é ${mainGoalText}. Defina uma meta específica de peso e prazo!`;
});
const todayDate = computed(() => new Date().toISOString().split('T')[0]);
const isGoalFormValid = computed(() => {
    return goalForm.goalWeight && goalForm.goalWeight > 0 &&
           goalForm.targetDate && goalForm.targetDate !== '';
});

</script>

<style scoped>
/* Adiciona regra para largura total */
.goals-content.full-width {
  width: 850px; 
  max-width: none; 
  padding: 0; 
}
/* Ajusta padding da content-area se goals-content não tiver mais */
.goals-content.full-width .content-area {
    padding: 0 15px 30px 15px; /* Adiciona padding aqui */
}

/* --- Estilos Gerais --- */
.content-header {
  background: var(--card-bg);
  padding: 20px 30px;
  border-bottom: 1px solid var(--card-border);
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: 12px;
  margin-bottom: 24px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}
.content-header h1 { margin: 0; font-size: 24px; color: var(--color-heading); display: flex; align-items: center; gap: 12px; }
.header-icon { color: var(--primary-color); }
.content-area { display: flex; flex-direction: column; gap: 30px; padding-bottom: 30px; }
.card-style { background: var(--card-bg); border: 1px solid var(--card-border); border-radius: 16px; padding: 24px; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05); }
h2 { font-size: 20px; color: var(--color-heading); margin: 0 0 20px 0; padding-bottom: 10px; border-bottom: 1px solid var(--card-border); text-align: left; }
.faint { color: var(--color-text-secondary); font-size: 0.9em; }
.info-text { margin-top: 15px; font-size: 13px; line-height: 1.4; color: var(--color-text-secondary); }

/* --- Seção Meta Ativa --- */
.active-goal-section { text-align: center; }
.goal-description { font-size: 1.1em; margin-bottom: 25px; line-height: 1.6; color: var(--color-text); }
.goal-description strong { color: var(--primary-color); font-weight: 600; }
.goal-progress-bar { width: 90%; max-width: 600px; margin: 0 auto 20px auto; position: relative; }
.progress-track { height: 14px; background-color: var(--input-bg); border-radius: 7px; overflow: hidden; margin-bottom: 8px; border: 1px solid var(--card-border); }
.progress-fill { height: 100%; background-color: var(--primary-color); border-radius: 7px; transition: width 0.5s ease-out; }
.progress-labels { display: flex; justify-content: space-between; font-size: 13px; font-weight: 500; color: var(--color-text-secondary); padding: 0 2px; position: relative; z-index: 1; }
.current-weight-label { position: absolute; bottom: -22px; transform: translateX(-50%); font-size: 11px; font-weight: bold; color: var(--color-heading); background: var(--card-bg); padding: 2px 5px; border-radius: 4px; border: 1px solid var(--card-border); white-space: nowrap; transition: left 0.5s ease-out; z-index: 2; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
.progress-percentage { font-weight: bold; color: var(--primary-color); margin-top: 30px; font-size: 1.2em; }
.redefine-goal-btn { margin-top: 25px; background: transparent; border: 1px solid var(--primary-color); color: var(--primary-color); padding: 9px 18px; border-radius: 20px; cursor: pointer; font-size: 0.95em; font-weight: 500; transition: all 0.2s; }
.redefine-goal-btn:hover { background: rgba(var(--primary-color-rgb, 79, 70, 229), 0.1); }

/* --- Seção Progresso Físico --- */
.progress-section h2 { margin-bottom: 20px; }
.progress-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 20px; }

/* --- Cards de Progresso --- */
.progress-card { display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 20px; }
.progress-card h3 { font-size: 15px; color: var(--color-text-secondary); margin: 0 0 12px 0; font-weight: 600; width: 100%; text-align: center; border-bottom: 1px solid var(--card-border); padding-bottom: 8px; }
.main-value { font-size: 30px; font-weight: 700; color: var(--primary-color); line-height: 1.1; }
.sub-value { font-size: 14px; font-weight: 500; color: var(--color-text); }
.sub-value.change { font-size: 15px; font-weight: 600; }
.sub-value.change .faint { font-size: 0.8em; margin-left: 5px; }
.sub-value.change.positive { color: #10b981; }
.sub-value.change.negative { color: #ef4444; }
.bmi-category { font-weight: 600; padding: 5px 12px; border-radius: 15px; font-size: 13px; margin-top: 5px; }
.bmi-low { background-color: rgba(59, 130, 246, 0.1); color: #3b82f6; }
.bmi-ok { background-color: rgba(16, 185, 129, 0.1); color: #10b981; }
.bmi-mid { background-color: rgba(250, 204, 21, 0.1); color: #eab308; }
.bmi-high { background-color: rgba(249, 115, 22, 0.1); color: #f97316; }
.bmi-very-high { background-color: rgba(239, 68, 68, 0.1); color: #ef4444; }
.action-button { background-color: var(--primary-color); color: white; border: none; border-radius: 8px; padding: 10px 16px; font-size: 14px; font-weight: 600; cursor: pointer; transition: background-color 0.2s, transform 0.1s; display: flex; align-items: center; justify-content: center; gap: 8px; margin-top: auto; width: calc(100% - 20px); margin-left: 10px; margin-right: 10px; }
.action-button:hover { background-color: var(--primary-color-dark); transform: translateY(-1px); }
.action-button:active { transform: translateY(0px); }

/* --- Card Visualizador --- */
.body-visualizer-card { justify-content: center; padding-top: 30px; padding-bottom: 30px; }

/* --- Card Gráfico --- */
.chart-card { grid-column: 1 / -1; min-height: 340px; }
.chart-container { height: 280px; width: 100%; position: relative; margin-top: 10px; }

/* --- Modal Base --- */
.modal-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0, 0, 0, 0.6); display: flex; align-items: center; justify-content: center; z-index: 1000; backdrop-filter: blur(3px); }
.modal-content { background: var(--card-bg); padding: 24px 30px; border-radius: 16px; width: 90%; max-width: 400px; box-shadow: 0 5px 20px rgba(0,0,0,0.2); }
.modal-content h2 { margin: 0 0 10px 0; font-size: 1.3em; color: var(--color-heading); text-align: center; }
.modal-content p { text-align: center; color: var(--color-text-secondary); margin-bottom: 20px; font-size: 0.95em; }
.input-group { margin: 16px 0; }
.input-group label { display: block; margin-bottom: 6px; font-weight: 500; font-size: 0.9em; color: var(--color-text-secondary); }
.input-group input { width: 100%; padding: 12px 15px; border-radius: 8px; border: 1px solid var(--card-border); font-size: 1em; background: var(--input-bg); color: var(--input-text); box-sizing: border-box; }
.input-group input:focus { outline: none; border-color: var(--primary-color); box-shadow: 0 0 0 3px var(--input-focus-ring); }
.modal-actions { display: flex; gap: 12px; justify-content: flex-end; margin-top: 24px; }
.btn-primary, .btn-secondary { padding: 10px 20px; border-radius: 8px; border: none; font-weight: 600; cursor: pointer; transition: background-color 0.2s, box-shadow 0.2s; }
.btn-primary { background-color: var(--primary-color); color: white; box-shadow: 0 2px 5px rgba(var(--primary-color-rgb, 79, 70, 229), 0.3); }
.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; box-shadow: none; }
.btn-primary:not(:disabled):hover { background-color: var(--primary-color-dark); box-shadow: 0 4px 8px rgba(var(--primary-color-rgb, 79, 70, 229), 0.4); }
.btn-secondary { background-color: var(--button-secondary-bg, var(--card-border)); color: var(--button-secondary-text, var(--color-text)); } /* Add variables for better themeing */
.btn-secondary:hover { background-color: var(--button-secondary-hover-bg, var(--input-bg)); }

/* --- Estilos específicos para Modal de Meta --- */
.goal-setter-modal-content { max-width: 450px; }
.goal-preview { margin-top: 20px; padding: 15px; background-color: var(--input-bg); border-radius: 8px; border: 1px dashed var(--card-border); text-align: center; }
.goal-preview p { margin: 0 0 10px 0; font-size: 0.95em; color: var(--color-text); }
.goal-type { font-weight: 600; }
.goal-type.gain { color: #3b82f6; }
.goal-type.loss { color: #ef4444; }
.goal-type.maintain { color: #eab308; }

/* Adicione as variáveis CSS ausentes (exemplo) */
:root {
  /* ... suas variáveis existentes ... */
  --primary-color: #4F46E5;
  --primary-color-dark: #4338CA;
  --primary-color-light: #6366F1; /* Usado no hover do redefine-goal-btn? */
  --primary-color-rgb: 79, 70, 229; /* Para rgba */
  --button-secondary-bg: var(--card-border); /* Cor de fundo botão secundário */
  --button-secondary-text: var(--color-text); /* Cor texto botão secundário */
  --button-secondary-hover-bg: var(--input-bg); /* Cor hover botão secundário */
  --input-focus-ring: rgba(79, 70, 229, 0.2); /* Cor do anel de foco */
}
</style>