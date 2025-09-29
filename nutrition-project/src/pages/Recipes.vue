<template>
  <DashboardLayout>
    <div class="recipes-content">
      <div class="content-header">
        <h1>
          <ChefHatIcon :size="24" class="header-icon" />
          Receitas Saudáveis
        </h1>
        <div class="header-actions">
          <div class="search-box">
            <SearchIcon :size="16" />
            <input v-model="searchQuery" placeholder="Buscar receitas..." />
          </div>
          <button @click="showFilters = !showFilters" class="filter-btn">
            <FilterIcon :size="16" />
            Filtros
          </button>
        </div>
      </div>

      <div class="content-area">
        <!-- Filtros -->
        <div v-if="showFilters" class="filters-section">
          <div class="filter-group">
            <label>Tipo de Refeição:</label>
            <select v-model="selectedMealType">
              <option value="">Todos</option>
              <option value="breakfast">Café da Manhã</option>
              <option value="lunch">Almoço</option>
              <option value="dinner">Jantar</option>
              <option value="snack">Lanche</option>
            </select>
          </div>
          <div class="filter-group">
            <label>Dificuldade:</label>
            <select v-model="selectedDifficulty">
              <option value="">Todas</option>
              <option value="easy">Fácil</option>
              <option value="medium">Média</option>
              <option value="hard">Difícil</option>
            </select>
          </div>
          <div class="filter-group">
            <label>Tempo Máximo:</label>
            <select v-model="selectedMaxTime">
              <option value="">Qualquer tempo</option>
              <option value="15">15 minutos</option>
              <option value="30">30 minutos</option>
              <option value="60">1 hora</option>
            </select>
          </div>
        </div>

        <!-- Grid de Receitas -->
        <div class="recipes-grid">
          <div v-for="recipe in filteredRecipes" :key="recipe.id" class="recipe-card">
            <div class="recipe-image">
              <img :src="recipe.image" :alt="recipe.title" />
              <div class="recipe-badge" :class="recipe.difficulty">
                {{ recipe.difficulty === 'easy' ? 'Fácil' : recipe.difficulty === 'medium' ? 'Média' : 'Difícil' }}
              </div>
            </div>
            <div class="recipe-content">
              <h3>{{ recipe.title }}</h3>
              <p class="recipe-description">{{ recipe.description }}</p>
              <div class="recipe-meta">
                <span class="cook-time">
                  <ClockIcon :size="14" />
                  {{ recipe.cookTime }}min
                </span>
                <span class="calories">
                  <FlameIcon :size="14" />
                  {{ recipe.calories }}kcal
                </span>
              </div>
              <div class="recipe-tags">
                <span v-for="tag in recipe.tags" :key="tag" class="tag">{{ tag }}</span>
              </div>
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
import { ChefHatIcon, SearchIcon, FilterIcon, ClockIcon, FlameIcon } from 'lucide-vue-next'

interface Recipe {
  id: number
  title: string
  description: string
  image: string
  cookTime: number
  calories: number
  difficulty: 'easy' | 'medium' | 'hard'
  mealType: string
  tags: string[]
}

export default defineComponent({
  name: 'Recipes',
  components: {
    DashboardLayout,
    ChefHatIcon,
    SearchIcon,
    FilterIcon,
    ClockIcon,
    FlameIcon
  },
  setup() {
    const searchQuery = ref('')
    const showFilters = ref(false)
    const selectedMealType = ref('')
    const selectedDifficulty = ref('')
    const selectedMaxTime = ref('')

    const recipes = ref<Recipe[]>([
      {
        id: 1,
        title: 'Omelete de Espinafre',
        description: 'Omelete proteico com espinafre fresco e queijo cottage',
        image: '/api/placeholder/300/200',
        cookTime: 15,
        calories: 280,
        difficulty: 'easy',
        mealType: 'breakfast',
        tags: ['proteico', 'low-carb', 'rápido']
      },
      // ... mais receitas
    ])

    const filteredRecipes = computed(() => {
      let filtered = recipes.value

      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        filtered = filtered.filter(recipe => 
          recipe.title.toLowerCase().includes(query) ||
          recipe.description.toLowerCase().includes(query) ||
          recipe.tags.some(tag => tag.toLowerCase().includes(query))
        )
      }

      if (selectedMealType.value) {
        filtered = filtered.filter(recipe => recipe.mealType === selectedMealType.value)
      }

      if (selectedDifficulty.value) {
        filtered = filtered.filter(recipe => recipe.difficulty === selectedDifficulty.value)
      }

      if (selectedMaxTime.value) {
        filtered = filtered.filter(recipe => recipe.cookTime <= parseInt(selectedMaxTime.value))
      }

      return filtered
    })

    return {
      searchQuery,
      showFilters,
      selectedMealType,
      selectedDifficulty,
      selectedMaxTime,
      filteredRecipes
    }
  }
})
</script>

<style scoped>
.recipes-content {
  width: 100%;
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
  gap: 16px;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--input-bg);
  border: 1px solid var(--card-border);
  border-radius: 8px;
  padding: 8px 12px;
  min-width: 300px;
}

.search-box input {
  border: none;
  background: none;
  outline: none;
  color: var(--input-text);
  flex: 1;
}

.filter-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: 8px;
  color: var(--color-text);
  cursor: pointer;
}

.content-area {
  padding: 30px;
}

.filters-section {
  display: flex;
  gap: 20px;
  margin-bottom: 30px;
  padding: 20px;
  background: var(--card-bg);
  border-radius: 12px;
  border: 1px solid var(--card-border);
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.filter-group label {
  font-weight: 500;
  font-size: 14px;
  color: var(--color-heading);
}

.filter-group select {
  padding: 8px 12px;
  border: 1px solid var(--card-border);
  border-radius: 6px;
  background: var(--input-bg);
  color: var(--input-text);
}

.recipes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
}

.recipe-card {
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: 12px;
  overflow: hidden;
  transition: transform 0.2s;
  cursor: pointer;
}

.recipe-card:hover {
  transform: translateY(-4px);
}

.recipe-image {
  position: relative;
  height: 160px;
  overflow: hidden;
}

.recipe-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.recipe-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  color: white;
}

.recipe-badge.easy {
  background: #10b981;
}

.recipe-badge.medium {
  background: #f59e0b;
}

.recipe-badge.hard {
  background: #ef4444;
}

.recipe-content {
  padding: 20px;
}

.recipe-content h3 {
  color: var(--color-heading);
  margin: 0 0 8px 0;
  font-size: 18px;
  line-height: 1.3;
}

.recipe-description {
  color: var(--color-text);
  font-size: 14px;
  line-height: 1.4;
  margin-bottom: 12px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.recipe-meta {
  display: flex;
  gap: 16px;
  margin-bottom: 12px;
  font-size: 14px;
  color: var(--color-text-secondary);
}

.recipe-meta span {
  display: flex;
  align-items: center;
  gap: 4px;
}

.recipe-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.recipe-tags .tag {
  background: var(--primary-color);
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}
/* Add the missing closing style tag */
</style>