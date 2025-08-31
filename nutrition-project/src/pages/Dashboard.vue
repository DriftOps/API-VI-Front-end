<template>
  <div :class="['dashboard', darkMode ? 'dark' : '']">
    <div class="top-bar">
      <h1>Meu Painel Nutricional</h1>
      <button class="theme-toggle" @click="toggleTheme">
        <div class="icon" :class="{ dark: darkMode }">
          <span class="sun">☀️</span>
          <span class="moon">🌙</span>
        </div>
      </button>
    </div>

    <div class="user-cards">
      <!-- Objetivo -->
      <div class="card">
        <label><TargetIcon :size="16" /> Objetivo</label>
        <input v-model="user.goal" placeholder="Ex: Emagrecer, Ganhar massa" />
      </div>

      <!-- Peso -->
      <div class="card">
        <label><ScaleIcon :size="16" /> Peso (kg)</label>
        <input type="number" v-model.number="user.weight" />
      </div>

      <!-- Altura -->
      <div class="card">
        <label><RulerIcon :size="16" /> Altura (cm)</label>
        <input type="number" v-model.number="user.height" />
      </div>

      <!-- Idade -->
      <div class="card">
        <label><CakeIcon :size="16" /> Idade</label>
        <input type="number" v-model.number="user.age" />
      </div>

      <!-- Atividade -->
      <div class="card">
        <label><ActivityIcon :size="16" /> Nível de Atividade</label>
        <select v-model="user.activityLevel">
          <option value="">Selecione</option>
          <option>Sedentário</option>
          <option>Moderado</option>
          <option>Ativo</option>
        </select>
      </div>

      <!-- IMC -->
      <div class="card highlight">
        <label>IMC</label>
        <p class="imc">{{ imc }} <span>({{ imcCategoria }})</span></p>
      </div>

      <!-- Preferências -->
      <div class="card preferences">
        <label>Preferências Alimentares</label>
        <div class="tags">
          <span v-for="(pref, index) in user.dietaryPreferences" :key="index" class="tag">
            {{ pref }}
            <button @click="removePreference(index)">x</button>
          </span>
        </div>
        <input v-model="newPref" placeholder="Adicionar preferência" @keyup.enter="addPreference" />
        <button @click="addPreference">Adicionar</button>
      </div>

      <!-- Restrições -->
      <div class="card preferences">
        <label>Restrições Alimentares</label>
        <div class="tags">
          <span v-for="(rest, index) in user.restrictions" :key="index" class="tag">
            {{ rest }}
            <button @click="removeRestriction(index)">x</button>
          </span>
        </div>
        <input v-model="newRestriction" placeholder="Adicionar restrição" @keyup.enter="addRestriction" />
        <button @click="addRestriction">Adicionar</button>
      </div>

      <!-- Plano Alimentar -->
      <div class="card full">
        <label><BookIcon :size="16" /> Plano Alimentar</label>
        <textarea v-model="planDescription" placeholder="Seu plano aparecerá aqui..."></textarea>
      </div>

      <!-- Gráfico -->
      <div class="card full">
        <label><UtensilsIcon :size="16" /> Distribuição de Calorias</label>
        <PieChart :meals="user.plan?.meals ?? []" />
      </div>

      <button @click="saveUser" class="save-btn">Salvar Alterações</button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, computed } from "vue";
import { Target, Scale, Ruler, Cake, Activity, Book, Utensils } from "lucide-vue-next";
import { useUserStore } from "../stores/user";
import type { User } from "../types/user";
import { fetchUser, updateUser } from "../api/user";
import PieChart from "@/components/PieChart.vue";


export default defineComponent({
  components: { PieChart },
  setup() {
    const TargetIcon = Target;
    const ScaleIcon = Scale;
    const RulerIcon = Ruler;
    const CakeIcon = Cake;
    const ActivityIcon = Activity;
    const BookIcon = Book;
    const UtensilsIcon = Utensils;

    const userStore = useUserStore();
    const user: User = userStore.user;

    const darkMode = ref(localStorage.getItem("theme") === "dark");
    const toggleTheme = () => {
      darkMode.value = !darkMode.value;
      localStorage.setItem("theme", darkMode.value ? "dark" : "light");
    };

    const newPref = ref("");
    const newRestriction = ref("");

    const loadUser = async () => {
      const data = await fetchUser(1);
      userStore.setUser(data);
    };

    const saveUser = async () => {
      const updated = await updateUser(user);
      userStore.setUser(updated);
      alert("Dados salvos!");
    };

    const addPreference = () => {
      if (!newPref.value.trim()) return;
      userStore.user.dietaryPreferences.push(newPref.value.trim());
      newPref.value = "";
    };

    const removePreference = (index: number) => {
      userStore.user.dietaryPreferences.splice(index, 1);
    };

    const addRestriction = () => {
      if (!newRestriction.value.trim()) return;
      userStore.user.restrictions.push(newRestriction.value.trim());
      newRestriction.value = "";
    };

    const removeRestriction = (index: number) => {
      userStore.user.restrictions.splice(index, 1);
    };

    const imc = computed(() => {
      if (!user.weight || !user.height) return "—";
      const alturaMetros = user.height / 100;
      return (user.weight / (alturaMetros * alturaMetros)).toFixed(1);
    });

    const imcCategoria = computed(() => {
      const valor = parseFloat(imc.value as string);
      if (isNaN(valor)) return "—";
      if (valor < 18.5) return "Abaixo do peso";
      if (valor < 24.9) return "Peso normal";
      if (valor < 29.9) return "Sobrepeso";
      return "Obesidade";
    });

    const planDescription = computed({
      get: () => user.plan?.description || "",
      set: (val: string) => {
        if (!user.plan) user.plan = { description: val };
        else user.plan.description = val;
      },
    });

    onMounted(loadUser);

    return {
      user,
      newPref,
      newRestriction,
      addPreference,
      removePreference,
      addRestriction,
      removeRestriction,
      saveUser,
      imc,
      imcCategoria,
      darkMode,
      toggleTheme,
      planDescription,
      TargetIcon,
      ScaleIcon,
      RulerIcon,
      CakeIcon,
      ActivityIcon,
      BookIcon,
      UtensilsIcon,
    };
  },
});
</script>

<style scoped>
.dashboard {
  max-width: 1000px;
  margin: 0 auto;
  padding: 30px;
  font-family: "Segoe UI", sans-serif;
}

h1 {
  text-align: center;
  margin-bottom: 30px;
  color: #2c3e50;
  font-size: 28px;
}

/* Barra superior com botão de tema */
.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
}

/* Botão estilo switch */
.theme-toggle {
  width: 60px;
  height: 30px;
  border-radius: 30px;
  border: none;
  background: #ddd;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  position: relative;
}

.theme-toggle .icon {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: white;
  position: absolute;
  left: 4px;
  top: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  font-size: 14px;
}

.theme-toggle .icon.dark {
  left: 34px;
}

/* Esconde um dos ícones */
.theme-toggle .sun {
  display: block;
}

.theme-toggle .moon {
  display: none;
}

.theme-toggle .icon.dark .sun {
  display: none;
}

.theme-toggle .icon.dark .moon {
  display: block;
}

/* DARK MODE THEME */
.dark {
  background: #1e1e2e;
  color: #f8f9fa;
}

.dark .card,
.dark .card label,
.dark .card input,
.dark .card select,
.dark .card textarea,
.dark .preferences .tag {
  color: #f1f1f1;
  /* texto claro no dark mode */
  background-color: #2b2b3c;
  /* fundo dos inputs e tags */
  border-color: #444;
}

.dark .save-btn {
  background: #0d6efd;
}

.dark .save-btn:hover {
  background: #084cd6;
}

.dark .chat-input input {
  background: #3a3a4e;
  color: #f1f1f1;
  border: 1px solid #555;
}

.dark .chat-input button {
  background: #0d6efd;
}

.dark .chat-input button:hover {
  background: #084cd6;
}

.user-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 20px;
}

.card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  padding: 20px;
  display: flex;
  flex-direction: column;
  transition: transform 0.2s;
}

.card:hover {
  transform: scale(1.02);
}

.card label {
  font-weight: bold;
  margin-bottom: 8px;
  color: #2c3e50;
}

.card input,
.card select,
.card textarea {
  padding: 10px;
  border-radius: 10px;
  border: 1px solid #ddd;
  font-size: 15px;
}

.card textarea {
  min-height: 100px;
  resize: vertical;
}

.full {
  grid-column: span 2;
}

.highlight {
  background: #eafaf1;
  border: 1px solid #28a745;
}

.imc {
  font-size: 22px;
  font-weight: bold;
  color: #28a745;
}

.preferences .tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 8px;
}

.preferences .tag {
  background: #f1f3f5;
  padding: 5px 10px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.preferences .tag button {
  background: none;
  border: none;
  cursor: pointer;
  color: #c92a2a;
  font-weight: bold;
}

.save-btn {
  grid-column: span 2;
  padding: 12px;
  border-radius: 10px;
  border: none;
  background: #2c3e50;
  color: white;
  font-weight: bold;
  font-size: 16px;
  cursor: pointer;
  transition: background 0.3s;
}

.save-btn:hover {
  background: #1a252f;
}
</style>