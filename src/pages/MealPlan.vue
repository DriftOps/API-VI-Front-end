<template>
  <DashboardLayout>
    <div class="meal-plan-content">
      <div class="content-header">
        <h1>
          <UtensilsIcon :size="24" class="header-icon" />
          Plano Alimentar
        </h1>
        <div class="header-actions">
          <button @click="generatePlan" class="generate-btn">
            <PlusIcon :size="16" />
            Gerar Novo Plano
          </button>
        </div>
      </div>

      <div class="content-area">
        <div class="plan-overview">
          <!-- Semana atual -->
          <div class="week-section">
            <h2>Semana Atual</h2>
            <div class="days-grid">
              <div v-for="day in weeklyPlan" :key="day.name" class="day-card">
                <div class="day-header">
                  <h3>{{ day.name }}</h3>
                  <span class="date">{{ day.date }}</span>
                </div>
                <div class="meals">
                  <div v-for="meal in day.meals" :key="meal.type" class="meal">
                    <strong>{{ meal.type }}:</strong> {{ meal.description }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Resumo nutricional -->
          <div class="nutrition-summary">
            <h2>Resumo Nutricional Semanal</h2>
            <div class="nutrition-cards">
              <div class="nutrition-card">
                <div class="nutrition-value">{{ nutritionSummary.calories }}</div>
                <div class="nutrition-label">Calorias/dia</div>
              </div>
              <div class="nutrition-card">
                <div class="nutrition-value">{{ nutritionSummary.protein }}g</div>
                <div class="nutrition-label">Proteínas</div>
              </div>
              <div class="nutrition-card">
                <div class="nutrition-value">{{ nutritionSummary.carbs }}g</div>
                <div class="nutrition-label">Carboidratos</div>
              </div>
              <div class="nutrition-card">
                <div class="nutrition-value">{{ nutritionSummary.fat }}g</div>
                <div class="nutrition-label">Gorduras</div>
              </div>
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
import { UtensilsIcon, PlusIcon } from 'lucide-vue-next'

interface Meal {
  type: string
  description: string
  calories: number
}

interface DayPlan {
  name: string
  date: string
  meals: Meal[]
}

export default defineComponent({
  name: 'MealPlan',
  components: {
    DashboardLayout,
    UtensilsIcon,
    PlusIcon
  },
  setup() {
    const weeklyPlan = ref<DayPlan[]>([
      {
        name: 'Segunda',
        date: '01/01',
        meals: [
          { type: 'Café', description: 'Ovos mexidos + pão integral', calories: 350 },
          { type: 'Almoço', description: 'Frango grelhado + arroz integral', calories: 450 },
          { type: 'Jantar', description: 'Salmão + legumes', calories: 400 }
        ]
      },
      // ... outros dias da semana
    ])

    const nutritionSummary = ref({
      calories: 1850,
      protein: 120,
      carbs: 180,
      fat: 50
    })

    const generatePlan = () => {
      alert('Gerando novo plano alimentar personalizado...')
      // Implementar geração de plano
    }

    return {
      weeklyPlan,
      nutritionSummary,
      generatePlan
    }
  }
})
</script>

<style scoped>
.meal-plan-content {
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

.generate-btn {
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

.week-section {
  margin-bottom: 30px;
}

.week-section h2 {
  color: var(--color-heading);
  margin-bottom: 20px;
}

.days-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
}

.day-card {
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: 12px;
  padding: 20px;
  transition: transform 0.2s;
}

.day-card:hover {
  transform: translateY(-2px);
}

.day-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--card-border);
}

.day-header h3 {
  margin: 0;
  color: var(--color-heading);
}

.date {
  color: var(--color-text-secondary);
  font-size: 14px;
}

.meals {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.meal {
  font-size: 14px;
  line-height: 1.4;
}

.nutrition-summary {
  background: var(--card-bg);
  border-radius: 12px;
  padding: 24px;
  border: 1px solid var(--card-border);
}

.nutrition-summary h2 {
  color: var(--color-heading);
  margin-bottom: 20px;
}

.nutrition-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
}

.nutrition-card {
  text-align: center;
  padding: 20px;
  background: var(--color-background);
  border-radius: 8px;
  border: 1px solid var(--card-border);
}

.nutrition-value {
  font-size: 24px;
  font-weight: bold;
  color: var(--primary-color);
  margin-bottom: 8px;
}

.nutrition-label {
  font-size: 14px;
  color: var(--color-text-secondary);
}
</style>