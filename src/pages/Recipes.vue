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
          <div
            v-for="recipe in filteredRecipes"
            :key="recipe.id"
            class="recipe-card"
            @click="openRecipe(recipe)"
          >
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

        <!-- Modal de Detalhes -->
        <div v-if="selectedRecipe" class="modal-overlay" @click.self="closeModal">
          <div class="modal">
            <button class="close-btn" @click="closeModal">×</button>
            <h2>{{ selectedRecipe.title }}</h2>
            <img :src="selectedRecipe.image" :alt="selectedRecipe.title" class="modal-image" />
            <p class="modal-description">{{ selectedRecipe.description }}</p>
            <p><strong>Tempo de preparo:</strong> {{ selectedRecipe.cookTime }} min</p>
            <p><strong>Calorias:</strong> {{ selectedRecipe.calories }} kcal</p>
            <p><strong>Dificuldade:</strong>
              {{ selectedRecipe.difficulty === 'easy' ? 'Fácil' : selectedRecipe.difficulty === 'medium' ? 'Média' : 'Difícil' }}
            </p>
            <div class="recipe-tags modal-tags">
              <span v-for="tag in selectedRecipe.tags" :key="tag" class="tag">{{ tag }}</span>
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
  components: { DashboardLayout, ChefHatIcon, SearchIcon, FilterIcon, ClockIcon, FlameIcon },
  setup() {
    const searchQuery = ref('')
    const showFilters = ref(false)
    const selectedMealType = ref('')
    const selectedDifficulty = ref('')
    const selectedMaxTime = ref('')
    const selectedRecipe = ref<Recipe | null>(null)

    const openRecipe = (recipe: Recipe) => (selectedRecipe.value = recipe)
    const closeModal = () => (selectedRecipe.value = null)

    const recipes = ref<Recipe[]>([
      // Fáceis
      {
        id: 1,
        title: 'Omelete de Espinafre',
        description: 'Omelete proteico com espinafre fresco e queijo cottage.',
        image: 'https://images.unsplash.com/photo-1589308078059-be1415eab4c3?w=600',
        cookTime: 15,
        calories: 280,
        difficulty: 'easy',
        mealType: 'breakfast',
        tags: ['proteico', 'low-carb', 'rápido']
      },
      {
        id: 2,
        title: 'Smoothie de Frutas Vermelhas',
        description: 'Bebida refrescante com morango, amora e iogurte natural.',
        image: 'https://images.unsplash.com/photo-1572441710534-680c456a1c84?w=600',
        cookTime: 10,
        calories: 180,
        difficulty: 'easy',
        mealType: 'snack',
        tags: ['vitaminas', 'natural', 'leve']
      },
      {
        id: 3,
        title: 'Salada Tropical',
        description: 'Salada colorida com frango grelhado, manga e mix de folhas.',
        image: 'https://images.unsplash.com/photo-1565958011705-44e2112a2b8d?w=600',
        cookTime: 20,
        calories: 320,
        difficulty: 'easy',
        mealType: 'lunch',
        tags: ['leve', 'sem glúten', 'rápido']
      },
      {
        id: 4,
        title: 'Tapioca com Queijo e Tomate',
        description: 'Receita simples e saudável para o café da manhã.',
        image: 'https://images.unsplash.com/photo-1623855256540-3b8e6e7c7a4a?w=600',
        cookTime: 10,
        calories: 250,
        difficulty: 'easy',
        mealType: 'breakfast',
        tags: ['sem glúten', 'rápido']
      },

      // Médias
      {
        id: 5,
        title: 'Frango ao Curry com Arroz Integral',
        description: 'Prato aromático e equilibrado, perfeito para o almoço.',
        image: 'https://images.unsplash.com/photo-1625944197228-f9b52cb33a9b?w=600',
        cookTime: 35,
        calories: 450,
        difficulty: 'medium',
        mealType: 'lunch',
        tags: ['rico em proteínas', 'fit', 'saboroso']
      },
      {
        id: 6,
        title: 'Quinoa com Legumes Assados',
        description: 'Mistura nutritiva com quinoa, abobrinha, berinjela e pimentão.',
        image: 'https://images.unsplash.com/photo-1606755962773-0c1b7f96d66f?w=600',
        cookTime: 40,
        calories: 380,
        difficulty: 'medium',
        mealType: 'dinner',
        tags: ['vegano', 'rico em fibras']
      },

      // Difíceis
      {
        id: 7,
        title: 'Salmão Grelhado com Molho de Maracujá',
        description: 'Salmão crocante servido com molho agridoce de maracujá.',
        image: 'https://images.unsplash.com/photo-1603133872878-684f3e92f2c0?w=600',
        cookTime: 50,
        calories: 520,
        difficulty: 'hard',
        mealType: 'dinner',
        tags: ['premium', 'rico em ômega 3']
      },
      {
        id: 8,
        title: 'Risoto de Cogumelos',
        description: 'Risoto cremoso feito com cogumelos frescos e parmesão.',
        image: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=600',
        cookTime: 60,
        calories: 560,
        difficulty: 'hard',
        mealType: 'dinner',
        tags: ['gourmet', 'vegetariano']
      }
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
      if (selectedMealType.value) filtered = filtered.filter(r => r.mealType === selectedMealType.value)
      if (selectedDifficulty.value) filtered = filtered.filter(r => r.difficulty === selectedDifficulty.value)
      if (selectedMaxTime.value) filtered = filtered.filter(r => r.cookTime <= parseInt(selectedMaxTime.value))

      return filtered
    })

    return {
      searchQuery, showFilters, selectedMealType, selectedDifficulty,
      selectedMaxTime, filteredRecipes, selectedRecipe, openRecipe, closeModal
    }
  }
})
</script>

<style scoped>
.recipes-content { width: 69vw; }

.content-header {
  background: var(--card-bg);
  padding: 20px 30px;
  border-bottom: 1px solid var(--card-border);
  display: flex; justify-content: space-between; align-items: center;
  border-radius: 10px;
}
.content-header h1 {
  font-size: 28px; color: var(--color-heading);
  display: flex; align-items: center; gap: 10px;
}
.header-icon { color: var(--primary-color); }
.header-actions { display: flex; align-items: center; gap: 16px; }

.search-box {
  display: flex; align-items: center; gap: 8px;
  background: var(--input-bg); border: 1px solid var(--card-border);
  border-radius: 8px; padding: 8px 12px; min-width: 300px;
}
.search-box input { border: none; background: none; outline: none; flex: 1; color: var(--input-text); }

.filter-btn {
  display: flex; align-items: center; gap: 8px;
  padding: 8px 16px; background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: 8px; color: var(--color-text); cursor: pointer;
}

.content-area { padding: 30px; }

.filters-section {
  display: flex; gap: 20px; margin-bottom: 30px;
  padding: 20px; background: var(--card-bg);
  border-radius: 12px; border: 1px solid var(--card-border);
}

.filter-group { display: flex; flex-direction: column; gap: 8px; }
.filter-group label { font-weight: 500; font-size: 14px; color: var(--color-heading); }
.filter-group select {
  padding: 8px 12px; border: 1px solid var(--card-border);
  border-radius: 6px; background: var(--input-bg); color: var(--input-text);
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
.recipe-card:hover { transform: translateY(-4px); }

.recipe-image { position: relative; height: 160px; overflow: hidden; }
.recipe-image img { width: 100%; height: 100%; object-fit: cover; }

.recipe-badge {
  position: absolute; top: 12px; right: 12px;
  padding: 4px 8px; border-radius: 12px; font-size: 12px;
  color: white; font-weight: 500;
}
.recipe-badge.easy { background: #10b981; }
.recipe-badge.medium { background: #f59e0b; }
.recipe-badge.hard { background: #ef4444; }

.recipe-content { padding: 20px; }
.recipe-content h3 {
  color: var(--color-heading); margin: 0 0 8px 0;
  font-size: 18px; line-height: 1.3;
}
.recipe-description {
  color: var(--color-text); font-size: 14px; margin-bottom: 12px;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
}
.recipe-meta {
  display: flex; gap: 16px; margin-bottom: 12px;
  font-size: 14px; color: var(--color-text-secondary);
}
.recipe-meta span { display: flex; align-items: center; gap: 4px; }
.recipe-tags { display: flex; flex-wrap: wrap; gap: 6px; }
.recipe-tags .tag {
  background: var(--primary-color); color: white;
  padding: 4px 8px; border-radius: 12px;
  font-size: 12px; font-weight: 500;
}

/* Modal */
.modal-overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.6);
  display: flex; justify-content: center; align-items: center;
  z-index: 1000;
}
.modal {
  background: var(--card-bg);
  padding: 24px;
  border-radius: 12px;
  max-width: 500px;
  width: 90%;
  position: relative;
  text-align: center;
  animation: fadeIn 0.3s ease;
}
.modal-image {
  width: 100%; height: 200px;
  object-fit: cover; border-radius: 8px; margin-bottom: 12px;
}
.close-btn {
  position: absolute; top: 12px; right: 12px;
  background: none; border: none;
  font-size: 22px; color: var(--color-text); cursor: pointer;
}
.modal-tags { justify-content: center; margin-top: 10px; }

@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}
</style>
