<template>
  <div class="dashboard">
    <div class="top-bar">
      <h1>Meu Painel Nutricional</h1>
      <button class="theme-toggle" :class="{ dark: darkMode }" @click="toggleTheme">
        <div class="circle"></div>
        <span class="sun">☀️</span>
        <span class="moon">🌙</span>
      </button>
    </div>

    <div class="user-cards">
      <!-- Objetivo -->
      <div class="card">
        <label><Target :size="16" /> Objetivo</label>
        <input v-model="user.goal" placeholder="Ex: Emagrecer, Ganhar massa" />
      </div>

      <!-- Peso -->
      <div class="card">
        <label><Scale :size="16" /> Peso (kg)</label>
        <input type="number" v-model.number="user.weight" />
      </div>

      <!-- Altura -->
      <div class="card">
        <label><Ruler :size="16" /> Altura (cm)</label>
        <input type="number" v-model.number="user.height" />
      </div>

      <!-- Idade -->
      <div class="card">
        <label><Cake :size="16" /> Idade</label>
        <input type="number" v-model.number="user.age" />
      </div>

      <!-- Atividade -->
      <div class="card">
        <label><Activity :size="16" /> Nível de Atividade</label>
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
        <input v-model="newPref" placeholder="Adicionar preferência" @keyup.enter="addPreference"/>
        <button class="add-btn" @click="addPreference">Adicionar</button>
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
        <button class="add-btn" @click="addRestriction">Adicionar</button>
      </div>

      <!-- Plano Alimentar -->
      <div class="card full">
        <label><Book :size="16" /> Plano Alimentar</label>
        <textarea v-model="planDescription" placeholder="Seu plano aparecerá aqui..."></textarea>
      </div>

      <!-- Gráfico -->
      <div class="card full">
        <label><Utensils :size="16" /> Distribuição de Calorias</label>
        <PieChart :meals="user.plan?.meals ?? []" />
      </div>

      <button @click="saveUser" class="save-btn">Salvar Alterações</button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, computed } from "vue";
import { TargetIcon, ScaleIcon, RulerIcon, CakeIcon, ActivityIcon, BookIcon, UtensilsIcon } from "lucide-vue-next";
import { useUserStore } from "../stores/user";
import type { User } from "../types/user";
import { fetchUser, updateUser } from "../api/user";
import PieChart from "@/components/PieChart.vue";

export default defineComponent({
  components: { PieChart },
  setup() {
    const userStore = useUserStore();
    const user: User = userStore.user;

    const darkMode = ref(localStorage.getItem("theme") === "dark");

    const applyTheme = () => {
      const html = document.documentElement;
      if (darkMode.value) {
        html.classList.add("dark");
        html.classList.remove("light");
      } else {
        html.classList.add("light");
        html.classList.remove("dark");
      }
    };

    const toggleTheme = () => {
      darkMode.value = !darkMode.value;
      localStorage.setItem("theme", darkMode.value ? "dark" : "light");
      applyTheme();
    };

    onMounted(() => {
      applyTheme();
      loadUser();
    });

    const loadUser = async () => {
      const data = await fetchUser(1);
      userStore.setUser(data);
    };

    const saveUser = async () => {
      const updated = await updateUser(user);
      userStore.setUser(updated);
      alert("Dados salvos!");
    };

    const newPref = ref("");
    const newRestriction = ref("");

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
* {
  transition: background 0.3s, color 0.3s, border-color 0.3s;
}

.dashboard {
  width: 90vw; /* ocupar toda a largura da viewport */
  min-height: 100vh; /* ocupar toda a altura da tela */
  padding: 50px 0px; /* espaço interno nas laterais */
  box-sizing: border-box;
  font-family: "Segoe UI", sans-serif;
  background: var(--color-background);
  color: var(--color-text);
}

.user-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); /* aumenta o mínimo dos cards */
  gap: 20px;
  width: 100%;
  box-sizing: border-box;
}


h1 {
  text-align: center;
  margin-bottom: 30px;
  font-size: 28px;
  color: var(--color-text);
}

.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
}

/* Botão switch */
.theme-toggle {
  width: 50px;
  height: 26px;
  border-radius: 13px;
  border: none;
  background: var(--card-border);
  cursor: pointer;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 4px;
  box-sizing: border-box;
}

.theme-toggle .circle {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #fff;
  position: absolute;
  top: 2px;
  left: 2px;
  transition: left 0.3s;
}

.theme-toggle.dark .circle {
  left: 26px;
}

.theme-toggle .icon {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  left: 2px;
  top: 2px;
  transition: left 0.3s, background 0.3s;
  font-size: 14px;
}

.theme-toggle.dark .icon {
  left: 26px;
}

.theme-toggle .sun,
.theme-toggle .moon {
  font-size: 14px;
  pointer-events: none;
}

.theme-toggle .sun {
  color: #ffbb33;
}

.theme-toggle .moon {
  color: #5555ff;
}

.theme-toggle .icon.dark .sun {
  display: none;
}

.theme-toggle .icon.dark .moon {
  display: block;
}

/* resto igual, usando var(--color-*) */
.user-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 20px;
}

.card {
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  color: var(--color-text);
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  padding: 20px;
  display: flex;
  flex-direction: column;
  transition: transform 0.2s, background 0.3s, color 0.3s;
}

.card:hover {
  transform: scale(1.02);
}

.card label {
  font-weight: bold;
  margin-bottom: 8px;
  color: var(--color-heading);
}

.card input,
.card select,
.card textarea {
  padding: 10px;
  border-radius: 10px;
  font-size: 15px;
  background: var(--card-bg);
  color: var(--color-text);
  border: 1px solid var(--card-border);
  outline: none;
}

.card textarea {
  min-height: 100px;
  resize: vertical;
}

.full {
  grid-column: span 2;
}

.highlight {
  background: var(--highlight-bg, #eafaf1);
  border: 1px solid var(--highlight-border, #28a745);
}

.imc {
  font-size: 22px;
  font-weight: bold;
  color: var(--highlight-border, #28a745);
}

.preferences .tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 8px;
}

.preferences .tag {
  padding: 5px 10px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  gap: 6px;
  background: var(--card-bg);
  color: var(--color-text);
}

.dark .preferences .tag {
  background: var(--highlight-bg);
}

.preferences .tag button {
  background: #c92a2a;
  color: #fff;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  padding: 0;
  transition: background 0.2s;
}

.preferences .tag button:hover {
  background: #a61e1e;
}

.save-btn {
  grid-column: span 2;
  padding: 12px;
  border-radius: 10px;
  border: none;
  background: var(--save-btn-bg, #2c3e50);
  color: white;
  font-weight: bold;
  font-size: 16px;
  cursor: pointer;
  transition: background 0.3s;
}

.save-btn:hover {
  background: var(--save-btn-hover, #1a252f);
  transform: scale(1.03);
}

.preferences input {
  width: 100%;
  padding: 8px 10px;
  border-radius: 10px;
  border: 1px solid var(--card-border);
  font-size: 14px;
  outline: none;
  background: var(--card-bg);
  color: var(--color-text);
  margin-top: 8px;
}

.add-btn {
  width: 100%;
  margin-top: 8px;
  padding: 10px 0;
  border-radius: 10px;
  border: none;
  background: var(--save-btn-bg, #2c3e50);
  color: #fff;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.3s, transform 0.2s;
}

.add-btn:hover {
  background: var(--save-btn-hover, #1a252f);
  transform: scale(1.02);
}
</style>
