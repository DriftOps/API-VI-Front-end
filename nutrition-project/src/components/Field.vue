<!-- src/components/Field.vue -->
<template>
  <label :class="['field', $attrs.class]">
    <span v-if="label" class="field__label">{{ label }}</span>
    <div class="field__control">
      <slot />
    </div>
  </label>
</template>

<script setup lang="ts">
defineProps<{ label?: string }>()
</script>

<style scoped>
.field { display:block; }
.field__label { font-size:13px; color: var(--color-text); opacity:.9; display:block; margin-bottom:4px; }

/* inputs mais compactos */
:deep(input),
:deep(select),
:deep(textarea) {
  width:100%;
  padding:8px 10px;            /* ↓ de 10/12 para 8/10 */
  border-radius:8px;
  border:1px solid var(--card-border);
  background: var(--card-bg);
  color: var(--color-text);
  outline:none;
  font-size:14px;              /* ↓ fonte um pouco menor */
  line-height:1.2;
}
:deep(input:focus),
:deep(select:focus),
:deep(textarea:focus) {
  border-color:#4F46E5;
  box-shadow:0 0 0 2px rgba(79,70,229,.2);
}
</style>