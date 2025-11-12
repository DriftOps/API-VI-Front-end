<template>
  <DashboardLayout>
    <div class="dashboard-content">
      <div class="content-header">
        <h1>
          <BarChart3Icon :size="24" class="header-icon" />
          {{ currentPageTitle }}
        </h1>
        <div class="header-actions">
          <span class="welcome-text">Olá, {{ user?.name }}!</span>
          <span class="user-role-badge">{{ user?.role }}</span>
        </div>
      </div>

      <div class="content-area">
        <div v-if="loading" class="loading">Carregando...</div>
        <div v-if="error" class="error-message">{{ error }}</div>
        <div v-if="success" class="success-message">{{ success }}</div>

        <div v-else class="user-cards">
          <div class="card">
            <label class="card-label"><TargetIcon :size="16" /> Objetivo Principal</label>
            <select v-model="userData.goal">
              <option disabled value="">Selecione</option>
              <option value="WEIGHT_LOSS">Emagrecimento</option>
              <option value="MUSCLE_GAIN">Ganho de Massa Muscular</option>
              <option value="DIABETES_CONTROL">Controle de Diabetes</option>
              <option value="DIET_REEDUCATION">Reeducação Alimentar</option>
              <option value="PHYSICAL_MENTAL_PERFORMANCE">Performance Física e Mental</option>
            </select>
          </div>
          <div class="card">
            <label class="card-label"><ScaleIcon :size="16" /> Peso (kg)</label>
            <input type="number" v-model.number="userData.weight" step="0.1" />
          </div>
          <div class="card">
            <label class="card-label"><RulerIcon :size="16" /> Altura (cm)</label>
            <input type="number" v-model.number="userData.height" />
          </div>
          <div class="card">
            <label class="card-label"><CalendarIcon :size="16" /> Data de Nascimento</label>
            <input type="date" v-model="userData.birthDate" />
          </div>

          <div class="card">
            <label class="card-label"><ActivityIcon :size="16" /> Tipo de Atividade</label>
            <select v-model="userData.activityLevel">
              <option disabled value="">Selecione</option>
              <option value="SEDENTARY">Sedentário(a)</option>
              <option value="WALKING">Caminhada</option>
              <option value="WEIGHT_TRAINING">Musculação</option>
              <option value="RUNNING">Corrida</option>
              <option value="CROSSFIT">Crossfit</option>
              <option value="SWIMMING">Natação</option>
              <option value="FIGHT">Luta</option>
              <option value="OTHER">Outro</option>
            </select>
          </div>
           <div class="card">
            <label class="card-label"><RepeatIcon :size="16" /> Frequência Semanal</label>
            <select v-model="userData.frequency">
              <option disabled value="">Selecione</option>
              <option value="NONE">Nenhuma</option>
              <option value="ONE_2X_WEEK">1-2x na semana</option>
              <option value="THREE_4X_WEEK">3-4x na semana</option>
              <option value="FIVE_X_OR_MORE">5x ou mais</option>
            </select>
          </div>
           <div class="card">
            <label class="card-label"><TimerIcon :size="16" /> Minutos por Dia</label>
            <input type="number" v-model.number="userData.activityMinutesPerDay" placeholder="Ex: 60" />
          </div>
          <div class="card highlight" ref="imcCardRef">
            <label class="card-label"><HeartPulseIcon :size="16" /> IMC</label>
            <p class="imc">{{ imc }} <span class="imc-category">({{ imcCategory }})</span></p>
          </div>

          <div class="card full">
            <label class="card-label"><StethoscopeIcon :size="16" /> Condições Médicas</label>
            <select multiple v-model="userData.medicalConditions">
              <option v-for="option in medicalConditionsOptions" :key="option" :value="option">{{ option }}</option>
            </select>
            <small class="info-text">Segure Cmd/Ctrl para selecionar múltiplos itens.</small>
          </div>
           <div class="card full">
            <label class="card-label"><SirenIcon :size="16" /> Alergias</label>
            <select multiple v-model="userData.allergies">
              <option v-for="option in allergiesOptions" :key="option" :value="option">{{ option }}</option>
            </select>
             <small class="info-text">Segure Cmd/Ctrl para selecionar múltiplos itens.</small>
          </div>
           <div class="card full">
            <label class="card-label"><ScissorsIcon :size="16" /> Cirurgias</label>
             <select multiple v-model="userData.surgeries">
              <option v-for="option in surgeriesOptions" :key="option" :value="option">{{ option }}</option>
            </select>
             <small class="info-text">Segure Cmd/Ctrl para selecionar múltiplos itens.</small>
          </div>
          
          <div class="card">
            <label class="card-label"><BedIcon :size="16" /> Qualidade do Sono</label>
            <select v-model="userData.sleepQuality">
              <option disabled value="">Selecione</option>
              <option value="GOOD">Boa</option>
              <option value="REGULAR">Regular</option>
              <option value="BAD">Ruim</option>
            </select>
          </div>
           <div class="card">
            <label class="card-label"><MoonIcon :size="16" /> Despertares à Noite</label>
             <select v-model="userData.wakesDuringNight">
              <option disabled value="">Selecione</option>
              <option value="NO">Não</option>
              <option value="ONCE">1 vez</option>
              <option value="MORE_THAN_ONCE">Mais de 1 vez</option>
            </select>
          </div>
           <div class="card">
            <label class="card-label"><WindIcon :size="16" /> Frequência Intestinal</label>
             <select v-model="userData.bowelFrequency">
              <option disabled value="">Selecione</option>
              <option value="EVERY_DAY">Todo dia</option>
              <option value="FIVE_X_WEEK">~5x na semana</option>
              <option value="THREE_X_WEEK">~3x na semana</option>
              <option value="ONE_X_WEEK">~1x na semana</option>
            </select>
          </div>
           <div class="card">
            <label class="card-label"><GlassWaterIcon :size="16" /> Hidratação Diária</label>
             <select v-model="userData.hydrationLevel">
              <option disabled value="">Selecione</option>
              <option value="LESS_THAN_1L">&lt; 1 Litro</option>
              <option value="BETWEEN_1_2L">1-2 Litros</option>
              <option value="BETWEEN_2_3L">2-3 Litros</option>
              <option value="MORE_THAN_3L">&gt; 3 Litros</option>
            </select>
          </div>
           <div class="card">
            <label class="card-label"><WineIcon :size="16" /> Consumo de Álcool</label>
             <select v-model="userData.alcoholUse">
              <option disabled value="">Selecione</option>
              <option value="DOES_NOT_CONSUME">Não consumo</option>
              <option value="SOCIAL_1_2X_WEEK">Social (1-2x/semana)</option>
              <option value="FREQUENT_3_4X_WEEK">Frequente (3-4x/semana)</option>
              <option value="DAILY_USE">Uso diário</option>
            </select>
          </div>
          <div class="card">
             <label class="card-label"><CigaretteIcon :size="16" /> Tabagismo</label>
             <select v-model="userData.smoking">
               <option :value="undefined">Selecione</option>
               <option :value="false">Não</option>
               <option :value="true">Sim</option>
             </select>
          </div>
          <div class="card">
             <label class="card-label"><PillIcon :size="16" /> Medicação Contínua</label>
             <select v-model="userData.continuousMedication">
               <option :value="undefined">Selecione</option>
               <option :value="false">Não</option>
               <option :value="true">Sim</option>
             </select>
          </div>

          <button @click="openExportModal" class="export-btn">
            <DownloadIcon :size="18" />
            Exportar PDF
          </button>

      <div v-if="showExportModal" class="modal-overlay" @click.self="closeExportModal">
      <div class="modal-content">
        <h4>Confirmar Exportação</h4>
        <p>Deseja realmente gerar o PDF com o resumo do seu progresso nutricional?</p>
        <div class="modal-actions">
          <button @click="closeExportModal" class="reset-btn">Cancelar</button>
          <button @click="handleConfirmExport" class="save-btn" :disabled="exportingPdf">
            {{ exportingPdf ? 'Gerando...' : 'Confirmar e Baixar' }}
          </button>
        </div>
      </div>
    </div>

          <div class="card actions">
            <button @click="saveUser" :disabled="saving" class="save-btn">
              <SaveIcon v-if="!saving" :size="18" />
              {{ saving ? 'Salvando...' : 'Salvar Alterações' }}
            </button>
            <button @click="resetForm" class="reset-btn">
              <RotateCcwIcon :size="18" />
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useUserStore } from "../stores/user";
import { fetchCurrentUser, updateUser } from "../api/user";
import type { UserUpdateDTO } from "../types/user";
import DashboardLayout from '@/layouts/DashboardLayout.vue';
import {
  BarChart3 as BarChart3Icon, Target as TargetIcon, Scale as ScaleIcon, Ruler as RulerIcon,
  Calendar as CalendarIcon, CalendarDays as CalendarDaysIcon, Activity as ActivityIcon,
  HeartPulse as HeartPulseIcon, Save as SaveIcon, RotateCcw as RotateCcwIcon,
  Stethoscope as StethoscopeIcon, Siren as SirenIcon, Scissors as ScissorsIcon, Bed as BedIcon,
  Moon as MoonIcon, Wind as WindIcon, GlassWater as GlassWaterIcon, Wine as WineIcon,
  Cigarette as CigaretteIcon, Pill as PillIcon, Repeat as RepeatIcon, Timer as TimerIcon, Download as DownloadIcon
} from 'lucide-vue-next';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Função auxiliar para converter string em array e vice-versa
const stringToArray = (str: string | undefined | null): string[] => str ? str.split(';').map(item => item.trim()).filter(Boolean) : [];
const arrayToString = (arr: string[] | undefined | null): string => arr ? arr.join('; ') : "";

export default defineComponent({
  name: 'Dashboard',
  components: {
    DashboardLayout, BarChart3Icon, TargetIcon, ScaleIcon, RulerIcon, CalendarIcon, CalendarDaysIcon,
    ActivityIcon, HeartPulseIcon, SaveIcon, RotateCcwIcon, StethoscopeIcon, SirenIcon,
    ScissorsIcon, BedIcon, MoonIcon, WindIcon, GlassWaterIcon, WineIcon, CigaretteIcon, PillIcon,
    RepeatIcon, TimerIcon, DownloadIcon
  },
  setup() {
    const route = useRoute();
    const userStore = useUserStore();
    const loading = ref(true);
    const saving = ref(false);
    const error = ref("");
    const success = ref("");

    // --- Listas de Opções para os Selects ---
    const medicalConditionsOptions = ref([
      'Hipertensão', 'Diabetes Tipo 1', 'Diabetes Tipo 2', 'Colesterol Alto', 
      'Gastrite', 'Refluxo', 'Doença Celíaca', 'Intolerância à Lactose', 'Nenhuma'
    ]);
    const allergiesOptions = ref([
      'Glúten', 'Lactose', 'Frutos do Mar', 'Amendoim', 'Soja', 'Ovos', 'Nenhuma'
    ]);
    const surgeriesOptions = ref([
      'Apendicectomia', 'Vesícula Biliar', 'Cirurgia Bariátrica', 'Cesárea', 'Nenhuma'
    ]);

    // ✅ userData agora usa ARRAYS para os campos de multi-select
    const userData = ref({
      weight: undefined as number | undefined,
      height: undefined as number | undefined,
      birthDate: "",
      goal: "",
      activityLevel: "",
      medicalConditions: [] as string[],
      allergies: [] as string[],
      surgeries: [] as string[],
      frequency: "",
      activityMinutesPerDay: undefined as number | undefined,
      sleepQuality: "",
      wakesDuringNight: "",
      bowelFrequency: "",
      alcoholUse: "",
      smoking: undefined as boolean | undefined,
      hydrationLevel: "",
      continuousMedication: undefined as boolean | undefined,
    });

    const showExportModal = ref(false);
    const exportingPdf = ref(false);
    const imcCardRef = ref<HTMLElement | null>(null);
    
    const user = computed(() => userStore.user);
    const pageTitles: Record<string, string> = { '/dashboard': 'Meu Painel Nutricional' };
    const currentPageTitle = computed(() => pageTitles[route.path] || 'Dashboard');

    const loadData = async () => {
      try {
        loading.value = true;
        error.value = "";
        const userProfile = await fetchCurrentUser();
        
        // ✅ Converte as strings do backend em arrays para o formulário
        userData.value = {
          weight: userProfile.weight || undefined,
          height: userProfile.height || undefined,
          birthDate: userProfile.birthDate || "",
          goal: userProfile.goal || "",
          activityLevel: userProfile.activityLevel || "",
          medicalConditions: stringToArray(userProfile.medicalConditions),
          allergies: stringToArray(userProfile.allergies),
          surgeries: stringToArray(userProfile.surgeries),
          frequency: userProfile.frequency || "",
          activityMinutesPerDay: userProfile.activityMinutesPerDay || undefined,
          sleepQuality: userProfile.sleepQuality || "",
          wakesDuringNight: userProfile.wakesDuringNight || "",
          bowelFrequency: userProfile.bowelFrequency || "",
          alcoholUse: userProfile.alcoholUse || "",
          smoking: userProfile.smoking,
          hydrationLevel: userProfile.hydrationLevel || "",
          continuousMedication: userProfile.continuousMedication,
        };

      } catch (err) {
        error.value = "Erro ao carregar dados. Tente novamente.";
        console.error(err);
      } finally {
        loading.value = false;
      }
    };
    
    const saveUser = async () => {
      try {
        saving.value = true;
        error.value = "";
        success.value = "";

        // ✅ CORREÇÃO: Construir o payload manualmente para garantir a tipagem correta
        const payload: UserUpdateDTO = {
            // Campos que já são do tipo correto
            weight: userData.value.weight,
            height: userData.value.height,
            birthDate: userData.value.birthDate,
            goal: userData.value.goal,
            activityLevel: userData.value.activityLevel,
            frequency: userData.value.frequency,
            activityMinutesPerDay: userData.value.activityMinutesPerDay,
            sleepQuality: userData.value.sleepQuality,
            wakesDuringNight: userData.value.wakesDuringNight,
            bowelFrequency: userData.value.bowelFrequency,
            alcoholUse: userData.value.alcoholUse,
            smoking: userData.value.smoking,
            hydrationLevel: userData.value.hydrationLevel,
            continuousMedication: userData.value.continuousMedication,
            
            // Campos que precisam de conversão de array para string
            medicalConditions: arrayToString(userData.value.medicalConditions),
            allergies: arrayToString(userData.value.allergies),
            surgeries: arrayToString(userData.value.surgeries),
        };

        await updateUser(payload);
        await loadData(); // Recarrega para confirmar as alterações

        success.value = "Dados atualizados com sucesso!";

      } catch (err) {
        error.value = "Erro ao salvar as alterações.";
        console.error(err);
      } finally {
        saving.value = false;
      }
    };
    
    const calculateAge = computed(() => {
      if (!userData.value.birthDate) return 0;
      const birthDate = new Date(userData.value.birthDate);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
      return age;
    });

    const imc = computed(() => {
      const w = userData.value.weight;
      const h = userData.value.height;
      if (!w || !h) return "—";
      return (w / ((h / 100) ** 2)).toFixed(1);
    });

    const imcCategory = computed(() => {
      const v = parseFloat(imc.value);
      if (isNaN(v)) return "—";
      if (v < 18.5) return "Abaixo do peso";
      if (v < 24.9) return "Peso normal";
      if (v < 29.9) return "Sobrepeso";
      return "Obesidade";
    });

    const resetForm = () => loadData();
    onMounted(loadData);

    const openExportModal = () => {
      showExportModal.value = true;
    };

    const closeExportModal = () => {
      showExportModal.value = false;
    };

    /**
     * Gera e baixa o PDF com os dados do usuário.
     */
    const handleConfirmExport = async () => {
      if (!user.value || !imcCardRef.value) return;
      
      exportingPdf.value = true;

      try {
        const doc = new jsPDF('p', 'mm', 'a4'); // p = portrait, mm = milímetros, a4 = tamanho
        const data = userData.value;
        const userName = user.value.name || 'Usuário';
        const today = new Date().toLocaleDateString('pt-BR');
        let y = 20; // Posição vertical inicial (margem superior)

        // --- 1. Título ---
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text(`Relatório Nutricional - ${userName}`, 105, y, { align: 'center' });
        y += 7;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`Gerado em: ${today}`, 105, y, { align: 'center' });
        y += 15;

        // --- 2. Resumo do Perfil ---
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Resumo do Perfil', 14, y);
        y += 8;
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`Objetivo Principal: ${data.goal || 'Não definido'}`, 16, y);
        doc.text(`Peso: ${data.weight || 'N/A'} kg`, 110, y);
        y += 6;
        doc.text(`Altura: ${data.height || 'N/A'} cm`, 16, y);
        doc.text(`Idade: ${calculateAge.value || 'N/A'} anos`, 110, y);
        y += 10;
        
        // --- 3. Card de IMC (como Imagem) ---
        // Captura o elemento HTML
        const canvas = await html2canvas(imcCardRef.value, {
            scale: 2, // Melhor resolução
            backgroundColor: null, // Mantém o fundo do card
        });
        const imgData = canvas.toDataURL('image/png');
        
        // Adiciona a imagem ao PDF
        // (largura, altura) - ajuste os valores 70 e 35 se necessário
        doc.addImage(imgData, 'PNG', 14, y, 70, 35); 
        y += 45; // Espaço após a imagem

        // --- 4. Recomendações (Estrutura Padrão) ---
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Minhas Recomendações Nutricionais', 14, y);
        y += 8;

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text("Aqui você pode adicionar as recomendações que o nutricionista gerou.", 14, y);
        y += 5;
        doc.text("Exemplo: 'Focar em consumir 120g de proteína por dia.'", 14, y);
        y += 5;
        doc.text("Exemplo: 'Beber pelo menos 2L de água.'", 14, y);
        y += 15;
        
        // --- 5. Outros Dados (Ex: Alergias) ---
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Informações Importantes', 14, y);
        y += 6;
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`Condições Médicas: ${arrayToString(data.medicalConditions) || 'Nenhuma'}`, 16, y);
        y += 6;
        doc.text(`Alergias: ${arrayToString(data.allergies) || 'Nenhuma'}`, 16, y);
        y += 6;

        // --- Rodapé (simples) ---
        doc.setFontSize(8);
        doc.text(`Página 1 de 1`, 190, 285, { align: 'right' });

        // --- 6. Salvar o PDF ---
        doc.save(`relatorio-nutricional-${userName.toLowerCase().replace(' ', '-')}.pdf`);

      } catch (err) {
        console.error("Erro ao gerar PDF:", err);
        error.value = "Não foi possível gerar o PDF. Tente novamente.";
      } finally {
        exportingPdf.value = false;
        closeExportModal();
      }
    };

    return {
      user, userData, loading, saving, success, error, currentPageTitle,
      medicalConditionsOptions, allergiesOptions, surgeriesOptions,
      calculateAge, imc, imcCategory, saveUser, resetForm, showExportModal,
      exportingPdf, imcCardRef, openExportModal, closeExportModal, handleConfirmExport,
    };
  },
});
</script>

<style scoped>
/* ESTILOS GERAIS */
.dashboard-content { width: 69vw; }
.content-header { background: var(--card-bg); padding: 20px 30px; border-bottom: 1px solid var(--card-border); display: flex; justify-content: space-between; align-items: center; border-radius: 10px; }
.content-header h1 { margin: 0; font-size: 28px; color: var(--color-heading); display: flex; align-items: center; gap: 10px; }
.header-icon { color: var(--primary-color); }
.header-actions { display: flex; align-items: center; gap: 15px; }
.welcome-text { font-size: 16px; color: var(--color-text); }
.user-role-badge { background: var(--primary-color); color: white; padding: 4px 8px; border-radius: 10px; font-size: 12px; text-transform: uppercase; }
.content-area { padding: 30px; min-height: calc(100vh - 80px); }
.user-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; }
.card { background: var(--card-bg); border: 1px solid var(--card-border); border-radius: 12px; padding: 24px; transition: all 0.3s ease; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1); }
.card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15); }
.card-label { display: flex; align-items: center; gap: 8px; font-weight: 600; margin-bottom: 12px; color: var(--color-heading); font-size: 14px; }
.card.highlight { background: linear-gradient(135deg, var(--primary-color) 0%, #554946 100%); color: white; border: none; }
.card.highlight .card-label, .card.highlight .imc-details { color: white; }
.card.full { grid-column: 1 / -1; }
.card.actions { grid-column: 1 / -1; display: flex; gap: 15px; justify-content: flex-end; }
input, select, textarea { width: 100%; padding: 12px; border: 2px solid var(--input-border); border-radius: 8px; background: var(--input-bg); color: var(--input-text); font-size: 14px; transition: all 0.2s ease; font-family: inherit; }
input:focus, select:focus, textarea:focus { outline: none; border-color: var(--input-focus-border); box-shadow: 0 0 0 3px var(--input-focus-ring); }
select:not([multiple]) { appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 12px center; background-size: 16px; padding-right: 40px; }
.save-btn, .reset-btn { padding: 12px 24px; border: none; border-radius: 8px; cursor: pointer; display: flex; align-items: center; gap: 8px; font-weight: 600; font-size: 14px; }
.save-btn { background: var(--primary-color); color: white; }
.save-btn:disabled { background: var(--card-border); cursor: not-allowed; }
.reset-btn { background: var(--card-bg); color: var(--color-text); border: 2px solid var(--card-border); }
.age-text, .imc-details { display: flex; align-items: center; gap: 6px; font-size: 14px; color: var(--color-text); margin-top: 8px; }
.imc { font-size: 28px; font-weight: bold; margin: 8px 0; }
.imc-category { font-size: 14px; opacity: 0.9; }
.loading { 
  text-align: center; 
  padding: 60px 20px; 
  font-size: 16px; 
}

.error-message, .success-message {
  text-align: center;
  font-size: 16px;
  padding: 16px; 
  border-radius: 8px;
  margin-bottom: 20px; 
}

.error-message { 
  background: var(--error-bg); 
  border: 1px solid var(--error-border); 
  color: var(--error-text); 
}


.success-message {
  background: #dff0d8; 
  border: 1px solid #c3e6cb; 
  color: #155724; 
}
.error-message { background: var(--error-bg); border: 1px solid var(--error-border); color: var(--error-text); border-radius: 8px; }

/* ESTILOS PARA O SELECT MÚLTIPLO */
select[multiple] {
  height: 150px;
  padding: 10px;
}
select[multiple] option {
  padding: 8px;
  border-radius: 4px;
}
select[multiple] option:checked {
  background: var(--primary-color);
  color: white;
}
.info-text {
  font-size: 12px;
  color: var(--color-text-secondary);
  margin-top: 8px;
  display: block;
}

.export-btn {
  padding: 8px 16px;
  background: #6366f1; 
  color: white;
  border: none;
  margin-top: 30px;
  height: 50%;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-weight: 600;
  font-size: 14px;
  transition: background-color 0.2s ease;
}
.export-btn:hover {
  background: #3d3f90;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}
.modal-content {
  background: var(--card-bg);
  padding: 24px 30px;
  border-radius: 12px;
  border: 1px solid var(--card-border);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  width: 90%;
  max-width: 450px;
  z-index: 1001;
}
.modal-content h4 {
  font-size: 20px;
  color: var(--color-heading);
  margin-top: 0;
  margin-bottom: 12px;
}
.modal-content p {
  font-size: 15px;
  color: var(--color-text);
  margin-bottom: 24px;
}
.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
}
</style>