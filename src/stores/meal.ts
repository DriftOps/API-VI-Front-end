import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'
import { useUserStore } from './user'

export interface Meal {
  id?: number
  type: string
  description: string
  calories: number
  protein: number
  carbs: number
  fat: number
  date?: string
}

const API_URL = import.meta.env.VITE_API_URL + '/api/meals'

export const useMealStore = defineStore('meal', () => {
  const userStore = useUserStore()
  const meals = ref<Meal[]>([])
  const selectedDate = ref<string | null>(null)

  const fetchMeals = async (date?: string) => {
    const params: any = {}
    if (selectedDate.value) params.date = selectedDate.value

    try {
      const res = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${userStore.user?.token}` },
        params
      })

      meals.value = Array.isArray(res.data) ? res.data : []

    } catch (error) {
      console.error("Erro ao buscar refeições:", error)
      meals.value = [] // Garante que seja um array em caso de erro
    }
  }

  const setDateAndFetch = async (dateString: string) => {
    console.log(`Ação: Definindo data para ${dateString}`);
    
    
    selectedDate.value = dateString;
    
   
    await fetchMeals();
  }

  const addMeal = async () => {
    const dateForNewMeal = selectedDate.value || new Date().toISOString().substr(0, 10);

    const newMealPayload = {
      type: 'Novo tipo', 
      description: 'Nova descrição', 
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      mealDate: dateForNewMeal
    }
    
    try {
      const res = await axios.post(API_URL, newMealPayload, { 
        headers: { Authorization: `Bearer ${userStore.user?.token}` }
      })

      meals.value.push(res.data)
    } catch (error) {
      console.error("Erro ao adicionar refeição:", error)
    }
  }

  const removeMeal = async (id: number | undefined) => {
    if (!id) return
    await axios.delete(`${API_URL}/${id}`, {
      headers: { Authorization: `Bearer ${userStore.user?.token}` }
    })
    meals.value = meals.value.filter(m => m.id !== id)
  }

  const totalCalories = computed(() => meals.value.reduce((sum, m) => sum + (m.calories || 0), 0))
  const totalProtein = computed(() => meals.value.reduce((sum, m) => sum + (m.protein || 0), 0))
  const totalCarbs = computed(() => meals.value.reduce((sum, m) => sum + (m.carbs || 0), 0))
  const totalFat = computed(() => meals.value.reduce((sum, m) => sum + (m.fat || 0), 0))

  return {
    meals,
    selectedDate,
    fetchMeals,
    addMeal,
    removeMeal,
    setDateAndFetch,
    totalCalories,
    totalProtein,
    totalCarbs,
    totalFat
  }
})
