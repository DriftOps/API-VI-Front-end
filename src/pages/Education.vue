<template>
  <DashboardLayout>
    <div class="education-content">
      <!-- Cabeçalho -->
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

      <!-- Conteúdo -->
      <div class="content-area">
        <div class="education-grid">
          
          <!-- Sidebar -->
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
              <div v-for="article in filteredArticles" :key="article.id" class="article-card" @click="openModal(article)">
                <div class="article-image">
                  <img :src="article.image" :alt="article.title" />
                </div>
                <div class="article-content">
                  <span class="article-category">{{ getCategoryName(article.category) }}</span>
                  <h3>{{ article.title }}</h3>
                  <p class="article-excerpt">{{ article.excerpt }}</p>
                  <div class="article-meta">
                    <span class="read-time">{{ article.readTime }} min</span>
                    <span class="publish-date">{{ article.publishDate }}</span>
                  </div>
                </div>
              </div>
            </div>
            <div v-if="filteredArticles.length === 0" class="no-articles">
              Nenhum artigo encontrado.
            </div>
          </div>

        </div>
      </div>

      <!-- Modal do Artigo -->
      <div v-if="activeArticle" class="modal-overlay" @click.self="closeModal">
        <div class="modal-content">
          <button class="modal-close" @click="closeModal">&times;</button>
          <h2>{{ activeArticle.title }}</h2>
          <span class="article-category">{{ getCategoryName(activeArticle.category) }}</span>
          <p class="article-full">{{ activeArticle.fullContent }}</p>

          <!-- Vídeo do YouTube (opcional) -->
          <div v-if="activeArticle.videoUrl" class="video-frame">
            <iframe 
              :src="activeArticle.videoUrl" 
              frameborder="0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowfullscreen
            ></iframe>
          </div>

          <div class="article-meta">
            <span class="read-time">{{ activeArticle.readTime }} min</span>
            <span class="publish-date">{{ activeArticle.publishDate }}</span>
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
  fullContent: string
  category: string
  readTime: string
  publishDate: string
  image: string
  videoUrl?: string
}

interface Category {
  id: string
  name: string
  count: number
}

export default defineComponent({
  name: 'Education',
  components: { DashboardLayout, GraduationCapIcon, SearchIcon },
  setup() {
    const searchQuery = ref('')
    const selectedCategory = ref<string>('all')
    const activeArticle = ref<Article | null>(null)

    const categories = ref<Category[]>([
      { id: 'all', name: 'Todos', count: 13 },
      { id: 'nutrition', name: 'Nutrição', count: 5 },
      { id: 'fitness', name: 'Exercícios', count: 3 },
      { id: 'recipes', name: 'Receitas', count: 2 },
      { id: 'wellness', name: 'Bem-estar', count: 3 }
    ])

    const articles = ref<Article[]>([
      // Nutrição
      { id:1, title:'Alimentos Essenciais', excerpt:'Alimentos que não podem faltar na dieta...', fullContent:'Conteúdo completo sobre alimentos essenciais...', category:'nutrition', readTime:'5', publishDate:'15/12/2024', image:'https://media.licdn.com/dms/image/v2/C4D12AQHsTKpqVMU0zw/article-cover_image-shrink_600_2000/article-cover_image-shrink_600_2000/0/1520077714897?e=2147483647&v=beta&t=Rv9fxwVakuWG6etRLrMUWbKqiU40YaSSswEoY0whkvQ', videoUrl:'https://www.youtube.com/embed/DBmPHNcUimQ' },
      { id:2, title:'Vitaminas e Minerais', excerpt:'Como garantir todos os nutrientes...', fullContent:'Conteúdo completo sobre vitaminas e minerais...', category:'nutrition', readTime:'6', publishDate:'16/12/2024', image:'https://dietpro.com.br/site/wp-content/uploads/2022/06/3645170-1-scaled.jpg', videoUrl:'https://youtube.com/embed/z1OWvQjrBKo?si'  },
      { id:3, title:'Planejamento de Refeições', excerpt:'Organize suas refeições semanalmente...', fullContent:'Conteúdo completo sobre planejamento de refeições...', category:'nutrition', readTime:'7', publishDate:'17/12/2024', image:'https://alimentesebem.sesisp.org.br/app/uploads/2022/03/Almoco-e-jantar-sem-logos.png', videoUrl:'https://youtube.com/embed/PnDD-cvgYaY?si' },
      { id:4, title:'Hidratação Correta', excerpt:'Importância de beber água diariamente...', fullContent:'Conteúdo completo sobre hidratação...', category:'nutrition', readTime:'4', publishDate:'18/12/2024', image:'https://i0.wp.com/www.planohapvida.com.br/wp-content/uploads/2018/08/Screenshot_1.jpg?resize=531%2C528&ssl=1' , videoUrl:'https://youtube.com/embed/wjotLW5L4BE?si'  },
      { id:5, title:'Proteínas e Saúde', excerpt:'Como proteínas influenciam sua saúde...', fullContent:'Conteúdo completo sobre proteínas...', category:'nutrition', readTime:'5', publishDate:'19/12/2024', image:'https://media.licdn.com/dms/image/v2/D4D12AQFukgRONyVnBA/article-cover_image-shrink_600_2000/article-cover_image-shrink_600_2000/0/1722429229268?e=2147483647&v=beta&t=IzkyBtvznw9XC9tE9mRRYXOKQcG_uy2S6iiWw21w2y8', videoUrl:'https://www.youtube.com/embed/isZmsnDqgeY?si' },
      // Exercícios
      { id:6, title:'Treino para Iniciantes', excerpt:'Como começar exercícios de forma segura...', fullContent:'Conteúdo completo sobre treino para iniciantes...', category:'fitness', readTime:'7', publishDate:'20/12/2024', image:'https://sports360.com.br/wp-content/uploads/saude_mental.png', videoUrl:'https://www.youtube.com/embed/b5yoZ6BnTnU?si'},
      { id:7, title:'Alongamentos Essenciais', excerpt:'Alongamentos diários para flexibilidade...', fullContent:'Conteúdo completo sobre alongamentos...', category:'fitness', readTime:'5', publishDate:'21/12/2024', image:'https://www.soufisio.com.br/wp-content/uploads/2018/06/alongamentos-dicas.png' ,videoUrl:'https://www.youtube.com/embed/OpVLju5eVxw?si'},
      { id:8, title:'Treino de Força', excerpt:'Como aumentar força muscular com segurança...', fullContent:'Conteúdo completo sobre treino de força...', category:'fitness', readTime:'6', publishDate:'22/12/2024', image:'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSVcpWezc0_P85BrkQQOuGhO3kB6lW_yXt1Sw&s', videoUrl:'https://www.youtube.com/embed/t1oEyk6pCRY?si' },
      // Receitas
      { id:9, title:'Smoothie Saudável', excerpt:'Bebida nutritiva e rápida...', fullContent:'Conteúdo completo sobre smoothie...', category:'recipes', readTime:'4', publishDate:'10/12/2024', image:'https://jpimg.com.br/uploads/2024/03/6-receitas-saudaveis-e-nutritivas-de-smoothie.jpg', videoUrl:'https://www.youtube.com/embed/UVp-ZReypW0?si' },
      { id:10, title:'Salada Energética', excerpt:'Receita de salada fácil e saudável...', fullContent:'Conteúdo completo sobre salada...', category:'recipes', readTime:'5', publishDate:'11/12/2024', image:'https://blog.gsuplementos.com.br/wp-content/uploads/2024/07/salada-com-frango.webp', videoUrl:'https://www.youtube.com/embed//jwC9gOHRm88?si' },
      // Bem-estar
      { id:11, title:'Meditação Diária', excerpt:'Como meditar diariamente...', fullContent:'Conteúdo completo sobre meditação...', category:'wellness', readTime:'6', publishDate:'05/12/2024', image:'/api/placeholder/300/210' },
      { id:12, title:'Sono de Qualidade', excerpt:'Dicas para melhorar seu sono...', fullContent:'Conteúdo completo sobre sono...', category:'wellness', readTime:'5', publishDate:'06/12/2024', image:'/api/placeholder/300/211', videoUrl:'https://www.youtube.com/embed/dQw4w9WgXcQ' },
      { id:13, title:'Gerenciamento de Stress', excerpt:'Como lidar com o stress cotidiano...', fullContent:'Conteúdo completo sobre gerenciamento de stress...', category:'wellness', readTime:'7', publishDate:'07/12/2024', image:'/api/placeholder/300/212' }
    ])

    const filteredArticles = computed(() => {
      let filtered = articles.value
      if (selectedCategory.value !== 'all') {
        filtered = filtered.filter(a => a.category === selectedCategory.value)
      }
      if (searchQuery.value) {
        const q = searchQuery.value.toLowerCase()
        filtered = filtered.filter(a => a.title.toLowerCase().includes(q) || a.excerpt.toLowerCase().includes(q))
      }
      return filtered
    })

    const selectCategory = (categoryId: string) => {
      selectedCategory.value = categoryId
    }

    const getCategoryName = (id: string) => {
      const cat = categories.value.find(c => c.id === id)
      return cat ? cat.name : id
    }

    const openModal = (article: Article) => {
      activeArticle.value = article
    }

    const closeModal = () => {
      activeArticle.value = null
    }

    return {
      searchQuery,
      selectedCategory,
      categories,
      filteredArticles,
      selectCategory,
      getCategoryName,
      activeArticle,
      openModal,
      closeModal
    }
  }
})
</script>

<style scoped>
.education-content {
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
  flex-wrap: wrap;
  gap: 12px;
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

.search-box, .sort-box {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--input-bg);
  border: 1px solid var(--card-border);
  border-radius: 8px;
  padding: 8px 12px;
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

.recent-articles {
  margin-top: 40px;
}

.recent-articles h3 {
  margin-bottom: 12px;
  color: var(--color-heading);
}

.recent-articles ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.recent-articles li {
  margin-bottom: 8px;
  font-size: 14px;
  cursor: pointer;
  color: var(--color-text);
}

.recent-articles li:hover {
  color: var(--primary-color);
  text-decoration: underline;
}

.article-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 16px rgba(0,0,0,0.08);
}

.no-articles {
  text-align: center;
  color: var(--color-text-secondary);
  margin-top: 20px;
  font-size: 16px;
}

.modal-overlay {
  position: fixed;
  top:0; left:0; width:100%; height:100%;
  background: rgba(0,0,0,0.5);
  display:flex;
  align-items:center;
  justify-content:center;
  z-index:1000;
}

.modal-content {
  background: var(--card-bg);
  padding: 30px;
  border-radius: 12px;
  max-width: 700px;
  width: 90%;
  position: relative;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-close {
  position: absolute;
  top: 10px; right: 10px;
  border: none;
  background: none;
  font-size: 28px;
  cursor: pointer;
}

.article-full {
  margin-top: 20px;
  line-height: 1.5;
}

.article-category {
  display: inline-block;
  background: var(--primary-color);
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  margin-bottom: 12px;
}

/* Estilo do vídeo */
.video-frame {
  margin-top: 20px;
  position: relative;
  width: 100%;
  padding-bottom: 56.25%;
  height: 0;
}

.video-frame iframe {
  position: absolute;
  top:0;
  left:0;
  width:100%;
  height:100%;
  border:0;
  border-radius: 12px;
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
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: pointer;
  position: relative;
}


.article-image {
  height: 160px;
  overflow: hidden;
  position: relative;
}

.article-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.favorite-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(255,255,255,0.8);
  border: none;
  border-radius: 50%;
  padding: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.favorite-btn:hover {
  background: var(--primary-color);
}

.favorited {
  color: var(--primary-color);
}

.article-content {
  padding: 20px;
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

.pagination {
  margin-top: 24px;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.pagination button {
  padding: 6px 12px;
  border-radius: 6px;
  border: 1px solid var(--card-border);
  background: var(--card-bg);
  cursor: pointer;
}

.pagination button.active {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
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
