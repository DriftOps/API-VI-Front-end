<template>
  <DashboardLayout>
    <div class="admin-users">
      <div class="page-header">
        <h2>Gerenciar Usuários</h2>
        <p>Gerencie os usuários do sistema e aprove novos cadastros</p>
      </div>

      <!-- <div class="debug-info" style="background: #f0f0f0; padding: 10px; margin: 10px 0; border-radius: 5px;">
      <h4>Debug Info:</h4>
      <p>Total Users: {{ users.length }}</p>
      <p>Pending: {{ pendingUsers.length }}</p>
      <p>Approved: {{ approvedUsers.length }}</p>
      <p>Users com approved=true: {{users.filter(u => u.approved).length}}</p>
    </div> -->

      <div v-if="loading" class="loading-state">
        <p>Carregando usuários...</p>
      </div>

      <div class="users-grid">
        <!-- Card de Estatísticas -->
        <div class="stats-card">
          <div class="stat-item">
            <div class="stat-value">{{ users.length }}</div>
            <div class="stat-label">Total de Usuários</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ pendingUsers.length }}</div>
            <div class="stat-label">Aguardando Aprovação</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ approvedUsers.length }}</div>
            <div class="stat-label">Usuários Aprovados</div>
          </div>
        </div>

        <!-- Lista de Usuários Pendentes -->
        <div class="section">
          <h3>Usuários Aguardando Aprovação</h3>
          <div v-if="pendingUsers.length === 0" class="empty-state">
            <p>Nenhum usuário aguardando aprovação</p>
          </div>
          <div v-else class="users-list">
            <div v-for="user in pendingUsers" :key="user.id" class="user-card pending">
              <div class="user-info">
                <div class="user-avatar">{{ user.name.charAt(0) }}</div>
                <div class="user-details">
                  <div class="user-name">{{ user.name }}</div>
                  <div class="user-email">{{ user.email }}</div>
                  <div class="user-meta">
                    <span class="user-role">{{ user.role }}</span>
                    <span class="signup-date">Cadastrado em: {{ formatDate(user.createdAt ?? '') }}</span>
                  </div>
                </div>
              </div>
              <div class="user-actions">
                <button @click="handleApproveUser(user.id)" class="btn-approve" :disabled="approvingUserId === user.id">
                  {{ approvingUserId === user.id ? 'Aprovando...' : 'Aprovar' }}
                </button>
                <button @click="viewUserDetails(user)" class="btn-view">Ver Detalhes</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Lista de Todos os Usuários -->
        <div class="section">
          <h3>Todos os Usuários</h3>
          <div v-if="users.length === 0" class="empty-state">
            <p>Nenhum usuário encontrado</p>
          </div>
          <div v-else class="users-table">
            <table>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="user in users" :key="user.id">
                  <td>{{ user.name }}</td>
                  <td>{{ user.email }}</td>
                  <td><span class="role-badge">{{ user.role }}</span></td>
                  <td>
                    <span :class="['status-badge', user.approved ? 'approved' : 'pending']">
                      {{ user.approved ? 'Aprovado' : 'Pendente' }}
                    </span>
                  </td>
                  <td>
                    <div class="table-actions">
                      <button @click="viewUserDetails(user)" class="btn-sm">Ver</button>
                      <button v-if="!user.approved" @click="handleApproveUser(user.id)"
                        class="btn-sm btn-success">Aprovar</button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        Modal
        <div v-if="showUserModal" class="modal-overlay">
          <div class="modal">
            <h3>Detalhes do Usuário</h3>
            <p><strong>Nome:</strong> {{ selectedUser?.name }}</p>
            <p><strong>Email:</strong> {{ selectedUser?.email }}</p>
            <p><strong>Role:</strong> {{ selectedUser?.role }}</p>
            <p><strong>Status:</strong> {{ selectedUser?.approved ? 'Aprovado' : 'Pendente' }}</p>
            <p><strong>Cadastrado em:</strong> {{ formatDate(selectedUser?.createdAt ?? '') }}</p>

            <div class="modal-actions">
              <button v-if="selectedUser && !selectedUser.approved" @click="handleApproveUser(selectedUser.id)"
                class="btn-approve" :disabled="approvingUserId === selectedUser.id">
                {{ approvingUserId === selectedUser.id ? 'Aprovando...' : 'Aprovar' }}
              </button>
              <button @click="closeUserModal" class="btn-close">Fechar</button>
            </div>
          </div>
        </div>
        <!-- Animação de Sucesso -->
        <div v-if="showSuccess" class="success-overlay">
          <Vue3Lottie :animation-data="checkSuccess" :loop="false" :autoplay="true"
            style="width:150px; height:150px;" />
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from "vue";
import { getAllUsers, approveUser } from "../../api/user";
import { Vue3Lottie } from "vue3-lottie";
import checkSuccess from "@/assets/check/check-success.json";
import DashboardLayout from "@/layouts/DashboardLayout.vue";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  approved: boolean;
  createdAt?: string;
}

export default defineComponent({
  name: 'AdminUsers',
  components: {
    Vue3Lottie,
    DashboardLayout
  },
  setup() {
    const users = ref<User[]>([]);
    const approvingUserId = ref<number | null>(null);
    const loading = ref(true);
    const pendingUsers = ref<User[]>([]);
    const approvedUsers = ref<User[]>([]);
    const showSuccess = ref(false);
    const showUserModal = ref(false);
    const selectedUser = ref<User | null>(null);


    const loadUsers = async () => {
      try {
        console.log('=== INVESTIGAÇÃO DA API ===');
        const usersData = await getAllUsers();

        // DEBUG DETALHADO - verifique CADA usuário
        console.log('📊 DETALHES DE CADA USUÁRIO DA API:');
        usersData.forEach((user: any, index: number) => {
          console.log(`👤 Usuário ${index + 1}:`, {
            id: user.id,
            name: user.name,
            email: user.email,
            approved: user.approved,
            // Verifique se há campos com nomes diferentes
            todosOsCampos: user
          });
        });

        // Verifique se há algum campo diferente para "approved"
        if (usersData.length > 0) {
          const primeiroUsuario = usersData[0];
          console.log('🔍 TODAS AS CHAVES do primeiro usuário:', Object.keys(primeiroUsuario));
          console.log('🔍 VALORES do primeiro usuário:', primeiroUsuario);
        }

        users.value = [...usersData];
        pendingUsers.value = users.value.filter(user => !user.approved);
        approvedUsers.value = users.value.filter(user => user.approved);

        console.log('=== RESUMO FINAL ===');
        console.log('Total:', users.value.length);
        console.log('Pendentes (approved=false):', pendingUsers.value.length);
        console.log('Aprovados (approved=true):', approvedUsers.value.length);

      } catch (error) {
        console.error('Erro ao carregar usuários:', error);
      } finally {
        loading.value = false;
      }
    };

    const handleApproveUser = async (userId: number) => {
      console.group('=== PROCESSO DE APROVAÇÃO ===');

      try {
        console.log('1. Validando dados...');
        if (!userId || userId <= 0) {
          throw new Error('ID do usuário inválido');
        }

        const userIndex = users.value.findIndex(u => u.id === userId);
        if (userIndex === -1) {
          throw new Error(`Usuário com ID ${userId} não encontrado`);
        }

        if (users.value[userIndex].approved) {
          throw new Error('Usuário já está aprovado');
        }

        console.log('2. Iniciando aprovação...');
        approvingUserId.value = userId;

        console.log('3. Chamando API...');
        await approveUser(userId);
        console.log('API chamada com sucesso');

        console.log('4. Atualizando estado local...');
        // CORREÇÃO: Atualizar o objeto de usuário de forma reativa
        users.value[userIndex] = {
          ...users.value[userIndex],
          approved: true
        };

        // CORREÇÃO: Recriar os arrays para forçar reatividade
        users.value = [...users.value];
        pendingUsers.value = [...users.value.filter(user => !user.approved)];
        approvedUsers.value = [...users.value.filter(user => user.approved)];

        console.log('5. Verificação pós-atualização local:');
        const updatedUser = users.value.find(u => u.id === userId);
        console.log('Usuário atualizado localmente:', {
          id: updatedUser?.id,
          name: updatedUser?.name,
          approved: updatedUser?.approved
        });

        console.log('6. Sincronizando com servidor...');
        await loadUsers(); // Isso deve confirmar os dados

        console.log('7. Mostrando feedback...');
        showSuccess.value = true;
        setTimeout(() => {
          showSuccess.value = false;
        }, 3500);

        console.log('8. Limpando estados...');
        if (selectedUser.value?.id === userId) {
          closeUserModal();
        }

        console.log('✅ Aprovação concluída com sucesso!');

      } catch (error: any) {
        console.error('❌ Erro na aprovação:', error);

        const errorMessage = error.response?.data?.message ||
          error.message ||
          'Erro ao aprovar usuário';

        alert(`Erro: ${errorMessage}`);

      } finally {
        approvingUserId.value = null;
        console.groupEnd();
      }
    };

    const viewUserDetails = (user: User) => {
      selectedUser.value = { ...user };
      showUserModal.value = true;
    };

    const closeUserModal = () => {
      showUserModal.value = false;
      selectedUser.value = null;
    };

    const formatDate = (dateString: string) => {
      if (!dateString) return 'Data não disponível';
      try {
        return new Date(dateString).toLocaleDateString('pt-BR');
      } catch {
        return 'Data inválida';
      }
    };

    onMounted(() => {
      loadUsers();
    });

    return {
      users,
      pendingUsers,
      approvedUsers,
      approvingUserId,
      loading,
      handleApproveUser,
      viewUserDetails,
      formatDate,
      showSuccess,
      checkSuccess,
      selectedUser,
      showUserModal,
      closeUserModal
    };
  },
});
</script>

<style scoped>
.admin-users {
  padding: 20px;
}

.page-header {
  margin-bottom: 30px;
}

.page-header h2 {
  margin: 0;
  color: var(--color-heading);
}

.page-header p {
  margin: 5px 0 0;
  color: var(--color-text-secondary);
}

.stats-card {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-item {
  background: var(--card-bg);
  padding: 20px;
  border-radius: 10px;
  text-align: center;
  border: 1px solid var(--card-border);
}

.stat-value {
  font-size: 2.5em;
  font-weight: bold;
  color: var(--primary-color);
}

.stat-label {
  color: var(--color-text-secondary);
  font-size: 0.9em;
}

.section {
  margin-bottom: 30px;
}

.section h3 {
  margin-bottom: 15px;
  color: var(--color-heading);
}

.empty-state {
  text-align: center;
  padding: 40px;
  color: var(--color-text-secondary);
}

.users-list {
  display: grid;
  gap: 15px;
}

.user-card {
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: 10px;
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.user-card.pending {
  border-left: 4px solid #f59e0b;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 15px;
}

.user-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: var(--primary-color);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 1.2em;
}

.user-details {
  flex: 1;
}

.user-name {
  font-weight: bold;
  margin-bottom: 5px;
}

.user-email {
  color: var(--color-text-secondary);
  margin-bottom: 5px;
}

.user-meta {
  display: flex;
  gap: 15px;
  font-size: 0.9em;
}

.user-role {
  background: var(--primary-color);
  color: white;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 0.8em;
}

.signup-date {
  color: var(--color-text-secondary);
}

.user-actions {
  display: flex;
  gap: 10px;
}

.btn-approve,
.btn-view {
  padding: 8px 16px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 0.9em;
}

.btn-approve {
  background: #10b981;
  color: white;
}

.btn-approve:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.btn-view {
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  color: var(--color-text);
}

.users-table {
  background: var(--card-bg);
  border-radius: 10px;
  overflow: hidden;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  padding: 12px 15px;
  text-align: left;
  border-bottom: 1px solid var(--card-border);
}

th {
  background: var(--table-header-bg);
  font-weight: 600;
}

.role-badge {
  background: var(--primary-color);
  color: white;
  padding: 4px 8px;
  border-radius: 10px;
  font-size: 0.8em;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 10px;
  font-size: 0.8em;
  font-weight: 500;
}

.status-badge.approved {
  background: #d1fae5;
  color: #065f46;
}

.status-badge.pending {
  background: #fef3c7;
  color: #92400e;
}

.table-actions {
  display: flex;
  gap: 5px;
}

.btn-sm {
  padding: 4px 8px;
  border: none;
  border-radius: 3px;
  cursor: pointer;
  font-size: 0.8em;
}

.btn-success {
  background: #10b981;
  color: white;
}

.success-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.4);
  z-index: 9999;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.modal {
  background: var(--card-bg);
  padding: 20px;
  border-radius: 10px;
  width: 400px;
  max-width: 90%;
  color: var(--color-text);
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.btn-close {
  background: #ef4444;
  color: white;
  padding: 8px 16px;
  border-radius: 5px;
  border: none;
  cursor: pointer;
}

.loading-state {
  text-align: center;
  padding: 40px;
  color: var(--color-text-secondary);
}

.btn-approve:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>