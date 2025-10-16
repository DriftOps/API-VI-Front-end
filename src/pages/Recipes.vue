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
  <div class="modal-content">
    <!-- Botão Fechar (X) -->
    <button class="close-icon" @click="closeModal">✕</button>

    <!-- Imagem -->
    <img
      :src="selectedRecipe.image"
      :alt="selectedRecipe.title"
      class="modal-image"
    />

    <!-- Título e Descrição -->
    <h2 class="modal-title">{{ selectedRecipe.title }}</h2>
    <p class="modal-description">{{ selectedRecipe.description }}</p>

    <!-- Meta Infos -->
    <div class="modal-meta">
      <span><ClockIcon :size="14" /> {{ selectedRecipe.cookTime }} min</span>
      <span><FlameIcon :size="14" /> {{ selectedRecipe.calories }} kcal</span>
      <span
        class="modal-difficulty"
        :class="selectedRecipe.difficulty"
      >
        {{ selectedRecipe.difficulty === 'easy' ? 'Fácil' : selectedRecipe.difficulty === 'medium' ? 'Média' : 'Difícil' }}
      </span>
    </div>

    <!-- Ingredientes -->
    <h4>🧂 Ingredientes</h4>
    <ul class="modal-list">
      <li v-for="(item, i) in selectedRecipe.ingredients" :key="i">
        {{ item }}
      </li>
    </ul>

    <!-- Modo de Preparo -->
    <h4>👩‍🍳 Modo de Preparo</h4>
    <p>{{ selectedRecipe.instructions }}</p>
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
  ingredients: string[]
  instructions: string
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
    image: 'https://anamariareceitas.com.br/wp-content/uploads/2022/10/Omelete-de-espinafre-e-queijo.jpg',
    cookTime: 15,
    calories: 280,
    difficulty: 'easy',
    mealType: 'breakfast',
    tags: ['proteico', 'low-carb', 'rápido'],
    ingredients: ['2 ovos', '1 xícara de espinafre fresco', '2 colheres de queijo cottage', 'Sal e pimenta a gosto', '1 colher de azeite'],
    instructions: 'Bata os ovos com sal e pimenta, aqueça o azeite em uma frigideira, adicione o espinafre e o queijo e cozinhe até firmar. Dobre e sirva quente.'
  },
  {
    id: 2,
    title: 'Smoothie de Frutas Vermelhas',
    description: 'Bebida refrescante com morango, amora e iogurte natural.',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTJpQaVAE5YY4wZTMuWzholEnAtvU_rngqPpg&s',
    cookTime: 10,
    calories: 180,
    difficulty: 'easy',
    mealType: 'snack',
    tags: ['vitaminas', 'natural', 'leve'],
    ingredients: ['1 xícara de morangos', '1/2 xícara de amoras', '1 copo de iogurte natural', '1 colher de mel', 'Gelo a gosto'],
    instructions: 'Bata todos os ingredientes no liquidificador até obter uma mistura homogênea. Sirva gelado.'
  },
  {
    id: 3,
    title: 'Salada Tropical',
    description: 'Salada colorida com frango grelhado, manga e mix de folhas.',
    image: 'https://www.oitedi.com.br/_next/image?url=https%3A%2F%2Ftedi-production.s3.amazonaws.com%2Fcooking_recipes%2Ffood_description%2Fb6c2b0224c00c70538fb0d840c0271c4c57b7255.png&w=1080&q=70',
    cookTime: 20,
    calories: 320,
    difficulty: 'easy',
    mealType: 'lunch',
    tags: ['leve', 'sem glúten', 'rápido'],
    ingredients: ['150g de peito de frango grelhado', '1/2 manga em cubos', 'Mix de folhas verdes', 'Tomate cereja', 'Molho de azeite e limão'],
    instructions: 'Misture todos os ingredientes em uma tigela. Tempere com o molho de azeite e limão e sirva imediatamente.'
  },
  {
    id: 4,
    title: 'Tapioca com Queijo e Tomate',
    description: 'Receita simples e saudável para o café da manhã.',
    image: 'https://s2.glbimg.com/8GoXg7WVYKWYbpzvUHFUQuTpeSg=/e.glbimg.com/og/ed/f/original/2021/11/04/tapioca_alfeu_tavares.jpg',
    cookTime: 10,
    calories: 250,
    difficulty: 'easy',
    mealType: 'breakfast',
    tags: ['sem glúten', 'rápido'],
    ingredients: ['2 colheres de sopa de goma de tapioca', '2 fatias de queijo mussarela', '1 tomate fatiado', 'Sal e orégano a gosto'],
    instructions: 'Espalhe a tapioca na frigideira aquecida, adicione queijo e tomate, tempere e dobre ao meio. Cozinhe por 1-2 minutos e sirva.'
  },

  // Médias
  {
    id: 5,
    title: 'Frango ao Curry com Arroz Integral',
    description: 'Prato aromático e equilibrado, perfeito para o almoço.',
    image: 'https://cdn.oceanserver.com.br/lojas/economyfit/uploads_produto/img-6546-66d2079724848.jpg',
    cookTime: 35,
    calories: 450,
    difficulty: 'medium',
    mealType: 'lunch',
    tags: ['rico em proteínas', 'fit', 'saboroso'],
    ingredients: ['200g de peito de frango em cubos', '1 colher de sopa de curry', '1/2 cebola picada', '1 xícara de arroz integral cozido', 'Sal, pimenta e azeite'],
    instructions: 'Refogue a cebola e o frango com azeite. Adicione o curry, sal e pimenta. Sirva sobre o arroz integral cozido.'
  },
  {
    id: 6,
    title: 'Quinoa com Legumes Assados',
    description: 'Mistura nutritiva com quinoa, abobrinha, berinjela e pimentão.',
    image: 'https://static.wixstatic.com/media/540f1d_5a709fa9ee044ee59631ca9d75bf290b~mv2.jpg/v1/fill/w_568,h_384,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/540f1d_5a709fa9ee044ee59631ca9d75bf290b~mv2.jpg',
    cookTime: 40,
    calories: 380,
    difficulty: 'medium',
    mealType: 'dinner',
    tags: ['vegano', 'rico em fibras'],
    ingredients: ['1 xícara de quinoa', '1/2 abobrinha cortada', '1/2 berinjela cortada', '1 pimentão vermelho', 'Azeite, sal e ervas a gosto'],
    instructions: 'Cozinhe a quinoa. Asse os legumes com azeite e temperos a 200°C por 20 minutos. Misture com a quinoa e sirva.'
  },

  // Difíceis
  {
    id: 7,
    title: 'Salmão Grelhado com Molho de Maracujá',
    description: 'Salmão crocante servido com molho agridoce de maracujá.',
    image: 'https://www.diadepeixe.com.br/extranet/thumbnail/crop/550x360/Receita/copacol_blog_salmao_maracuja_1739804626448.png',
    cookTime: 50,
    calories: 520,
    difficulty: 'hard',
    mealType: 'dinner',
    tags: ['premium', 'rico em ômega 3'],
    ingredients: ['2 filés de salmão', 'Polpa de 2 maracujás', '1 colher de mel', 'Sal, pimenta e azeite'],
    instructions: 'Tempere o salmão com sal e pimenta. Grelhe em frigideira com azeite. Misture o suco de maracujá com mel para o molho e sirva sobre o salmão.'
  },
  {
    id: 8,
    title: 'Risoto de Cogumelos',
    description: 'Risoto cremoso feito com cogumelos frescos e parmesão.',
    image: 'https://www.oitedi.com.br/_next/image?url=https%3A%2F%2Ftedi-production.s3.amazonaws.com%2Fcooking_recipes%2Ffood_description%2Fc2e704962a416f6318257d563478bd04e661632b.png&w=1080&q=70',
    cookTime: 60,
    calories: 560,
    difficulty: 'hard',
    mealType: 'dinner',
    tags: ['gourmet', 'vegetariano'],
    ingredients: ['1 xícara de arroz arbóreo', '200g de cogumelos frescos', '1/2 cebola picada', '50g de queijo parmesão ralado', 'Manteiga, azeite, sal e pimenta'],
    instructions: 'Refogue a cebola e os cogumelos em azeite e manteiga. Adicione o arroz, vá adicionando caldo aos poucos até cozinhar. Finalize com parmesão e sirva.'
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
/* Overlay */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

/* Container */
.modal-content {
  position: relative;
  background: var(--card-bg);
  color: var(--color-text);
  border-radius: 16px;
  padding: 30px;
  width: 500px;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  animation: fadeIn 0.3s ease;
}

/* Botão X */
.close-icon {
  position: absolute;
  top: 14px;
  right: 16px;
  background: none;
  border: none;
  font-size: 22px;
  color: var(--color-text);
  cursor: pointer;
  transition: 0.2s;
}
.close-icon:hover {
  color: var(--primary-color);
  transform: scale(1.1);
}

/* Imagem */
.modal-image {
  width: 100%;
  height: 200px;
  border-radius: 10px;
  object-fit: cover;
  margin-bottom: 16px;
}

/* Título e texto */
.modal-title {
  color: var(--color-heading);
  margin-bottom: 10px;
}
.modal-description {
  color: var(--color-text-secondary);
  margin-bottom: 16px;
}

/* Meta */
.modal-meta {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  margin-bottom: 16px;
  font-size: 14px;
  color: var(--color-text-secondary);
}
.modal-difficulty.easy {
  color: #10b981;
}
.modal-difficulty.medium {
  color: #f59e0b;
}
.modal-difficulty.hard {
  color: #ef4444;
}

/* Ingredientes e preparo */
.modal-list {
  margin-bottom: 20px;
  padding-left: 20px;
}

/* Animação */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}


</style>
