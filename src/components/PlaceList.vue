<template>
    <div class="places-container">
      <div v-for="(place, index) in places" :key="index" class="place-card">
        <div class="place-header">
          <div class="icon-box">
            <MapPinIcon :size="20" />
          </div>
          <div class="place-info">
            <h4>{{ place.nome }}</h4>
            <span class="place-address">{{ place.endereco }}</span>
          </div>
        </div>
        
        <div class="place-details">
          <div class="rating" v-if="place.nota !== 'N/A'">
            <StarIcon :size="14" class="star-icon" />
            <span>{{ place.nota }}</span>
          </div>
          <div class="status" :class="{ open: place.status.includes('Aberto') }">
            <ClockIcon :size="14" />
            <span>{{ place.status }}</span>
          </div>
        </div>
  
        <a 
          :href="`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.nome + ' ' + place.endereco)}`" 
          target="_blank" 
          class="maps-btn"
        >
          Ver no Mapa
        </a>
      </div>
    </div>
  </template>
  
  <script lang="ts">
  import { defineComponent, type PropType } from 'vue'
  import { MapPin as MapPinIcon, Star as StarIcon, Clock as ClockIcon } from 'lucide-vue-next'
  
  export interface Place {
    nome: string;
    endereco: string;
    nota: string | number;
    status: string;
  }
  
  export default defineComponent({
    name: 'PlaceList',
    components: { MapPinIcon, StarIcon, ClockIcon },
    props: {
      places: {
        type: Array as PropType<Place[]>,
        required: true
      }
    }
  })
  </script>
  
  <style scoped>
  .places-container {
    display: flex;
    gap: 12px;
    overflow-x: auto;
    padding: 10px 4px;
    margin-top: 10px;
    /* Scrollbar fina */
    scrollbar-width: thin;
    scrollbar-color: var(--card-border) transparent;
  }
  
  .places-container::-webkit-scrollbar {
    height: 6px;
  }
  .places-container::-webkit-scrollbar-thumb {
    background: var(--card-border);
    border-radius: 3px;
  }
  
  .place-card {
    min-width: 240px;
    max-width: 240px;
    background: var(--color-background); /* Fundo contrastante com o balão */
    border: 1px solid var(--card-border);
    border-radius: 12px;
    padding: 12px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    flex-shrink: 0;
    transition: transform 0.2s;
  }
  
  .place-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  }
  
  .place-header {
    display: flex;
    gap: 10px;
    align-items: flex-start;
  }
  
  .icon-box {
    background: #e0e7ff; /* Azul clarinho */
    color: #4f46e5;
    padding: 8px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .place-info {
    flex: 1;
    overflow: hidden;
  }
  
  .place-info h4 {
    margin: 0;
    font-size: 14px;
    font-weight: 600;
    color: var(--color-heading);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .place-address {
    font-size: 11px;
    color: var(--color-text-secondary);
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  
  .place-details {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 12px;
  }
  
  .rating {
    display: flex;
    align-items: center;
    gap: 4px;
    font-weight: 600;
    color: #f59e0b; /* Amarelo ouro */
  }
  
  .star-icon {
    fill: #f59e0b;
  }
  
  .status {
    display: flex;
    align-items: center;
    gap: 4px;
    color: #ef4444; /* Vermelho padrão */
  }
  
  .status.open {
    color: #10b981; /* Verde */
  }
  
  .maps-btn {
    margin-top: auto;
    text-align: center;
    background: var(--card-border);
    color: var(--color-text);
    text-decoration: none;
    padding: 6px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 500;
    transition: background 0.2s;
  }
  
  .maps-btn:hover {
    background: var(--primary-color);
    color: white;
  }
  </style>