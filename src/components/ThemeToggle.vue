<template>
  <button 
    @click="toggleTheme" 
    class="theme-switch"
    :class="{ active: darkMode }"
    :title="darkMode ? 'Modo Claro' : 'Modo Escuro'"
  >
    <span class="thumb">
      <SunIcon v-if="!darkMode" :size="16" />
      <MoonIcon v-else :size="16" />
    </span>
  </button>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { Sun as SunIcon, Moon as MoonIcon } from "lucide-vue-next";

const darkMode = ref(localStorage.getItem("theme") === "dark");

// Sincroniza darkMode com <html> + localStorage
watch(darkMode, (val) => {
  if (val) {
    document.documentElement.classList.add("dark");
    localStorage.setItem("theme", "dark");
  } else {
    document.documentElement.classList.remove("dark");
    localStorage.setItem("theme", "light");
  }
}, { immediate: true });

const toggleTheme = () => {
  darkMode.value = !darkMode.value;
};
</script>

<style scoped>
.theme-switch {
  width: 60px;
  height: 30px;
  background: #ddd;
  border-radius: 30px;
  border: none;
  cursor: pointer;
  position: relative;
  padding: 0;
  transition: background 0.3s;
  display: flex;
  align-items: center;
}

.theme-switch.active {
  background: #4f46e5; /* Roxo no dark */
}

.theme-switch .thumb {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 24px;
  height: 24px;
  background: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  color: #333;
}

/* Quando darkMode estiver ativo -> desliza o círculo */
.theme-switch.active .thumb {
  left: calc(100% - 27px);
  color: #fff;
}
</style>