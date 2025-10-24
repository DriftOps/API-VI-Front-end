<template>
  <DashboardLayout>
    <div class="meal-log-content">
      <div class="content-header">
        <h1>
          <UtensilsIcon :size="24" class="header-icon" />
          Registro de Refeições
        </h1>
        <div class="header-actions">
          <input type="date" v-model="selectedDate" @change="fetchMeals" class="date-picker" />
        </div>
      </div>

      <div class="content-area">
        <div class="meal-list">
          <MealItem
            v-for="meal in meals"
            :key="meal.id"
            :meal="meal"
            @remove="removeMeal"
          />
          <div v-if="meals.length === 0" class="empty-list">
            <p>Nenhuma refeição registrada para esta data.</p>
          </div>
        </div>

        <div class="nutrition-summary">
          <h2>Resumo Nutricional do Dia</h2>
          <div class="nutrition-cards">
            <div class="nutrition-card">
              <div class="nutrition-value">{{ totalCalories }}</div>
              <div class="nutrition-label">Calorias</div>
            </div>
            <div class="nutrition-card">
              <div class="nutrition-value">{{ totalProtein }}g</div>
              <div class="nutrition-label">Proteínas</div>
            </div>
            <div class="nutrition-card">
              <div class="nutrition-value">{{ totalCarbs }}g</div>
              <div class="nutrition-label">Carboidratos</div>
            </div>
            <div class="nutrition-card">
              <div class="nutrition-value">{{ totalFat }}g</div>
              <div class="nutrition-label">Gorduras</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>

<script lang="ts">
import { defineComponent, onMounted } from 'vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import MealItem from '../components/MealItem.vue'
import { UtensilsIcon } from 'lucide-vue-next'
import { useMealStore } from '@/stores/meal'
import { storeToRefs } from 'pinia'

export default defineComponent({
  name: 'MealLog',
  components: { DashboardLayout, MealItem, UtensilsIcon },
  setup() {
    const mealStore = useMealStore()

    const {
      meals,
      selectedDate,
      totalCalories,
      totalProtein,
      totalCarbs,
      totalFat
    } = storeToRefs(mealStore)

    const { fetchMeals, removeMeal } = mealStore

    onMounted(() => {
      if (!selectedDate.value) {
        selectedDate.value = new Date().toISOString().substr(0, 10)
      }
      fetchMeals()
    })

    return {
      meals,
      selectedDate,
      fetchMeals,
      removeMeal,
      totalCalories,
      totalProtein,
      totalCarbs,
      totalFat
    }
  }
})
</script>

  
<style scoped>
  .meal-log-content {
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

  .header-actions {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .date-picker {
    background: var(--input-bg, var(--color-background));
    border: 1px solid var(--card-border);
    color: var(--color-text);
    padding: 8px 12px;
    border-radius: 8px;
    font-size: 14px;
    font-family: inherit;
    cursor: pointer;
  }

  .date-picker:focus {
    outline: none;
    border-color: var(--primary-color);
  }

  .date-picker::-webkit-calendar-picker-indicator {
    cursor: pointer;
    filter: invert(var(--icon-invert-level, 0.6));
  }
  
  .content-area {
    padding: 30px;
  }
  
  .meal-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin-bottom: 40px;
  }

  .empty-list {
    text-align: center;
    padding: 40px;
    background: var(--card-bg);
    border: 1px dashed var(--card-border);
    border-radius: 12px;
    color: var(--color-text-secondary);
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