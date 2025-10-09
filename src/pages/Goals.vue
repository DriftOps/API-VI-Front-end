<template>
  <DashboardLayout>
    <div class="goals-content">
      <div class="content-header">
        <h1>
          <TargetIcon :size="24" class="header-icon" />
          Metas e Progresso
        </h1>
        <div class="header-actions">
          <button @click="showGoalModal = true" class="add-goal-btn">
            <PlusIcon :size="16" />
            Nova Meta
          </button>
        </div>
      </div>

      <div class="content-area">
        <div class="goals-grid">
          <!-- Metas ativas -->
          <div class="goals-section">
            <h2>Metas Ativas</h2>
            <div class="goals-list">
              <div v-for="goal in activeGoals" :key="goal.id" class="goal-card">
                <div class="goal-header">
                  <h3>{{ goal.title }}</h3>
                  <span class="goal-deadline">{{ goal.deadline }}</span>
                </div>
                <p class="goal-description">{{ goal.description }}</p>
                <div class="goal-progress">
                  <div class="progress-bar">
                    <div 
                      class="progress-fill" 
                      :style="{ width: goal.progress + '%' }"
                    ></div>
                  </div>
                  <span class="progress-text">{{ goal.progress }}%</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Progresso físico -->
          <div class="progress-section">
            <h2>Progresso Físico</h2>
            <div class="progress-cards">
              <div class="progress-card">
                <div class="progress-value">{{ currentWeight }}kg</div>
                <div class="progress-label">Peso Atual</div>
                <div class="progress-change" :class="{ positive: weightChange >= 0, negative: weightChange < 0 }">
                  {{ weightChange >= 0 ? '+' : '' }}{{ weightChange }}kg
                </div>
              </div>
              <!-- Adicione mais métricas conforme necessário -->
            </div>
          </div>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import { TargetIcon, PlusIcon } from 'lucide-vue-next'

interface Goal {
  id: number
  title: string
  description: string
  deadline: string
  progress: number
}

export default defineComponent({
  name: 'Goals',
  components: {
    DashboardLayout,
    TargetIcon,
    PlusIcon
  },
  setup() {
    const showGoalModal = ref(false)
    const currentWeight = ref(75.5)
    const weightChange = ref(-2.3)

    const activeGoals = ref<Goal[]>([
      {
        id: 1,
        title: 'Perder 5kg',
        description: 'Reduzir peso para atingir IMC ideal',
        deadline: '30/12/2024',
        progress: 60
      },
      {
        id: 2,
        title: 'Aumentar massa muscular',
        description: 'Ganhar 2kg de massa magra',
        deadline: '15/01/2025',
        progress: 30
      }
    ])

    return {
      showGoalModal,
      activeGoals,
      currentWeight,
      weightChange
    }
  }
})
</script>

<style scoped>
.goals-content {
  width: 69vw;
}

.content-header {
  background: var(--card-bg);
  padding: 20px 30px;
  border-bottom: 1px solid var(--card-border);
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: 10px;
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

.add-goal-btn {
  background: var(--primary-color);
  color: white;
  border: none;
  padding: 10px 16px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
}

.content-area {
  padding: 30px;
}

.goals-grid {
  display: grid;
  gap: 30px;
}

.goals-section h2,
.progress-section h2 {
  color: var(--color-heading);
  margin-bottom: 20px;
}

.goals-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.goal-card {
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: 12px;
  padding: 20px;
  transition: transform 0.2s;
}

.goal-card:hover {
  transform: translateY(-2px);
}

.goal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 10px;
}

.goal-header h3 {
  margin: 0;
  color: var(--color-heading);
  font-size: 18px;
}

.goal-deadline {
  background: var(--primary-color);
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.goal-description {
  color: var(--color-text);
  margin-bottom: 15px;
  line-height: 1.4;
}

.goal-progress {
  display: flex;
  align-items: center;
  gap: 12px;
}

.progress-bar {
  flex: 1;
  height: 8px;
  background: var(--card-border);
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--primary-color);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.progress-text {
  font-weight: 600;
  color: var(--color-heading);
  min-width: 40px;
}

.progress-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.progress-card {
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: 12px;
  padding: 24px;
  text-align: center;
}

.progress-value {
  font-size: 32px;
  font-weight: bold;
  color: var(--primary-color);
  margin-bottom: 8px;
}

.progress-label {
  color: var(--color-text-secondary);
  margin-bottom: 8px;
}

.progress-change {
  font-weight: 600;
  font-size: 14px;
}

.progress-change.positive {
  color: #10b981;
}

.progress-change.negative {
  color: #ef4444;
}
</style>