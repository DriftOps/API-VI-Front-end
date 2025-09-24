<!-- src/pages/Profile.vue -->
<template>
  <div class="profile">
    <!-- Top bar igual ao Dashboard (com toggle de tema) -->
    <div class="top-bar">
      <h1>Meu Perfil</h1>
      <button class="theme-toggle" :class="{ dark: darkMode }" @click="toggleTheme">
        <div class="circle"></div>
        <span class="sun">☀️</span>
        <span class="moon">🌙</span>
      </button>
    </div>

    <!-- grid de cards (mesmo espírito do Dashboard.vue) -->
    <div class="user-cards">
      <!-- Avatar -->
      <div class="card">
        <div class="avatar">
          <img v-if="avatarPreview" :src="avatarPreview" alt="avatar" />
          <div v-else class="placeholder">Sem foto</div>
        </div>

        <div class="file">
          <label class="file__button">
            <input type="file" accept="image/*" @change="onAvatarChange" />
            Foto do perfil (upload)
          </label>
          <div class="file__name" v-if="fileName">{{ fileName }}</div>
        </div>

        <button class="save-btn" :disabled="saving">
          {{ saving ? 'Salvando…' : 'Salvar foto' }}
        </button>
      </div>

      <!-- Formulário de dados -->
      <div class="card">
        <div class="section-head">
          <h2>Dados pessoais</h2>
          <p>Atualize seus dados de identificação.</p>
        </div>

        <form class="form" @submit.prevent="onSubmit">
          <Field label="Nome completo"><input v-model="form.nome" placeholder="Seu nome" /></Field>
          <Field label="E-mail"><input v-model="form.email" type="email" placeholder="voce@exemplo.com" /></Field>
          <Field label="Telefone"><input v-model="form.telefone" placeholder="(11) 99999-9999" /></Field>
          <Field label="CPF"><input v-model="form.cpf" placeholder="000.000.000-00" /></Field>
          <Field label="Data de nascimento"><input v-model="form.dataNascimento" type="date" placeholder="aaaa-mm-dd" /></Field>

          <div class="subhead">Endereço</div>
          <Field label="Logradouro" class="span-2"><input v-model="form.endereco.logradouro" placeholder="Rua, avenida..." /></Field>
          <Field label="Número"><input v-model="form.endereco.numero" placeholder="123" /></Field>
          <Field label="Complemento"><input v-model="form.endereco.complemento" placeholder="Apto, sala…" /></Field>
          <Field label="Bairro"><input v-model="form.endereco.bairro" placeholder="Centro" /></Field>
          <Field label="Cidade"><input v-model="form.endereco.cidade" placeholder="São José dos Campos" /></Field>
          <Field label="UF"><input v-model="form.endereco.uf" placeholder="SP" /></Field>
          <Field label="CEP"><input v-model="form.endereco.cep" placeholder="00000-000" /></Field>

          <div class="actions">
            <button class="save-btn" type="submit" :disabled="saving">
              {{ saving ? 'Salvando…' : 'Salvar alterações' }}
            </button>
            <button class="ghost-btn" type="button" @click="$router.back?.()">Cancelar</button>
          </div>
        </form>
      </div>

      <!-- Segurança -->
      <div class="card full">
        <div class="section-head inline">
          <div>
            <h2>Segurança</h2>
          </div>
          <button class="outline-btn" @click="showPassword = !showPassword">
            {{ showPassword ? 'Ocultar' : 'Alterar senha' }}
          </button>
        </div>

        <div v-if="showPassword" class="form three">
          <Field label="Senha atual"><input v-model="passwords.atual" type="password" /></Field>
          <Field label="Nova senha"><input v-model="passwords.nova" type="password" /></Field>
          <Field label="Confirmar nova senha"><input v-model="passwords.confirmar" type="password" /></Field>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import Field from '../components/Field.vue'
import axios from 'axios'

type Endereco = { logradouro: string; numero: string; complemento: string; bairro: string; cidade: string; uf: string; cep: string }
type UserProfile = { nome: string; email: string; telefone: string; cpf: string; dataNascimento: string; endereco: Endereco }

const darkMode = ref(localStorage.getItem('theme') === 'dark')
const applyTheme = () => {
  const html = document.documentElement
  if (darkMode.value) { html.classList.add('dark'); html.classList.remove('light') }
  else { html.classList.add('light'); html.classList.remove('dark') }
}
const toggleTheme = () => { darkMode.value = !darkMode.value; localStorage.setItem('theme', darkMode.value ? 'dark' : 'light'); applyTheme() }
onMounted(applyTheme)

const saving = ref(false)
const showPassword = ref(false)
const avatarPreview = ref<string | null>(null)
const fileName = ref('')

const form = reactive<UserProfile>({
  nome: '', email: '', telefone: '', cpf: '', dataNascimento: '',
  endereco: { logradouro: '', numero: '', complemento: '', bairro: '', cidade: '', uf: '', cep: '' }
})
const passwords = reactive({ atual: '', nova: '', confirmar: '' })

function onAvatarChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) { avatarPreview.value = null; fileName.value = ''; return }
  fileName.value = file.name
  const reader = new FileReader()
  reader.onload = () => (avatarPreview.value = reader.result as string)
  reader.readAsDataURL(file)
}

function validate(): string | null {
  if (!form.nome.trim()) return 'Informe o nome completo.'
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) return 'E-mail inválido.'
  if (showPassword.value) {
    if (!passwords.atual || !passwords.nova) return 'Preencha as senhas.'
    if (passwords.nova !== passwords.confirmar) return 'A confirmação da senha não confere.'
    if (passwords.nova.length < 6) return 'A nova senha deve ter pelo menos 6 caracteres.'
  }
  return null
}

async function onSubmit() {
  const err = validate()
  if (err) return alert(err)
  saving.value = true
  try {
    await axios.put('/api/usuario/perfil', { ...form, passwords: showPassword.value ? passwords : undefined, avatar: avatarPreview.value })
    alert('Perfil atualizado com sucesso!')
  } catch (e) {
    console.error(e)
    alert('Não foi possível salvar. Tente novamente.')
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
/* container padrão das outras telas */
.profile{
  width: 80vw;
  margin: 0 auto;
  min-height: 100vh;
  padding: 20px 0;                 /* ↓ padding vertical */
  box-sizing: border-box;
  background: var(--color-background);
  color: var(--color-text);
  font-family: "Segoe UI", sans-serif;
}

/* topo */
.top-bar{
  display:flex; justify-content:space-between; align-items:center;
  margin-bottom:16px;             /* ↓ espaço antes do conteúdo */
}

/* GRID geral */
.user-cards{
  display:grid;
  grid-template-columns: 1fr;     /* mobile */
  gap:14px;                       /* ↓ gaps */
  width:100%;
  box-sizing:border-box;
}
@media (min-width:1024px){
  .user-cards{
    grid-template-columns: 330px 1fr; /* avatar + form largo */
    align-items:start;
  }
}

/* cards */
.card{
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius:14px;
  padding:12px;                   /* ↓ padding interno */
  box-shadow:0 1px 2px rgba(0,0,0,.06);
  min-width:0;                    /* não estoura o grid */
}
.card.full{ grid-column:1 / -1; }

/* cabeçalhos */
.section-head{ margin-bottom:6px; }
.section-head h2{ font-size:19px; color:var(--color-heading); margin:0; line-height:1.2; }
/* Esconde a frase de apoio no desktop p/ ganhar altura */
@media (min-width:1024px){
  .section-head p{ display:none; }
}
.section-head.inline{ display:flex; align-items:center; justify-content:space-between; gap:10px; }
.subhead{ grid-column:1 / -1; font-weight:600; margin:4px 0 -2px; }

/* FORM mais denso */
.form{
  display:grid;
  grid-template-columns: 1fr;     /* mobile */
  gap:8px;                        /* ↓ distância entre campos */
}
.form > *{ min-width:0; }
.form.three{ grid-template-columns: 1fr; }

/* desktop: 3 colunas; em telas bem largas cabem 4 */
@media (min-width:1024px){
  .form{ grid-template-columns: repeat(3, 1fr); }
}
@media (min-width:1440px){
  .form{ grid-template-columns: repeat(4, 1fr); }
}
/* respeita spans existentes no markup (ex.: Logradouro tem .span-2) */
.span-2{ grid-column: span 2; }
.span-3{ grid-column: span 3; }

/* ações compactas */
.actions{
  grid-column: 1 / -1;
  display:flex; gap:8px; margin-top:6px; flex-wrap:wrap;
}

/* avatar + upload enxutos */
.avatar{
  width:108px; height:108px; border-radius:999px; overflow:hidden;
  margin:0 auto 8px;
  border:1px solid var(--card-border);
  background: var(--color-background-soft, #f8f8f8);
  display:grid; place-items:center;
}
.avatar img{ width:100%; height:100%; object-fit:cover; }
.placeholder{ font-size:12px; opacity:.7; }

.file{ margin:6px 0 8px; }
.file__button{
  display:inline-block; border:1px solid var(--card-border);
  background: var(--card-bg); color: var(--color-text);
  padding:8px 10px; border-radius:8px; cursor:pointer; user-select:none;
}
.file__button input{ display:none; }
.file__name{ margin-top:4px; font-size:12px; opacity:.7; word-break:break-all; }

/* botões */
.save-btn{
  padding:8px 14px; border-radius:10px; border:none;
  background: var(--save-btn-bg, #2c3e50); color:#fff; font-weight:700;
  cursor:pointer; transition: background .2s, transform .2s;
}
.save-btn:hover{ background: var(--save-btn-hover, #1a252f); transform: scale(1.01); }
.save-btn:disabled{ opacity:.6; cursor:not-allowed; }

.ghost-btn{
  padding:8px 14px; border-radius:10px;
  border:1px solid var(--card-border);
  background:transparent; color:var(--color-text);
}
.outline-btn{
  padding:8px 14px; border-radius:10px;
  border:1px solid #4F46E5; background:transparent; color:#4F46E5;
}
</style>