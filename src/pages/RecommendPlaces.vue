<template>
  <DashboardLayout>
    <div class="recommendplaces-content">

      <div class="content-header">
        <h1>
          <MapPinIcon :size="24" class="header-icon" />
          Locais Recomendados
        </h1>

        <div class="header-actions">

          <button class="btn-location" @click="usarLocalAtual" title="Usar minha localização atual">
            <NavigationIcon :size="18" />
            <span>Usar Local Atual</span>
          </button>

          <div class="cep-box">
            <input v-model="cep" placeholder="Digite seu CEP..." @keyup.enter="buscarPorCep" />
            <button @click="buscarPorCep">Buscar CEP</button>
          </div>

          <div class="search-box">
            <SearchIcon :size="16" />
            <input v-model="searchQuery" placeholder="Filtrar locais..." />
          </div>

        </div>
      </div>

      <div class="content-area">
        <div class="recommendplaces-grid">

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

          <div class="articles-main">

            <div v-if="loading" class="loading-state">
              Carregando locais próximos, aguarde...
            </div>

            <div v-else class="articles-grid">
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
                    <span>Ver detalhes no mapa</span>
                  </div>
                </div>
              </div>
            </div>

            <div v-if="!loading && filteredLocais.length === 0" class="no-articles">
              Nenhum local encontrado. Tente um CEP diferente ou ajuste o filtro.
            </div>
          </div>

        </div>
      </div>

      <div
        v-if="activeLocal"
        class="modal-overlay"
        @click.self="closeModal"
      >
        <div class="modal-content">
          <button class="modal-close" @click="closeModal">×</button>

          <div class="modal-header">
            <div>
              <h2>{{ activeLocal.name }}</h2>
              <p class="article-category">{{ getCategoryName(activeLocal.category) }}</p>
            </div>

            <a
              :href="getGoogleMapsUrl(activeLocal)"
              target="_blank"
              class="btn-google-maps"
            >
              <MapIcon :size="18" />
              Abrir no Google Maps
            </a>
          </div>

          <p class="modal-address">{{ activeLocal.address }}</p>

          <div id="map" class="modal-map"></div>

          <div class="article-meta">
            <span>Lat: {{ activeLocal.lat }}</span>
            <span>Lon: {{ activeLocal.lon }}</span>
          </div>
        </div>
      </div>

    </div>
  </DashboardLayout>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, nextTick } from "vue";
import DashboardLayout from "@/layouts/DashboardLayout.vue";
import { MapPinIcon, SearchIcon, NavigationIcon, MapIcon } from "lucide-vue-next";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// --- Interfaces (Tipagem) ---
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

// ⚠️ CORREÇÃO CRÍTICA DO LEAFLET:
// Garante que o ícone do marcador do Leaflet seja exibido corretamente em ambientes Vue/Webpack.
// Esta parte deve ser executada apenas uma vez, idealmente antes de qualquer inicialização do mapa.
// @ts-ignore
if (typeof L.Icon.Default.prototype._getIconUrl !== 'function') {
  // @ts-ignore
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
  });
}

export default defineComponent({
  name: "RecommendPlaces",
  components: { DashboardLayout, MapPinIcon, SearchIcon, NavigationIcon, MapIcon },

  setup() {
    const cep = ref("12210-180");
    const locais = ref<Local[]>([]);
    const searchQuery = ref("");
    const selectedCategory = ref("all");
    const activeLocal = ref<Local | null>(null);
    const loading = ref(false);

    let map: L.Map | null = null;

    const categories = ref<Category[]>([
      { id: "all", name: "Todos", count: 0 },
      { id: "gym", name: "Academias", count: 0 },
      { id: "supplements", name: "Suplementos", count: 0 },
      { id: "markets", name: "Mercados", count: 0 }
    ]);

    // --- 1. Obter coordenadas (Lógica Híbrida: BrasilAPI + Nominatim) ---
    const getCoordinatesByCep = async (cepString: string) => {
      const cleanCep = cepString.replace(/\D/g, "");

      if (cleanCep.length !== 8) {
        alert("O CEP deve ter 8 dígitos.");
        return null;
      }

      console.log(`Buscando coordenadas para CEP: ${cleanCep}`);

      try {
        // PASSO 1: Tenta BrasilAPI v2 (para validar e obter coordenadas diretas)
        const responseBrasil = await fetch(`https://brasilapi.com.br/api/cep/v2/${cleanCep}`);

        if (!responseBrasil.ok) {
          // 🛑 ERRO AQUI: CEP não encontrado na base do BrasilAPI.
          const errorData = await responseBrasil.json();
          throw new Error(`[BrasilAPI Erro ${responseBrasil.status}]: ${errorData.message || 'CEP não encontrado.'}`);
        }

        const data = await responseBrasil.json();

        // Cenário A: BrasilAPI retornou as coordenadas direto
        if (data.location && data.location.coordinates) {
          const lat = parseFloat(data.location.coordinates.latitude || data.location.coordinates[1]);
          const lon = parseFloat(data.location.coordinates.longitude || data.location.coordinates[0]);
          return { lat, lon };
        }

        // Cenário B: Fallback para Nominatim (buscar pelo endereço)
        if (data.street && data.city && data.state) {
          const queryAddress = `${data.street}, ${data.city} - ${data.state}, Brazil`;

          const responseNominatim = await fetch(
            `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(queryAddress)}&format=json&limit=1`
          );

          const dataNominatim = await responseNominatim.json();

          if (dataNominatim.length > 0) {
            return {
              lat: parseFloat(dataNominatim[0].lat),
              lon: parseFloat(dataNominatim[0].lon)
            };
          }
        }

        // Cenário C: Fallback para Cidade (como último recurso)
        if (data.city && data.state) {
          const queryCity = `${data.city}, ${data.state}, Brazil`;
          const responseCity = await fetch(
            `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(queryCity)}&format=json&limit=1`
          );
          const dataCity = await responseCity.json();
          if (dataCity.length > 0) {
            return {
              lat: parseFloat(dataCity[0].lat),
              lon: parseFloat(dataCity[0].lon)
            };
          }
        }

        throw new Error("Não foi possível geolocalizar este endereço com as APIs.");

      } catch (error: any) {
        // 🚨 NOVO: Alerta o usuário exatamente sobre o erro
        console.error("Erro na busca de coordenadas:", error.message);
        alert(`Erro na busca de CEP: ${error.message}`);
        return null;
      }
    };

    // --- 2. Buscar Locais no Overpass ---
    const carregarLocaisPorCoordenadas = async (lat: number, lon: number) => {
      loading.value = true;
      locais.value = []; // LIMPA A LISTA ANTIGA
      selectedCategory.value = "all"; // NOVO: Reseta a categoria selecionada

      console.log(`Carregando locais próximos a Lat: ${lat}, Lon: ${lon}`);
      // ... (Restante da lógica do Overpass inalterada) ...

      try {
        const results: Local[] = [];

        const fetchCategory = async (tag: string, catId: string) => {
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

          if (!res.ok) {
            console.warn(`Overpass erro ${res.status} para ${catId}. Tentando continuar.`);
            return [];
          }

          const json = await res.json();
          return json.elements.map((item: any) => ({
            id: String(item.id),
            name: item.tags.name || "Local sem nome",
            address: item.tags["addr:street"]
              ? `${item.tags["addr:street"]}, ${item.tags["addr:housenumber"] || ''}`
              : "Endereço não detalhado",
            category: catId,
            lat: item.lat || item.center?.lat,
            lon: item.lon || item.center?.lon
          }));
        };

        const [gyms, supplements, markets] = await Promise.all([
          fetchCategory("leisure=fitness_centre", "gym"),
          fetchCategory("shop=nutrition", "supplements"),
          fetchCategory("shop=supermarket", "markets")
        ]);

        results.push(...gyms, ...supplements, ...markets);
        locais.value = results;

        categories.value.forEach(c => {
          if (c.id === "all") c.count = results.length;
          else c.count = results.filter(l => l.category === c.id).length;
        });

      } catch (error) {
        console.error("Erro ao buscar locais no Overpass:", error);
        alert("Erro ao carregar locais. O servidor de mapas pode estar indisponível.");
      } finally {
        loading.value = false;
      }

    };

    // --- 3. Ação do Botão Buscar CEP ---
      const buscarPorCep = async () => {
      // Garante que o CEP atual é válido antes de tentar buscar.
      const cleanCep = cep.value.replace(/\D/g, "");
      if (cleanCep.length !== 8) {
          alert("Por favor, digite um CEP válido com 8 dígitos.");
          return;
      }

      // FIX CRÍTICO: Limpa o filtro de texto e reseta a categoria ao fazer nova busca
      searchQuery.value = "";
      selectedCategory.value = "all";

      loading.value = true;
      const coords = await getCoordinatesByCep(cep.value);

      if (coords) {
        await carregarLocaisPorCoordenadas(coords.lat, coords.lon);
      } else {
        // A mensagem de erro específica já foi exibida no getCoordinatesByCep
        loading.value = false;
      }
    };

    // --- 4. Ação Usar Local Atual (GPS) ---
    const usarLocalAtual = () => {
      if (!navigator.geolocation) {
        alert("Geolocalização não suportada neste navegador.");
        return;
      }

      // Limpa filtro e reseta categoria
      searchQuery.value = "";
      selectedCategory.value = "all";
      loading.value = true;

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          cep.value = "Local Atual (GPS)"; // Atualiza o campo CEP para mostrar a fonte
          await carregarLocaisPorCoordenadas(latitude, longitude);
        },
        (error) => {
          console.error(error);
          alert("Permissão de localização negada ou erro no GPS.");
          loading.value = false;
        }
      );
    };

    // --- 5. Utilitários (Filtros e View) ---
    const filteredLocais = computed(() => {
      let list = locais.value;
      if (selectedCategory.value !== "all") {
        list = list.filter(l => l.category === selectedCategory.value);
      }
      if (searchQuery.value) {
        const q = searchQuery.value.toLowerCase();
        // Filtra pelo nome OU endereço
        list = list.filter(l => l.name.toLowerCase().includes(q) || l.address.toLowerCase().includes(q));
      }
      return list;
    });

    const selectCategory = (id: string) => (selectedCategory.value = id);
    const getCategoryName = (id: string) => categories.value.find(c => c.id === id)?.name || "Outro";

    const getGoogleMapsUrl = (local: Local) => {
      // 🚨 CORREÇÃO CRÍTICA DO URL: Sintaxe correta para linkar o Google Maps com coordenadas
      return `https://maps.google.com/?q=${local.lat},${local.lon}`;
    };

    // --- 6. Modal e Mapa Leaflet ---
    const openLocal = async (local: Local) => {
      activeLocal.value = local;
      await nextTick(); // Espera a DOM atualizar (o modal aparecer)

      // Remove a instância anterior do mapa, se existir
      if (map) { map.remove(); map = null; }

      // Inicializa um novo mapa na div "map"
      map = L.map("map", { zoomControl: false }).setView([local.lat, local.lon], 16);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '© OpenStreetMap contributors'
      }).addTo(map);

      // Adiciona o marcador
      L.marker([local.lat, local.lon]).addTo(map)
          .bindPopup(`<b>${local.name}</b><br>${local.address}`).openPopup(); // Adiciona popup

      // Mapeia a tela novamente para garantir que a área da div "map" seja reconhecida
      setTimeout(() => { map?.invalidateSize(); }, 250);
    };

    const closeModal = () => {
      activeLocal.value = null;
      if (map) { map.remove(); map = null; }
    };

    // --- 7. Inicialização ---
    onMounted(() => {
      buscarPorCep(); // Carrega o CEP padrão ao iniciar
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
      buscarPorCep,
      usarLocalAtual,
      loading,
      getGoogleMapsUrl
    };
  }
});
</script>

/* ESTILOS (CSS)              */
<style scoped>
.recommendplaces-content {
  width: 69vw;
}

/* Header Styles */
.content-header {
  background: var(--card-bg);
  padding: 20px 30px;
  border-bottom: 1px solid var(--card-border);
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: 10px;
  flex-wrap: wrap;
  gap: 15px;
}

.content-header h1 {
  margin: 0;
  font-size: 24px;
  color: var(--color-heading);
  display: flex;
  align-items: center;
  gap: 10px;
}

.header-actions {
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
}

.header-icon {
  color: var(--primary-color);
}

/* Botão Local Atual */
.btn-location {
  display: flex;
  align-items: center;
  gap: 6px;
  background: transparent;
  border: 1px solid var(--primary-color);
  color: var(--primary-color);
  padding: 8px 12px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-location:hover {
  background: var(--primary-color);
  color: white;
}

/* CEP & Search */
.cep-box, .search-box {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--input-bg);
  border: 1px solid var(--card-border);
  border-radius: 8px;
  padding: 6px 12px;
  height: 40px;
}

.cep-box input, .search-box input {
  border: none;
  background: none;
  outline: none;
  color: var(--input-text);
  width: 120px; /* Tamanho fixo para não quebrar layout */
}

.search-box input {
  width: 150px;
}

.cep-box button {
  background: var(--primary-color);
  color: white;
  border: none;
  padding: 4px 10px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
}

/* Grid Layout */
.content-area {
  padding: 30px;
}

.recommendplaces-grid {
  display: grid;
  grid-template-columns: 250px 1fr;
  gap: 30px;
}

/* Sidebar */
.categories-sidebar h3 {
  margin-bottom: 16px;
  color: var(--color-heading);
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
}

.category-btn.active .article-count {
  background: rgba(255,255,255,0.2);
  color: white;
}

/* Articles Grid */
.articles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
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
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  margin-bottom: 8px;
  text-transform: uppercase;
}

.loading-state, .no-articles {
  text-align: center;
  padding: 40px;
  color: var(--color-text-secondary);
  width: 100%;
}

/* MODAL */
.modal-overlay {
  position: fixed;
  top: 0; left: 0;
  width: 100%; height: 100%;
  background: rgba(0,0,0,0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  backdrop-filter: blur(2px);
}

.modal-content {
  background: var(--card-bg);
  padding: 30px;
  border-radius: 16px;
  width: 90%;
  max-width: 700px;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  border: 1px solid var(--card-border);
  box-shadow: 0 20px 50px rgba(0,0,0,0.3);
}

.modal-close {
  position: absolute;
  top: 15px; right: 20px;
  background: none;
  border: none;
  font-size: 28px;
  cursor: pointer;
  color: var(--color-text);
  z-index: 10;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 15px;
  flex-wrap: wrap;
  gap: 15px;
  padding-right: 30px;
}

.modal-header h2 {
  margin: 0 0 5px 0;
  font-size: 24px;
}

.modal-address {
  color: var(--color-text-secondary);
  margin-bottom: 20px;
}

/* Botão Google Maps no Modal */
.btn-google-maps {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: #4285F4; /* Cor do Google */
  color: white;
  padding: 10px 16px;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 500;
  font-size: 14px;
  transition: background 0.2s;
}

.btn-google-maps:hover {
  background: #3367D6;
}

.modal-map {
  height: 350px;
  width: 100%;
  border-radius: 12px;
  margin-bottom: 15px;
  z-index: 1;
}

.article-meta {
  font-size: 12px;
  color: var(--color-text-secondary);
  display: flex;
  gap: 15px;
}

@media (max-width: 1024px) {
  .recommendplaces-grid {
    grid-template-columns: 1fr;
  }
  .header-actions {
    width: 100%;
    justify-content: space-between;
  }
}
</style>
