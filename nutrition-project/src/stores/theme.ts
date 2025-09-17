// src/stores/theme.ts
import { defineStore } from "pinia";
import { ref, watch } from "vue";

export const useThemeStore = defineStore("theme", () => {
  const darkMode = ref(localStorage.getItem("theme") === "dark");

  watch(darkMode, (val) => {
    if (val) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, { immediate: true });

  function toggleTheme() {
    darkMode.value = !darkMode.value;
  }

  return { darkMode, toggleTheme };
});
