const API_URL = 'http://localhost:8080/api/diets' 

// --- Interfaces (DTOs) ---

export interface DietDailyTarget {
  id: number;
  targetDate: string; 
  adjustedCalories: number;
  adjustedProteinG: number | null;
  adjustedCarbsG: number | null;
  adjustedFatsG: number | null;
  consumedCalories: number;
  consumedProteinG: number;
  consumedCarbsG: number;
  consumedFatsG: number;
  suggestedMenu?: string;
}

export interface DietView {
  id: number;
  title: string;
  startDate: string;
  endDate: string;
  initialWeight: number;
  targetWeight: number;
  baseDailyCalories: number;
  baseDailyProteinG: number | null;
  baseDailyCarbsG: number | null;
  baseDailyFatsG: number | null;
  safeMetabolicFloor: number;
  aiRationale: string | null;
  dailyTargets: DietDailyTarget[];
}

export interface CreateDietRequest {
    userId: number; 
    title: string;
    endDate: string; // "YYYY-MM-DD"
    targetWeight: number;
    baseDailyCalories: number;
    safeMetabolicFloor: number;
    baseDailyProteinG?: number;
    baseDailyCarbsG?: number;
    baseDailyFatsG?: number;
    aiRationale?: string;
}

/**
 * Busca a dieta ativa do usuário logado.
 */
export async function getActiveDiet(): Promise<DietView> {
  const token = localStorage.getItem('token');

  const userId = localStorage.getItem('userId');
  
  const response = await fetch(`${API_URL}/active/${userId}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });

  if (response.status === 404) {
    // Isso é esperado, não é um erro
    throw new Error('Nenhuma dieta ativa encontrada.');
  }
  if (!response.ok) {
    throw new Error('Erro ao buscar dieta ativa');
  }
  
  return await response.json();
}

/**
 * Cria uma nova dieta (pelo chat ou UI).
 */
export async function createDiet(request: CreateDietRequest): Promise<DietView> {
  const token = localStorage.getItem('token');
  
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(request)
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Erro ao criar dieta:', errorText);
    throw new Error(`Erro ao criar dieta: ${errorText}`);
  }
  
  return await response.json();
}

/**
 * Atualiza uma meta diária específica (edição na UI)
 */
export async function updateDailyTarget(targetId: number, newCalories: number): Promise<DietDailyTarget> {
    const token = localStorage.getItem('token');
    
    const response = await fetch(`${API_URL}/daily/${targetId}`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        // O DTO do backend espera um objeto
        body: JSON.stringify({ adjustedCalories: newCalories }) 
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error('Erro ao atualizar meta:', errorText);
        throw new Error(`Erro ao atualizar meta: ${errorText}`);
    }
    
    return await response.json();
}

/**
 * Cancela a dieta ativa (pelo ID da dieta)
 */
export async function cancelDiet(dietId: number): Promise<void> {
    const token = localStorage.getItem('token');
    
    const response = await fetch(`${API_URL}/cancel/${dietId}`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error('Erro ao cancelar dieta:', errorText);
        throw new Error(`Erro ao cancelar dieta: ${errorText}`);
    }
}