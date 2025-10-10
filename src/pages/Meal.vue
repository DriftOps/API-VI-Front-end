<template>
    <DashboardLayout>
      <div class="meal-log-content">
        <div class="content-header">
          <h1>
            <UtensilsIcon :size="24" class="header-icon" />
            Registro de Refeições
          </h1>
          <div class="header-actions">
            <button @click="addMeal" class="add-btn">
              <PlusIcon :size="16" />
              Adicionar Refeição
            </button>
          </div>
        </div>
  
        <div class="content-area">
          <!-- Lista de refeições registradas -->
          <div class="meal-list">
            <div
              v-for="(meal, index) in meals"
              :key="index"
              class="meal-item"
            >
              <div class="meal-info">
                <input
                  v-model="meal.type"
                  placeholder="Tipo (ex: Café da manhã)"
                  class="meal-type-input"
                />
                <input
                  v-model="meal.description"
                  placeholder="Descrição (ex: Arroz + frango)"
                  class="meal-desc-input"
                />
                <input
                  type="number"
                  v-model.number="meal.calories"
                  placeholder="Calorias"
                  class="meal-calories-input"
                />
              </div>
              <div class="meal-actions">
                <button @click="removeMeal(index)" class="remove-btn">
                  <Trash2Icon :size="16" />
                </button>
              </div>
            </div>
          </div>
  
          <!-- Resumo nutricional -->
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
  import { defineComponent, ref, computed } from 'vue'
  import DashboardLayout from '@/layouts/DashboardLayout.vue'
  import { UtensilsIcon, PlusIcon, Trash2Icon } from 'lucide-vue-next'
  
  interface Meal {
    type: string
    description: string
    calories: number
    protein: number
    carbs: number
    fat: number
  }
  
  export default defineComponent({
    name: 'MealLog',
    components: {
      DashboardLayout,
      UtensilsIcon,
      PlusIcon,
      Trash2Icon
    },
    setup() {
      const meals = ref<Meal[]>([
        { type: 'Café da manhã', description: 'Ovos + pão integral', calories: 300, protein: 20, carbs: 25, fat: 10 },
        { type: 'Almoço', description: 'Frango + arroz + salada', calories: 500, protein: 35, carbs: 50, fat: 15 }
      ])
  
      const addMeal = () => {
        meals.value.push({
          type: '',
          description: '',
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0
        })
      }
  
      const removeMeal = (index: number) => {
        meals.value.splice(index, 1)
      }
  
      const totalCalories = computed(() =>
        meals.value.reduce((sum, m) => sum + (m.calories || 0), 0)
      )
  
      const totalProtein = computed(() =>
        meals.value.reduce((sum, m) => sum + (m.protein || 0), 0)
      )
  
      const totalCarbs = computed(() =>
        meals.value.reduce((sum, m) => sum + (m.carbs || 0), 0)
      )
  
      const totalFat = computed(() =>
        meals.value.reduce((sum, m) => sum + (m.fat || 0), 0)
      )
  
      return {
        meals,
        addMeal,
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
  
  .add-btn {
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
  
  .meal-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin-bottom: 40px;
  }
  
  .meal-item {
    background: var(--card-bg);
    border: 1px solid var(--card-border);
    border-radius: 12px;
    padding: 16px 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .meal-info {
    display: flex;
    gap: 10px;
    flex: 1;
  }
  
  .meal-info input {
    border: 1px solid var(--card-border);
    background: var(--color-background);
    border-radius: 8px;
    padding: 8px 10px;
    font-size: 14px;
    color: var(--color-text);
    flex: 1;
  }
  
  .meal-calories-input {
    width: 100px;
    text-align: right;
  }
  
  .meal-actions {
    margin-left: 12px;
  }
  
  .remove-btn {
    background: transparent;
    border: none;
    color: var(--danger-color, #e74c3c);
    cursor: pointer;
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
  