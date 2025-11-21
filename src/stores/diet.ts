import { defineStore } from 'pinia';
import { 
  getActiveDiet, 
  updateDailyTarget, 
  cancelDiet,
  type DietView, 
  type DietDailyTarget, 
  type CreateDietRequest, 
  createDiet 
} from '@/api/dietApi';

export interface DietState {
  diet: DietView | null;
  isLoading: boolean;
  error: string | null;
}

export const useDietStore = defineStore('diet', {
  state: (): DietState => ({
    diet: null,
    isLoading: false,
    error: null,
  }),

  actions: {
    async loadActiveDiet() {
      // Se já estiver carregando, não faça nada
      if (this.isLoading) return;

      this.isLoading = true;
      this.error = null;
      
      try {
        const dietData = await getActiveDiet();
        dietData.dailyTargets.sort((a, b) => new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime());
        this.diet = dietData;
      } catch (err: any) { 
        // então esta lógica está correta.
        if (err.message.includes('Nenhuma dieta ativa encontrada')) {
          this.diet = null; // Limpa a dieta se não houver
        } else {
          this.error = err.message || 'Erro desconhecido ao carregar dieta.';
        }
        console.error("Erro no loadActiveDiet:", err.message);
      } finally {
        this.isLoading = false;
      }
    },

    async createNewDiet(request: CreateDietRequest) {
      this.isLoading = true;
      this.error = null;
      try {
        const newDiet = await createDiet(request);
        newDiet.dailyTargets.sort((a, b) => new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime());
        this.diet = newDiet;
      } catch (err: any) {
        this.error = err.message || 'Erro desconhecido ao criar dieta.';
        throw err;
      } finally {
        this.isLoading = false;
      }
    },
    
    // ==========================================================
    // AÇÃO PARA O TODO 1
    // ==========================================================
    async updateTargetCalories(targetId: number, newCalories: number) {
      if (!this.diet) return;

      // Guarda o valor antigo para reverter em caso de erro
      const targetIndex = this.diet.dailyTargets.findIndex(d => d.id === targetId);
      if (targetIndex === -1) return;
      
      const oldCalories = this.diet.dailyTargets[targetIndex].adjustedCalories;
      
      // Atualização Otimista
      this.diet.dailyTargets[targetIndex].adjustedCalories = newCalories;

      try {
        // Chama a API
        const updatedTarget = await updateDailyTarget(targetId, newCalories);
        // Confirma a atualização (já está feito, mas isso sincroniza)
        this.diet.dailyTargets[targetIndex] = updatedTarget;
      } catch (err: any) {
        // Reverte em caso de erro
        this.diet.dailyTargets[targetIndex].adjustedCalories = oldCalories;
        this.error = `Falha ao atualizar meta: ${err.message}`;
        alert(`Erro: ${err.message}`);
      }
    },

    // ==========================================================
    // AÇÃO PARA O TODO 2
    // ==========================================================
    async cancelActiveDiet() {
      if (!this.diet) return;

      this.isLoading = true;
      this.error = null;
      
      try {
        await cancelDiet(this.diet.id);
        this.diet = null; // Limpa a dieta da store
      } catch (err: any) {
        this.error = `Falha ao cancelar dieta: ${err.message}`;
        alert(`Erro: ${err.message}`);
      } finally {
        this.isLoading = false;
      }
    },

    clearDiet() {
      this.diet = null;
      this.isLoading = false;
      this.error = null;
    },
    
  }
});