<template>
  <DashboardLayout>
    <div class="goals-content">
      <div class="content-header">
        <h1>
          <TargetIcon :size="24" class="header-icon" />
          Metas e Progresso
        </h1>
        <div class="header-actions">
          <button @click="showGoalModal = true" class="add-goal-btn">
            <PlusIcon :size="16" /> Nova Meta
          </button>
        </div>
      </div>

      <div class="content-area">
        <div class="goals-grid">
          <!-- Metas ativas -->
          <div class="goals-section">
            <h2>Metas Ativas</h2>
            <div class="goals-list">
              <div v-for="goal in activeGoals" :key="goal.id" class="goal-card">
                <div class="goal-header">
                  <h3>{{ goal.title }}</h3>
                  <span class="goal-deadline">{{ goal.deadline }}</span>
                </div>
                <p class="goal-description">{{ goal.description }}</p>
                <div class="goal-progress">
                  <div class="progress-bar">
                    <div class="progress-fill" :style="{ width: goal.progress + '%' }"></div>
                  </div>
                  <span class="progress-text">{{ goal.progress }}%</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Progresso físico -->
          <div class="progress-section">
            <h2>Progresso Físico</h2>
            <div class="progress-container">
              
              <!-- Sexo -->
              <div class="gender-selector">
                <button :class="{ active: gender === 'F' }" @click="gender = 'F'">F</button>
                <button :class="{ active: gender === 'M' }" @click="gender = 'M'">M</button>
              </div>

              <!-- Imagem -->
              <div class="progress-figure">
                <img
                  :src="currentStatus.imageUrl"
                  alt="Figura corporal"
                  class="body-image"
                />
              </div>

              <!-- Peso + IMC -->
              <div class="progress-card">
                <div class="progress-value">{{ currentWeight }}kg</div>
                <div class="progress-label">Peso Atual</div>
                <div
                  class="progress-change"
                  :class="{ positive: weightChange >= 0, negative: weightChange < 0 }"
                >
                  {{ weightChange >= 0 ? '+' : '' }}{{ weightChange }}kg
                </div>

                <!-- Slider -->
                <input
                  type="range"
                  min="30"
                  max="350"
                  step="0.5"
                  v-model="currentWeight"
                  class="weight-slider"
                />

                <!-- IMC -->
                <div class="bmi-info" :class="bmiClass">
                  IMC: {{ bmi.toFixed(1) }} - {{ bmiCategory }}
                </div>

                <!-- Descrição -->
                <div class="status-description">
                  {{ currentStatus.description }}
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
import { TargetIcon, PlusIcon } from 'lucide-vue-next'

interface Goal {
  id: number
  title: string
  description: string
  deadline: string
  progress: number
}

export default defineComponent({
  name: 'Goals',
  components: { DashboardLayout, TargetIcon, PlusIcon },
  setup() {
    const showGoalModal = ref(false)

    // 🔹 Estes valores podem vir do User.java futuramente
    const gender = ref<'F' | 'M'>('F')
    const currentWeight = ref(75)
    const weightChange = ref(-2.3)
    const height = ref(1.70)

    const activeGoals = ref<Goal[]>([
      { id: 1, title: 'Perder 5kg', description: 'Reduzir peso para atingir IMC ideal', deadline: '30/12/2024', progress: 60 },
      { id: 2, title: 'Aumentar massa muscular', description: 'Ganhar 2kg de massa magra', deadline: '15/01/2025', progress: 30 }
    ])

    // 🔸 Mapeamento de status de peso (usando imagens da pasta public)
    const weightStatusMap = {
      'F': [
        { maxWeight: 60, status: 'Fitness', imageUrl: '/F-Fitness-60.png', description: 'Abaixo de 12% de gordura corporal. Excelente.' },
        { maxWeight: 75, status: 'Saudável', imageUrl: '/F-Saudável-75.png', description: 'Sugerido entre 13-20% de gordura corporal. Ótimo.' },
        { maxWeight: 85, status: 'Mediano', imageUrl: '/F-Mediano-85.png', description: 'Sugerido entre 21-25% de gordura corporal.' },
        { maxWeight: 100, status: 'Sobrepeso', imageUrl: '/F-Sobrepeso-100.png', description: 'Sugerido entre 26-29% de gordura corporal.' },
        { maxWeight: 350, status: 'Obesidade', imageUrl: '/F-Obesidade-120.png', description: 'Mais de 30% de gordura corporal. Alto risco.' }
      ],
      'M': [
        { maxWeight: 60, status: 'Fitness', imageUrl: '/M-Fitness-60.png', description: 'Abaixo de 10% de gordura corporal. Excelente.' },
        { maxWeight: 75, status: 'Saudável', imageUrl: '/M-Saudável-75.png', description: 'Sugerido entre 10-15% de gordura corporal. Ótimo.' },
        { maxWeight: 85, status: 'Mediano', imageUrl: '/M-Mediano-85.png', description: 'Sugerido entre 15-20% de gordura corporal.' },
        { maxWeight: 100, status: 'Sobrepeso', imageUrl: '/M-Sobrepeso-100.png', description: 'Sugerido entre 20-25% de gordura corporal.' },
        { maxWeight: 350, status: 'Obesidade', imageUrl: '/M-Obesidade-120.png', description: 'Mais de 25% de gordura corporal. Alto risco.' }
      ]
    }

    // 🔸 Status atual com base no peso
    const currentStatus = computed(() => {
      const list = weightStatusMap[gender.value]
      return list.find(item => currentWeight.value <= item.maxWeight) || list[list.length - 1]
    })

    // 🔸 IMC cálculo
    const bmi = computed(() => currentWeight.value / (height.value * height.value))

    const bmiCategory = computed(() => {
      const v = bmi.value
      if (v < 18.5) return 'Abaixo do peso'
      if (v < 25) return 'Saudável'
      if (v < 30) return 'Sobrepeso'
      if (v < 35) return 'Obesidade I'
      if (v < 40) return 'Obesidade II'
      return 'Obesidade III'
    })

    const bmiClass = computed(() => {
      const v = bmi.value
      if (v < 18.5) return 'bmi-low'
      if (v < 25) return 'bmi-ok'
      if (v < 30) return 'bmi-mid'
      if (v < 35) return 'bmi-high'
      return 'bmi-very-high'
    })

    return {
      showGoalModal,
      activeGoals,
      currentWeight,
      weightChange,
      gender,
      height,
      bmi,
      bmiCategory,
      bmiClass,
      currentStatus
    }
  }
})
</script>

<style scoped>
.goals-content { width: 69vw; }

/* ===== Gênero e Imagem ===== */
.progress-container {
  display: flex;
  align-items: center;
  gap: 40px;
  flex-wrap: wrap;
  justify-content: center;
}
.gender-selector {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.gender-selector button {
  width: 45px;
  height: 45px;
  font-size: 20px;
  font-weight: bold;
  border-radius: 50%;
  border: 2px solid var(--primary-color);
  background: transparent;
  color: var(--primary-color);
  cursor: pointer;
  transition: 0.2s;
}
.gender-selector button.active {
  background: var(--primary-color);
  color: white;
}
.progress-figure {
  display: flex;
  justify-content: center;
  align-items: center;
}
.body-image {
  width: 140px;
  height: auto;
  border-radius: 8px;
  background: var(--card-bg);
  padding: 8px;
}

/* ===== Peso e IMC ===== */
.progress-card {
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: 12px;
  padding: 24px;
  text-align: center;
  width: 240px;
}
.progress-value {
  font-size: 32px;
  font-weight: bold;
  color: var(--primary-color);
  margin-bottom: 8px;
}
.progress-label {
  color: var(--color-text-secondary);
  margin-bottom: 8px;
}
.progress-change {
  font-weight: 600;
  font-size: 14px;
}
.progress-change.positive { color: #10b981; }
.progress-change.negative { color: #ef4444; }

/* ===== Slider ===== */
.weight-slider {
  width: 100%;
  margin-top: 12px;
  appearance: none;
  height: 4px;
  background: var(--primary-color);
  border-radius: 4px;
  outline: none;
  cursor: pointer;
  opacity: 0.7;
  transition: opacity 0.2s;
}
.weight-slider:hover { opacity: 1; }

/* ===== IMC ===== */
.bmi-info {
  margin-top: 12px;
  font-weight: 600;
  font-size: 14px;
  border-radius: 8px;
  padding: 6px 10px;
}
.bmi-low { color: #3b82f6; }
.bmi-ok { color: #10b981; }
.bmi-mid { color: #facc15; }
.bmi-high { color: #f97316; }
.bmi-very-high { color: #ef4444; }

.status-description {
  margin-top: 10px;
  font-size: 13px;
  color: var(--color-text-secondary);
}
/* ===== Figura corporal ===== */
.progress-figure {
  position: relative;
  width: 220px;
  height: 280px; /* 🔹 tamanho fixo e uniforme */
  display: flex;
  justify-content: center;
  align-items: center;
  background: var(--card-bg);
  border-radius: 12px;
  padding: 8px;
  overflow: hidden;
}

.body-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain; /* 🔹 mantém proporção */
  transition: transform 0.3s ease-in-out;
}

/* ===== Animação suave na troca de imagem ===== */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.4s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

/* ===== Efeito sutil ao trocar peso/gênero ===== */
.body-image:hover {
  transform: scale(1.02);
}


</style>
