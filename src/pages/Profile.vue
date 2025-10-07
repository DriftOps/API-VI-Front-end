<template>
  <DashboardLayout>
    <div class="profile-content">
      <!-- Header igual ao Dashboard -->
      <div class="content-header">
        <h1>
          <UserIcon :size="24" class="header-icon" />
          Meu Perfil
        </h1>
        <div class="header-actions">
          <span class="welcome-text">Olá, {{ user?.name }}!</span>
          <span class="user-role-badge">{{ user?.role }}</span>
        </div>
      </div>

      <div class="content-area">
        <div v-if="loading" class="loading">Carregando...</div>
        <div v-if="error" class="error-message">{{ error }}</div>

        <div v-else class="profile-layout">
          <!-- Coluna da Esquerda - Avatar e Dados Básicos -->
          <div class="left-column">
            <!-- Card do Avatar -->
            <div class="card avatar-card">
              <div class="card-label">
                <UserIcon :size="16" class="label-icon" />
                Foto do Perfil
              </div>
              
              <div class="avatar-section">
                <div class="avatar-preview">
                  <img v-if="avatarPreview" :src="avatarPreview" alt="Avatar" class="avatar-image" />
                  <div v-else class="avatar-placeholder">
                    <UserIcon :size="32" />
                  </div>
                </div>
                
                <div class="avatar-actions">
                  <label class="file-upload-btn">
                    <input type="file" accept="image/*" @change="onAvatarChange" />
                    <UploadIcon :size="16" />
                    Escolher Foto
                  </label>
                  <div v-if="fileName" class="file-name">{{ fileName }}</div>
                </div>

                <button 
                  @click="saveAvatar" 
                  :disabled="saving || !avatarPreview" 
                  class="save-btn"
                >
                  <SaveIcon v-if="!saving" :size="16" />
                  {{ saving ? 'Salvando...' : 'Salvar Foto' }}
                </button>
              </div>
            </div>

            <!-- Card de Contato -->
            <div class="card contact-card">
              <div class="card-label">
                <PhoneIcon :size="16" class="label-icon" />
                Informações de Contato
              </div>

              <div class="contact-info">
                <div class="info-item">
                  <MailIcon :size="14" />
                  <span><strong>E-mail:</strong> {{ user?.email }}</span>
                </div>
                <div class="info-item">
                  <PhoneIcon :size="14" />
                  <span><strong>Telefone:</strong> {{ form.telefone || 'Não informado' }}</span>
                </div>
                <div class="info-item">
                  <IdCardIcon :size="14" />
                  <span><strong>CPF:</strong> {{ form.cpf || 'Não informado' }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Coluna da Direita - Formulários -->
          <div class="right-column">
            <!-- Dados Pessoais -->
            <div class="card personal-data">
              <div class="card-label">
                <UserCheckIcon :size="16" class="label-icon" />
                Dados Pessoais
              </div>

              <form class="form-grid" @submit.prevent="onSubmit">
                <div class="form-row">
                  <div class="form-field">
                    <label>Nome Completo *</label>
                    <input v-model="form.nome" placeholder="Seu nome completo" />
                  </div>
                </div>

                <div class="form-row">
                  <div class="form-field">
                    <label>E-mail *</label>
                    <input v-model="form.email" type="email" placeholder="voce@exemplo.com" />
                  </div>
                  <div class="form-field">
                    <label>Telefone</label>
                    <input v-model="form.telefone" placeholder="(11) 99999-9999" />
                  </div>
                </div>

                <div class="form-row">
                  <div class="form-field">
                    <label>CPF</label>
                    <input v-model="form.cpf" placeholder="000.000.000-00" />
                  </div>
                  <div class="form-field">
                    <label>Data de Nascimento</label>
                    <input v-model="form.dataNascimento" type="date" />
                  </div>
                </div>

                <div class="form-section-header">
                  <MapPinIcon :size="16" />
                  Endereço
                </div>

                <div class="form-row">
                  <div class="form-field full-width">
                    <label>Logradouro</label>
                    <input v-model="form.endereco.logradouro" placeholder="Rua, avenida..." />
                  </div>
                </div>

                <div class="form-row">
                  <div class="form-field">
                    <label>Número</label>
                    <input v-model="form.endereco.numero" placeholder="123" />
                  </div>
                  <div class="form-field">
                    <label>Complemento</label>
                    <input v-model="form.endereco.complemento" placeholder="Apto, sala..." />
                  </div>
                </div>

                <div class="form-row">
                  <div class="form-field">
                    <label>Bairro</label>
                    <input v-model="form.endereco.bairro" placeholder="Centro" />
                  </div>
                  <div class="form-field">
                    <label>Cidade</label>
                    <input v-model="form.endereco.cidade" placeholder="São José dos Campos" />
                  </div>
                </div>

                <div class="form-row">
                  <div class="form-field">
                    <label>UF</label>
                    <input v-model="form.endereco.uf" placeholder="SP" maxlength="2" />
                  </div>
                  <div class="form-field">
                    <label>CEP</label>
                    <input v-model="form.endereco.cep" placeholder="00000-000" />
                  </div>
                </div>

                <div class="form-actions">
                  <button type="submit" :disabled="saving" class="save-btn primary">
                    <SaveIcon v-if="!saving" :size="16" />
                    {{ saving ? 'Salvando...' : 'Salvar Alterações' }}
                  </button>
                  <button type="button" @click="resetForm" class="cancel-btn">
                    <RotateCcwIcon :size="16" />
                    Cancelar
                  </button>
                </div>
              </form>
            </div>

            <!-- Segurança -->
            <div class="card security-card">
              <div class="card-header">
                <div class="card-label">
                  <LockIcon :size="16" class="label-icon" />
                  Segurança
                </div>
                <button @click="showPassword = !showPassword" class="toggle-btn">
                  {{ showPassword ? 'Ocultar' : 'Alterar Senha' }}
                </button>
              </div>

              <div v-if="showPassword" class="password-form">
                <div class="form-row">
                  <div class="form-field">
                    <label>Senha Atual</label>
                    <input v-model="passwords.atual" type="password" />
                  </div>
                </div>

                <div class="form-row">
                  <div class="form-field">
                    <label>Nova Senha</label>
                    <input v-model="passwords.nova" type="password" />
                  </div>
                  <div class="form-field">
                    <label>Confirmar Nova Senha</label>
                    <input v-model="passwords.confirmar" type="password" />
                  </div>
                </div>

                <div class="password-actions">
                  <button @click="updatePassword" :disabled="saving" class="save-btn">
                    <KeyIcon :size="16" />
                    Atualizar Senha
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>

<script lang="ts">
import { defineComponent, ref, reactive, onMounted, computed } from 'vue'
import { useUserStore } from '@/stores/user'
import { fetchCurrentUser, updateUser } from '@/api/user'
import type { User as UserType } from '@/types/user'
import DashboardLayout from '@/layouts/DashboardLayout.vue'

// Ícones
import {
  User as UserIcon,
  UserCheck as UserCheckIcon,
  MapPin as MapPinIcon,
  Lock as LockIcon,
  Key as KeyIcon,
  Save as SaveIcon,
  RotateCcw as RotateCcwIcon,
  Upload as UploadIcon,
  Phone as PhoneIcon,
  Mail as MailIcon,
  IdCard as IdCardIcon
} from 'lucide-vue-next'

type Endereco = { 
  logradouro: string; 
  numero: string; 
  complemento: string; 
  bairro: string; 
  cidade: string; 
  uf: string; 
  cep: string 
}

type UserProfile = { 
  nome: string; 
  email: string; 
  telefone: string; 
  cpf: string; 
  dataNascimento: string; 
  endereco: Endereco 
}

export default defineComponent({
  name: 'Profile',
  components: {
    DashboardLayout,
    UserIcon,
    UserCheckIcon,
    MapPinIcon,
    LockIcon,
    KeyIcon,
    SaveIcon,
    RotateCcwIcon,
    UploadIcon,
    PhoneIcon,
    MailIcon,
    IdCardIcon
  },
  setup() {
    const userStore = useUserStore()
    
    const loading = ref(true)
    const saving = ref(false)
    const error = ref('')
    const showPassword = ref(false)
    const avatarPreview = ref<string | null>(null)
    const fileName = ref('')

    const user = computed(() => userStore.user)

    const form = reactive<UserProfile>({
      nome: '', 
      email: '', 
      telefone: '', 
      cpf: '', 
      dataNascimento: '',
      endereco: { 
        logradouro: '', 
        numero: '', 
        complemento: '', 
        bairro: '', 
        cidade: '', 
        uf: '', 
        cep: '' 
      }
    })

    const passwords = reactive({ 
      atual: '', 
      nova: '', 
      confirmar: '' 
    })

    const loadUserData = async () => {
      try {
        loading.value = true
        const userData = await fetchCurrentUser()
        
        // Preencher formulário com dados do usuário
        form.nome = userData.name || ''
        form.email = userData.email || ''
        // form.telefone = userData.phone || ''
        // form.cpf = userData.cpf || ''
        form.dataNascimento = userData.birthDate || ''
        
      } catch (err) {
        error.value = 'Erro ao carregar dados do usuário'
        console.error(err)
      } finally {
        loading.value = false
      }
    }

    const onAvatarChange = (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) { 
        avatarPreview.value = null
        fileName.value = ''
        return 
      }
      
      fileName.value = file.name
      const reader = new FileReader()
      reader.onload = () => (avatarPreview.value = reader.result as string)
      reader.readAsDataURL(file)
    }

    const saveAvatar = async () => {
      if (!avatarPreview.value) return
      
      saving.value = true
      try {
        // Implementar upload da imagem
        console.log('Salvando avatar:', avatarPreview.value)
        alert('Avatar salvo com sucesso!')
      } catch (err) {
        alert('Erro ao salvar avatar')
        console.error(err)
      } finally {
        saving.value = false
      }
    }

    const validate = (): string | null => {
      if (!form.nome.trim()) return 'Informe o nome completo.'
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) return 'E-mail inválido.'
      if (showPassword.value) {
        if (!passwords.atual || !passwords.nova) return 'Preencha as senhas.'
        if (passwords.nova !== passwords.confirmar) return 'A confirmação da senha não confere.'
        if (passwords.nova.length < 6) return 'A nova senha deve ter pelo menos 6 caracteres.'
      }
      return null
    }

    const onSubmit = async () => {
      const err = validate()
      if (err) return alert(err)
      
      saving.value = true
      try {
        // Implementar atualização do perfil
        console.log('Salvando perfil:', form)
        alert('Perfil atualizado com sucesso!')
      } catch (err) {
        alert('Erro ao salvar perfil')
        console.error(err)
      } finally {
        saving.value = false
      }
    }

    const updatePassword = async () => {
      const err = validate()
      if (err) return alert(err)
      
      saving.value = true
      try {
        // Implementar atualização de senha
        console.log('Atualizando senha')
        alert('Senha atualizada com sucesso!')
        showPassword.value = false
        passwords.atual = ''
        passwords.nova = ''
        passwords.confirmar = ''
      } catch (err) {
        alert('Erro ao atualizar senha')
        console.error(err)
      } finally {
        saving.value = false
      }
    }

    const resetForm = () => {
      loadUserData()
    }

    onMounted(() => {
      loadUserData()
    })

    return {
      user,
      form,
      passwords,
      loading,
      saving,
      error,
      showPassword,
      avatarPreview,
      fileName,
      onAvatarChange,
      saveAvatar,
      onSubmit,
      updatePassword,
      resetForm
    }
  }
})
</script>

<style scoped>
.profile-content {
  width: 100%;
}

.content-header {
  background: var(--card-bg);
  padding: 20px 30px;
  border-bottom: 1px solid var(--card-border);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.content-header h1 {
  margin: 0;
  font-size: 28px;
  color: var(--color-heading);
  display: flex;
  align-items: center;
  gap: 10px;
}

.header-icon {
  color: var(--primary-color);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 15px;
}

.welcome-text {
  font-size: 16px;
  color: var(--color-text);
}

.user-role-badge {
  background: var(--primary-color);
  color: white;
  padding: 4px 8px;
  border-radius: 10px;
  font-size: 12px;
  text-transform: uppercase;
}

.content-area {
  padding: 30px;
  min-height: calc(100vh - 80px);
}

/* Layout Horizontal */
.profile-layout {
  display: grid;
  grid-template-columns: 350px 1fr;
  gap: 24px;
  align-items: start;
}

.left-column {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.right-column {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* Cards */
.card {
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: 12px;
  padding: 24px;
  transition: all 0.3s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.card-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  margin-bottom: 16px;
  color: var(--color-heading);
  font-size: 16px;
}

.label-icon {
  color: var(--primary-color);
}

/* Avatar Card */
.avatar-card {
  text-align: center;
}

.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.avatar-preview {
  width: 140px;
  height: 140px;
  border-radius: 50%;
  border: 3px solid var(--card-border);
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-background);
  margin: 0 auto;
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--card-border);
  color: var(--color-text-secondary);
}

.avatar-actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  width: 100%;
}

.file-upload-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;
  width: 100%;
  justify-content: center;
}

.file-upload-btn:hover {
  background: var(--primary-hover);
}

.file-upload-btn input {
  display: none;
}

.file-name {
  font-size: 12px;
  color: var(--color-text-secondary);
  text-align: center;
  word-break: break-all;
}

/* Contact Card */
.contact-card {
  height: fit-content;
}

.contact-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 0;
  border-bottom: 1px solid var(--card-border);
}

.info-item:last-child {
  border-bottom: none;
}

.info-item svg {
  color: var(--primary-color);
  flex-shrink: 0;
}

.info-item span {
  font-size: 14px;
  line-height: 1.4;
}

/* Form Grid */
.form-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  align-items: start;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-field label {
  font-weight: 500;
  font-size: 14px;
  color: var(--color-heading);
}

.form-field input {
  padding: 10px 12px;
  border: 2px solid var(--card-border);
  border-radius: 8px;
  background: var(--input-bg);
  color: var(--input-text);
  font-size: 14px;
  transition: all 0.2s ease;
  width: 100%;
}

.form-field input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px var(--input-focus-ring);
}

.form-field.full-width {
  grid-column: 1 / -1;
}

.form-section-header {
  grid-column: 1 / -1;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: var(--color-heading);
  margin: 8px 0;
  padding-top: 16px;
  border-top: 1px solid var(--card-border);
}

/* Security Card */
.security-card {
  width: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.toggle-btn {
  padding: 8px 16px;
  border: 1px solid var(--primary-color);
  background: transparent;
  color: var(--primary-color);
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;
}

.toggle-btn:hover {
  background: var(--primary-color);
  color: white;
}

.password-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-top: 16px;
  border-top: 1px solid var(--card-border);
}

/* Buttons */
.save-btn, .cancel-btn {
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
  font-size: 14px;
  transition: all 0.2s ease;
  justify-content: center;
}

.save-btn {
  background: var(--primary-color);
  color: white;
}

.save-btn:hover:not(:disabled) {
  background: var(--primary-hover);
  transform: translateY(-1px);
}

.save-btn:disabled {
  background: var(--card-border);
  cursor: not-allowed;
  transform: none;
}

.save-btn.primary {
  background: var(--primary-color);
}

.cancel-btn {
  background: var(--card-bg);
  color: var(--color-text);
  border: 2px solid var(--card-border);
}

.cancel-btn:hover {
  background: var(--card-border);
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid var(--card-border);
}

.password-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 8px;
}

/* Loading and Error States */
.loading {
  text-align: center;
  padding: 60px 20px;
  color: var(--color-text-secondary);
  font-size: 16px;
}

.error-message {
  background: var(--error-bg);
  border: 1px solid var(--error-border);
  color: var(--error-text);
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 24px;
  font-weight: 500;
}

/* Responsividade */
@media (max-width: 1200px) {
  .profile-layout {
    grid-template-columns: 300px 1fr;
    gap: 20px;
  }
}

@media (max-width: 1024px) {
  .profile-layout {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .left-column {
    order: 2;
  }
  
  .right-column {
    order: 1;
  }
}

@media (max-width: 768px) {
  .content-header {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .content-area {
    padding: 20px;
  }
}

@media (max-width: 480px) {
  .card {
    padding: 20px;
  }
  
  .avatar-preview {
    width: 120px;
    height: 120px;
  }
}
</style>