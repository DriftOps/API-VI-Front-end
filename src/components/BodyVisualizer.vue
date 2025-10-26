<template>
    <div class="body-visualizer">
      <div v-if="currentStatus" class="status-display">
        <img
          :src="getImagePath(currentStatus.imageUrl)"
          class="body-status-image"
          :alt="currentStatus.status"
          :title="currentStatus.description"
        />
        <p class="status-label">{{ currentStatus.status }}</p>
        </div>
      <div v-else class="status-display placeholder">
        <p>...</p>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { computed, toRefs } from 'vue';
  
  interface WeightStatus {
    maxWeight: number | typeof Infinity;
    status: string;
    imageUrl: string;
    description: string;
  }
  
  // Props que o componente recebe
  const props = defineProps<{
    gender?: string | null; // 'M' ou 'F'
    weight?: number | null;
  }>();
  
  // Usar toRefs para manter reatividade ao desestruturar props
  const { gender, weight } = toRefs(props);
  
  // Mapa de status (interno ao componente)
  const weightStatusMap: Record<'M' | 'F', WeightStatus[]> = {
      'F': [
          // Ordem do mais pesado para o mais leve
          { maxWeight: Infinity, status: 'Obesidade Severa', imageUrl: 'F-Obesidade-120.png', description: 'Acima de 35% de gordura corporal.' },
          { maxWeight: 120, status: 'Obesidade II', imageUrl: 'F-Obesidade-120.png', description: 'Entre 30-35%.' },
          { maxWeight: 100, status: 'Obesidade I', imageUrl: 'F-Sobrepeso-100.png', description: 'Entre 26-29%.' },
          { maxWeight: 85, status: 'Sobrepeso', imageUrl: 'F-Mediano-85.png', description: 'Entre 21-25%.' },
          { maxWeight: 75, status: 'Peso Normal', imageUrl: 'F-Saudável-75.png', description: 'Entre 13-20%.' },
          { maxWeight: 60, status: 'Fitness', imageUrl: 'F-Fitness-60.png', description: 'Abaixo de 12%.' },
          { maxWeight: 45, status: 'Abaixo do Peso', imageUrl: 'F-Fitness-60.png', description: 'Considere avaliação.' }
      ],
      'M': [
          { maxWeight: Infinity, status: 'Obesidade Severa', imageUrl: 'M-Obesidade-120.png', description: 'Acima de 30% de gordura corporal.' },
          { maxWeight: 120, status: 'Obesidade II', imageUrl: 'M-Obesidade-120.png', description: 'Entre 25-30%.' },
          { maxWeight: 100, status: 'Obesidade I', imageUrl: 'M-Sobrepeso-100.png', description: 'Entre 20-25%.' },
          { maxWeight: 85, status: 'Sobrepeso', imageUrl: 'M-Mediano-85.png', description: 'Entre 15-20%.' },
          { maxWeight: 75, status: 'Peso Normal', imageUrl: 'M-Saudável-75.png', description: 'Entre 10-15%.' },
          { maxWeight: 60, status: 'Fitness', imageUrl: 'M-Fitness-60.png', description: 'Abaixo de 10%.' },
          { maxWeight: 50, status: 'Abaixo do Peso', imageUrl: 'M-Fitness-60.png', description: 'Considere avaliação.' }
      ]
  };
  
  const getStatusForWeight = (w: number | null | undefined, g: string | null | undefined): WeightStatus | null => {
      const currentGender = g === 'F' ? 'F' : 'M'; // Default para 'M'
      if (w === null || w === undefined || w <= 0) return null;
  
      const genderMap = weightStatusMap[currentGender];
      // Encontra o status cujo maxWeight é >= w (mapa ordenado do maior maxWeight para o menor)
      // Ajuste da lógica: encontra o *primeiro* cujo limite *inferior* (maxWeight do próximo item) é menor que o peso
      for (let i = 0; i < genderMap.length; i++) {
          const currentLimit = genderMap[i].maxWeight;
          // O limite inferior é o maxWeight do próximo item, ou 0 para o último
          const lowerLimit = (i + 1 < genderMap.length) ? genderMap[i+1].maxWeight : 0;
          if (w > lowerLimit && (currentLimit === Infinity || w <= currentLimit)) {
               return genderMap[i];
          }
      }
       return genderMap[genderMap.length - 1]; // Fallback para o mais leve
  };
  
  
  const currentStatus = computed(() => getStatusForWeight(weight.value, gender.value));
  
  const getImagePath = (imageName: string | undefined) => {
    return imageName ? `/${imageName}` : '';
  };
  </script>
  
  <style scoped>
  .body-visualizer {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 180px; /* Garante altura mínima */
  }
  .status-display {
    text-align: center;
  }
  .body-status-image {
    max-width: 100px; /* Tamanho da imagem */
    max-height: 140px;
    height: auto;
    object-fit: contain;
    margin-bottom: 5px;
    display: block; /* Remove espaço extra abaixo */
    margin-left: auto;
    margin-right: auto;
  }
  .status-label {
      font-weight: 600;
      font-size: 0.9em;
      color: var(--color-heading);
      margin: 5px 0 0 0;
  }
  .description-text {
    font-size: 0.8em;
    color: var(--color-text-secondary);
    margin-top: 2px;
  }
  .placeholder p {
      color: var(--color-text-secondary);
  }
  </style>