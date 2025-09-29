<template>
  <DashboardLayout>
    <div class="education-content">
      <div class="content-header">
        <h1>
          <GraduationCapIcon :size="24" class="header-icon" />
          Artigos e Dicas
        </h1>
        <div class="header-actions">
          <div class="search-box">
            <SearchIcon :size="16" />
            <input v-model="searchQuery" placeholder="Buscar artigos..." />
          </div>
        </div>
      </div>

      <div class="content-area">
        <div class="education-grid">
          <!-- Categorias -->
          <div class="categories-sidebar">
            <h3>Categorias</h3>
            <div class="category-list">
              <button 
                v-for="category in categories" 
                :key="category.id"
                :class="['category-btn', { active: selectedCategory === category.id }]"
                @click="selectCategory(category.id)"
              >
                {{ category.name }}
                <span class="article-count">{{ category.count }}</span>
              </button>
            </div>
          </div>

          <!-- Artigos -->
          <div class="articles-main">
            <div class="articles-grid">
              <div v-for="article in filteredArticles" :key="article.id" class="article-card">
                <div class="article-image">
                  <img :src="article.image" :alt="article.title" />
                </div>
                <div class="article-content">
                  <span class="article-category">{{ article.category }}</span>
                  <h3>{{ article.title }}</h3>
                  <p class="article-excerpt">{{ article.excerpt }}</p>
                  <div class="article-meta">
                    <span class="read-time">{{ article.readTime }}</span>
                    <span class="publish-date">{{ article.publishDate }}</span>
                  </div>
                </div>
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
import { GraduationCapIcon, SearchIcon } from 'lucide-vue-next'

interface Article {
  id: number
  title: string
  excerpt: string
  category: string
  readTime: string
  publishDate: string
  image: string
}

interface Category {
  id: string
  name: string
  count: number
}

export default defineComponent({
  name: 'Education',
  components: {
    DashboardLayout,
    GraduationCapIcon,
    SearchIcon
  },
  setup() {
    const searchQuery = ref('')
    const selectedCategory = ref<string>('all')

    const categories = ref<Category[]>([
      { id: 'all', name: 'Todos', count: 12 },
      { id: 'nutrition', name: 'Nutrição', count: 5 },
      { id: 'fitness', name: 'Exercícios', count: 3 },
      { id: 'recipes', name: 'Receitas', count: 2 },
      { id: 'wellness', name: 'Bem-estar', count: 2 }
    ])

    const articles = ref<Article[]>([
      {
        id: 1,
        title: 'Os 10 Alimentos Essenciais para uma Dieta Saudável',
        excerpt: 'Descubra quais alimentos não podem faltar na sua alimentação diária...',
        category: 'nutrition',
        readTime: '5 min',
        publishDate: '15/12/2024',
        image: '/api/placeholder/300/200'
      },
      // ... mais artigos
    ])

    const filteredArticles = computed(() => {
      let filtered = articles.value

      if (selectedCategory.value !== 'all') {
        filtered = filtered.filter(article => article.category === selectedCategory.value)
      }

      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        filtered = filtered.filter(article => 
          article.title.toLowerCase().includes(query) ||
          article.excerpt.toLowerCase().includes(query)
        )
      }

      return filtered
    })

    const selectCategory = (categoryId: string) => {
      selectedCategory.value = categoryId
    }

    return {
      searchQuery,
      selectedCategory,
      categories,
      filteredArticles,
      selectCategory
    }
  }
})
</script>

<style scoped>
.education-content {
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

.content-area {
  padding: 30px;
}

.education-grid {
  display: grid;
  grid-template-columns: 250px 1fr;
  gap: 30px;
}

.categories-sidebar h3 {
  color: var(--color-heading);
  margin-bottom: 16px;
}

.category-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.category-btn {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: 8px;
  color: var(--color-text);
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
}

.category-btn:hover {
  background: var(--card-border);
}

.category-btn.active {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

.article-count {
  background: var(--color-background);
  color: var(--color-text);
  padding: 2px 6px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 500;
}

.category-btn.active .article-count {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.articles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
}

.article-card {
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: 12px;
  overflow: hidden;
  transition: transform 0.2s;
  cursor: pointer;
}

.article-card:hover {
  transform: translateY(-4px);
}

.article-image {
  height: 160px;
  overflow: hidden;
}

.article-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.article-content {
  padding: 20px;
}

.article-category {
  background: var(--primary-color);
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  display: inline-block;
  margin-bottom: 12px;
}

.article-content h3 {
  color: var(--color-heading);
  margin: 0 0 8px 0;
  font-size: 18px;
  line-height: 1.3;
}

.article-excerpt {
  color: var(--color-text);
  font-size: 14px;
  line-height: 1.4;
  margin-bottom: 12px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.article-meta {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: var(--color-text-secondary);
}

@media (max-width: 1024px) {
  .education-grid {
    grid-template-columns: 1fr;
  }
  
  .categories-sidebar {
    order: 2;
  }
  
  .articles-main {
    order: 1;
  }
}
</style>