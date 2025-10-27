<template>
  <div class="meal-item">
    <div class="meal-details">
      <div class="meal-main-info">
        <input class="input-type" v-model="meal.type" placeholder="Tipo (ex: Café da manhã)" />
        <input class="input-desc" v-model="meal.description" placeholder="Descrição (ex: Arroz + frango)" />
      </div>
      <div class="meal-macros">
        <div class="macro-item">
          <label>Calorias</label>
          <input type="number" v-model.number="meal.calories" placeholder="0" />
        </div>
        <div class="macro-item">
          <label>Proteínas</label>
          <input type="number" v-model.number="meal.protein" placeholder="0" />
        </div>
        <div class="macro-item">
          <label>Carbs</label>
          <input type="number" v-model.number="meal.carbs" placeholder="0" />
        </div>
        <div class="macro-item">
          <label>Gorduras</label>
          <input type="number" v-model.number="meal.fat" placeholder="0" />
        </div>
      </div>
    </div>
    
    <div class="meal-actions">
      <button @click="$emit('remove', meal.id)" class="remove-btn" title="Remover refeição">
        <Trash2Icon :size="18" />
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import type { PropType } from 'vue'
import { Trash2Icon } from 'lucide-vue-next'

interface Meal {
  id?: number
  type: string
  description: string
  calories: number
  protein: number
  carbs: number
  fat: number
}

export default defineComponent({
  name: 'MealItem',
  // Adiciona o componente do ícone
  components: { Trash2Icon },
  props: {
    meal: {
      type: Object as PropType<Meal>,
      required: true
    }
  }
})
</script>

<style scoped>
.meal-item {
  display: flex;
  justify-content: space-between;
  /* Alinha o botão de lixeira ao topo dos inputs */
  align-items: flex-start;
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: 12px; /* Raio de borda mais suave */
  padding: 16px;
  gap: 16px; /* Espaço entre inputs e botão */
}

.meal-details {
  flex: 1; /* Ocupa todo o espaço disponível */
  display: flex;
  flex-direction: column;
  gap: 12px; /* Espaço entre a linha 1 (info) e linha 2 (macros) */
}

.meal-main-info {
  display: flex;
  gap: 12px;
}

.input-type {
  flex: 1; /* 1/3 do espaço */
}

.input-desc {
  flex: 2; /* 2/3 do espaço, descrição é maior */
}

.meal-macros {
  display: grid;
  /* Cria 4 colunas de tamanho igual */
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.macro-item {
  display: flex;
  flex-direction: column;
  gap: 4px; /* Espaço entre o label e o input */
}

.macro-item label {
  font-size: 12px;
  color: var(--color-text-secondary);
  font-weight: 500;
  text-transform: uppercase;
}

/* Estilização global dos inputs neste componente */
input {
  width: 100%;
  box-sizing: border-box; /* Garante que o padding não quebre o layout */
  background: var(--input-bg, var(--color-background));
  border: 1px solid var(--card-border);
  color: var(--color-text);
  padding: 8px 10px;
  border-radius: 6px;
  font-size: 14px;
  transition: all 0.2s;
}

input:focus {
  outline: none;
  border-color: var(--primary-color);
  /* Anel de foco sutil */
  box-shadow: 0 0 0 3px var(--input-focus-ring, rgba(59, 130, 246, 0.2));
}

/* Esconde as setas de inputs numéricos */
input[type=number]::-webkit-inner-spin-button,
input[type=number]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
input[type=number] {
  -moz-appearance: textfield;
}

/* Ações (Botão) */
.meal-actions {
  margin-left: 8px;
}

.remove-btn {
  background: transparent;
  border: none;
  color: var(--danger-color, #ef4444); /* Cor de perigo */
  cursor: pointer;
  padding: 8px; /* Área de clique maior */
  border-radius: 6px;
  transition: all 0.2s;
}

.remove-btn:hover {
  /* Fundo vermelho sutil no hover */
  background: rgba(239, 68, 68, 0.1); 
}
</style>