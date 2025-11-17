<template>
  <DashboardLayout>
    <div class="recommendplaces-content">

      <!-- Cabeçalho -->
      <div class="content-header">
        <h1>
          <MapPinIcon :size="24" class="header-icon" />
          Locais Recomendados
        </h1>

        <div class="header-actions">

          <!-- Campo CEP -->
          <div class="cep-box">
            <input v-model="cep" placeholder="Digite seu CEP..." />
            <button @click="buscarLocais">Buscar</button>
          </div>

          <!-- Busca interna -->
          <div class="search-box">
            <SearchIcon :size="16" />
            <input v-model="searchQuery" placeholder="Buscar locais..." />
          </div>

        </div>
      </div>

      <div class="content-area">
        <div class="recommendplaces-grid">

          <!-- Categorias -->
          <div class="categories-sidebar">
            <h3>Categorias</h3>

            <div class="category-list">
              <button
                v-for="cat in categories"
                :key="cat.id"
                :class="['category-btn', { active: selectedCategory === cat.id }]"
                @click="selectCategory(cat.id)"
              >
                {{ cat.name }}
                <span class="article-count">{{ cat.count }}</span>
              </button>
            </div>
          </div>

          <!-- Locais -->
          <div class="articles-main">
            <div class="articles-grid">

              <div
                v-for="local in filteredLocais"
                :key="local.id"
                class="article-card"
                @click="openLocal(local)"
              >
                <div class="article-content">
                  <span class="article-category">{{ getCategoryName(local.category) }}</span>
                  <h3>{{ local.name }}</h3>
                  <p>{{ local.address }}</p>

                  <div class="article-meta">
                    <span>Lat: {{ local.lat }}</span>
                    <span>Lon: {{ local.lon }}</span>
                  </div>
                </div>
              </div>

            </div>

            <div v-if="filteredLocais.length === 0" class="no-articles">
              Nenhum local encontrado.
            </div>
          </div>

        </div>
      </div>

      <!-- MODAL COM MAPA -->
      <div
        v-if="activeLocal"
        class="modal-overlay"
        @click.self="closeModal"
      >
        <div class="modal-content">
          <button class="modal-close" @click="closeModal">&times;</button>

          <h2>{{ activeLocal.name }}</h2>
          <p class="article-category">{{ getCategoryName(activeLocal.category) }}</p>
          <p>{{ activeLocal.address }}</p>

          <!-- MAPA LEAFLET -->
          <div id="map" class="modal-map"></div>

          <div class="article-meta">
            <span>Latitude: {{ activeLocal.lat }}</span>
            <span>Longitude: {{ activeLocal.lon }}</span>
          </div>
        </div>
      </div>

    </div>
  </DashboardLayout>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, nextTick } from "vue";
import DashboardLayout from "@/layouts/DashboardLayout.vue";
import { MapPinIcon, SearchIcon } from "lucide-vue-next";
import L from "leaflet";

// Importar CSS do Leaflet (IMPORTANTE)
import "leaflet/dist/leaflet.css";

interface Local {
  id: string;
  name: string;
  address: string;
  category: string;
  lat: number;
  lon: number;
}

interface Category {
  id: string;
  name: string;
  count: number;
}

export default defineComponent({
  name: "RecommendPlaces",
  components: { DashboardLayout, MapPinIcon, SearchIcon },

  setup() {
    const cep = ref("01001-000"); // CEP inicial exibido
    const locais = ref<Local[]>([]);
    const searchQuery = ref("");
    const selectedCategory = ref("all");
    const activeLocal = ref<Local | null>(null);

    let map: L.Map | null = null;

    const categories = ref<Category[]>([
      { id: "all", name: "Todos", count: 0 },
      { id: "gym", name: "Academias", count: 0 },
      { id: "supplements", name: "Suplementos", count: 0 },
      { id: "markets", name: "Mercados", count: 0 }
    ]);

    // --- API Nominatim: Obter coordenadas pelo CEP ---
    const getCoordinatesByCep = async () => {
      const clean = cep.value.replace(/\D/g, "");

      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?postalcode=${clean}&country=Brazil&format=json`
      );

      const data = await response.json();
      if (!data.length) return null;

      return {
        lat: parseFloat(data[0].lat),
        lon: parseFloat(data[0].lon)
      };
    };

    // --- API OSM Overpass: buscar locais por categoria ---
    const buscarLocaisPorCategoria = async (lat: number, lon: number, tag: string) => {
      const query = `
        [out:json][timeout:25];
        (
          node[${tag}](around:2000, ${lat}, ${lon});
          way[${tag}](around:2000, ${lat}, ${lon});
        );
        out center;
      `;

      const res = await fetch("https://overpass-api.de/api/interpreter", {
        method: "POST",
        body: query
      });

      const json = await res.json();

      return json.elements.map((item: any) => ({
        id: String(item.id),
        name: item.tags.name || "Local sem nome",
        address: item.tags["addr:street"] || "Endereço não informado",
        lat: item.lat || item.center?.lat,
        lon: item.lon || item.center?.lon
      }));
    };

    // --- BUSCAR LOCAIS COMPLETOS ---
    const buscarLocais = async () => {
      const coords = await getCoordinatesByCep();
      if (!coords) return;

      const results: Local[] = [];

      const gyms = await buscarLocaisPorCategoria(coords.lat, coords.lon, "leisure=fitness_centre");
      results.push(...gyms.map(l => ({ ...l, category: "gym" })));

      const supplements = await buscarLocaisPorCategoria(coords.lat, coords.lon, "shop=nutrition");
      results.push(...supplements.map(l => ({ ...l, category: "supplements" })));

      const markets = await buscarLocaisPorCategoria(coords.lat, coords.lon, "shop=supermarket");
      results.push(...markets.map(l => ({ ...l, category: "markets" })));

      locais.value = results;

      categories.value.forEach(c => {
        if (c.id === "all") c.count = results.length;
        else c.count = results.filter(l => l.category === c.id).length;
      });
    };

    // --- FILTROS ---
    const filteredLocais = computed(() => {
      let list = locais.value;

      if (selectedCategory.value !== "all") {
        list = list.filter(l => l.category === selectedCategory.value);
      }

      if (searchQuery.value) {
        const q = searchQuery.value.toLowerCase();
        list = list.filter(l => l.name.toLowerCase().includes(q));
      }

      return list;
    });

    const selectCategory = (id: string) => (selectedCategory.value = id);

    const getCategoryName = (id: string) => {
      const c = categories.value.find(cat => cat.id === id);
      return c?.name || "Desconhecido";
    };

    // --- MODAL + MAPA ---
    const openLocal = async (local: Local) => {
      activeLocal.value = local;

      await nextTick();

      map = L.map("map", {
        zoomControl: false
      }).setView([local.lat, local.lon], 16);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);

      L.marker([local.lat, local.lon]).addTo(map);

      // Fix: ajustar tamanho do mapa dentro do modal
      setTimeout(() => {
        map?.invalidateSize();
      }, 200);
    };

    const closeModal = () => {
      activeLocal.value = null;
      if (map) {
        map.remove();
        map = null;
      }
    };

    // Carrega locais ao entrar
    onMounted(() => {
      buscarLocais();
    });

    return {
      cep,
      locais,
      searchQuery,
      categories,
      selectedCategory,
      filteredLocais,
      getCategoryName,
      selectCategory,
      activeLocal,
      openLocal,
      closeModal,
      buscarLocais
    };
  }
});
</script>

<!-- CSS COMPLETO COM AJUSTE PARA O MAPA -->
<style scoped>
.recommendplaces-content {
  width: 69vw;
}

.modal-map {
  height: 300px;
  width: 100%;
  margin-top: 20px;
  border-radius: 10px;
}

/* ----------------------------- */
/* SEU CSS ORIGINAL COMPLETO     */
/* ----------------------------- */

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

/* CEP INPUT */
.cep-box {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--input-bg);
  border: 1px solid var(--card-border);
  border-radius: 8px;
  padding: 8px 12px;
}

.cep-box input {
  border: none;
  background: none;
  outline: none;
  color: var(--input-text);
  flex: 1;
}

.cep-box button {
  background: var(--primary-color);
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
}

.search-box {
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

.recommendplaces-grid {
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

.article-card {
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: 12px;
  overflow: hidden;
  transition: 0.2s;
  cursor: pointer;
}

.article-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 16px rgba(0,0,0,0.08);
}

.article-content {
  padding: 20px;
}

.article-category {
  display: inline-block;
  background: var(--primary-color);
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  margin-bottom: 8px;
}

.articles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
}

.no-articles {
  text-align: center;
  margin-top: 20px;
  color: var(--color-text-secondary);
}

.modal-overlay {
  position: fixed;
  top: 0; left: 0;
  width: 100%; height: 100%;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: var(--card-bg);
  padding: 30px;
  border-radius: 12px;
  width: 90%;
  max-width: 700px;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
}

.modal-close {
  position: absolute;
  top: 10px; right: 10px;
  background: none;
  border: none;
  font-size: 28px;
  cursor: pointer;
}

.article-meta {
  display: flex;
  justify-content: space-between;
  color: var(--color-text-secondary);
  margin-top: 15px;
}

@media (max-width: 1024px) {
  .recommendplaces-grid {
    grid-template-columns: 1fr;
  }
}
</style>
