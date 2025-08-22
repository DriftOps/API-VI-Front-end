<template>
  <div class="dashboard">
    <h1>Bem-vindo, {{ user.name }}</h1>

    <div class="user-cards">
      <div class="card">
        <label>Objetivo</label>
        <input v-model="user.goal" placeholder="Ex: Emagrecer, Ganhar massa" />
      </div>

      <div class="card">
        <label>Peso (kg)</label>
        <input type="number" v-model.number="user.weight" placeholder="Peso em kg" />
      </div>

      <div class="card">
        <label>Altura (cm)</label>
        <input type="number" v-model.number="user.height" placeholder="Altura em cm" />
      </div>

      <div class="card">
        <label>Atividade</label>
        <select v-model="user.activityLevel">
          <option value="">Selecione</option>
          <option>Sedentário</option>
          <option>Moderado</option>
          <option>Ativo</option>
        </select>
      </div>

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

        <button @click="saveUser" class="save-btn">Salvar Alterações</button>

    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { useUserStore } from '../stores/user';
import type { User } from '../types/user';
import { fetchUser, updateUser } from '../api/user';

export default defineComponent({
  setup() {
    const userStore = useUserStore();
    const user: User = userStore.user;
    const newPref = ref('');

    const loadUser = async () => {
      const data = await fetchUser(1); // simula pegar user do backend
      userStore.setUser(data);
    };

    const saveUser = async () => {
      const updated = await updateUser(user);
      userStore.setUser(updated);
      alert('Dados salvos!');
    };

    const addPreference = () => {
      if (!newPref.value.trim()) return;
      userStore.user.dietaryPreferences.push(newPref.value.trim());
      newPref.value = '';
    };

    const removePreference = (index: number) => {
      userStore.user.dietaryPreferences.splice(index, 1);
    };

    onMounted(loadUser);

    return { user, newPref, addPreference, removePreference, saveUser };
  },
});

</script>

<style scoped>
.dashboard {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

h1 {
  text-align: center;
  margin-bottom: 30px;
  color: #2c3e50;
}

.user-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.card {
  background-color: #fefefe;
  border-radius: 12px;
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  padding: 20px;
  display: flex;
  flex-direction: column;
}

.card label {
  font-weight: bold;
  margin-bottom: 8px;
}

.card input,
.card select {
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid #ccc;
  font-size: 16px;
}

.preferences .tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 8px;
}

.preferences .tag {
  background-color: #d1e7dd;
  padding: 4px 8px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.preferences .tag button {
  background: none;
  border: none;
  cursor: pointer;
  color: #495057;
  font-weight: bold;
}
</style>
