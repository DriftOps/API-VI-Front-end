<template>
  <DashboardLayout>
    <div class="analytics-page">
      <div class="page-header">
        <h2>Analytics</h2>
        <p>Métricas e insights do sistema</p>
      </div>

      <!-- Filtros -->
      <div class="filters-section">
        <div class="filter-group">
          <label>Período:</label>
          <select v-model="selectedPeriod" @change="loadAnalyticsData">
            <option value="7">Últimos 7 dias</option>
            <option value="30">Últimos 30 dias</option>
            <option value="90">Últimos 3 meses</option>
          </select>
        </div>
        <div class="filter-group">
          <label>Métrica:</label>
          <select v-model="selectedMetric">
            <option value="users">Usuários</option>
            <option value="activity">Atividade</option>
            <option value="growth">Crescimento</option>
          </select>
        </div>
      </div>

      <!-- Cards de Estatísticas -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">👥</div>
          <div class="stat-content">
            <div class="stat-value">{{ analyticsData.totalUsers }}</div>
            <div class="stat-label">Total de Usuários</div>
            <div class="stat-trend" :class="getTrendClass(analyticsData.userGrowth)">
              {{ analyticsData.userGrowth }}%
            </div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">✅</div>
          <div class="stat-content">
            <div class="stat-value">{{ analyticsData.approvedUsers }}</div>
            <div class="stat-label">Usuários Aprovados</div>
            <div class="stat-trend" :class="getTrendClass(analyticsData.approvalRate)">
              {{ analyticsData.approvalRate }}%
            </div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">⏳</div>
          <div class="stat-content">
            <div class="stat-value">{{ analyticsData.pendingUsers }}</div>
            <div class="stat-label">Aguardando Aprovação</div>
            <div class="stat-badge pending">{{ analyticsData.pendingUsers }}</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">📈</div>
          <div class="stat-content">
            <div class="stat-value">{{ analyticsData.activeUsers }}</div>
            <div class="stat-label">Usuários Ativos</div>
            <div class="stat-trend" :class="getTrendClass(analyticsData.activityGrowth)">
              {{ analyticsData.activityGrowth }}%
            </div>
          </div>
        </div>
      </div>

      <!-- Gráficos e Visualizações -->
      <div class="charts-grid">
        <!-- Gráfico de Registro de Usuários -->
        <div class="chart-card">
          <div class="chart-header">
            <h3>Registro de Usuários</h3>
            <span class="chart-subtitle">Últimos {{ selectedPeriod }} dias</span>
          </div>
          <div class="chart-container">
            <div v-if="loading" class="chart-loading">Carregando gráfico...</div>
            <div v-else class="chart-placeholder">
              <!-- Aqui você pode integrar Chart.js, ApexCharts, etc -->
              <div class="bar-chart">
                <div v-for="(item, index) in userRegistrationData" :key="index" class="bar-item">
                  <div class="bar-label">{{ item.label }}</div>
                  <div class="bar-track">
                    <div class="bar-fill" :style="{ height: item.value + '%' }"
                      :class="{ 'current-day': item.isToday }"></div>
                  </div>
                  <div class="bar-value">{{ item.count }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Distribuição por Role -->
        <div class="chart-card">
          <div class="chart-header">
            <h3>Distribuição por Cargo</h3>
          </div>
          <div class="chart-container">
            <div class="pie-chart-placeholder">
              <div v-for="role in roleDistribution" :key="role.name" class="pie-item">
                <div class="pie-color" :style="{ backgroundColor: role.color }"></div>
                <div class="pie-label">{{ role.name }}</div>
                <div class="pie-value">{{ role.count }} ({{ role.percentage }}%)</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Atividade Recente -->
        <div class="chart-card full-width">
          <div class="chart-header">
            <h3>Atividade Recente</h3>
          </div>
          <div class="activity-list">
            <div v-if="recentActivity.length === 0" class="empty-activity">
              Nenhuma atividade recente
            </div>
            <div v-else>
              <div v-for="activity in recentActivity" :key="activity.id" class="activity-item">
                <div class="activity-icon" :class="activity.type">
                  {{ getActivityIcon(activity.type) }}
                </div>
                <div class="activity-content">
                  <div class="activity-message">{{ activity.message }}</div>
                  <div class="activity-time">{{ formatTime(activity.timestamp) }}</div>
                </div>
                <div class="activity-user">{{ activity.user }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tabela de Métricas Detalhadas -->
      <div class="metrics-table-section">
        <h3>Métricas Detalhadas</h3>
        <div class="metrics-table">
          <table>
            <thead>
              <tr>
                <th>Métrica</th>
                <th>Valor Atual</th>
                <th>Variação</th>
                <th>Status</th>
                <th>Tendência</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Taxa de Aprovação</td>
                <td>{{ analyticsData.approvalRate }}%</td>
                <td :class="getVariationClass(5)">+5%</td>
                <td><span class="status-badge positive">Positivo</span></td>
                <td>📈</td>
              </tr>
              <tr>
                <td>Novos Usuários (7d)</td>
                <td>{{ analyticsData.newUsers }}</td>
                <td :class="getVariationClass(2)">+2</td>
                <td><span class="status-badge stable">Estável</span></td>
                <td>→</td>
              </tr>
              <tr>
                <td>Usuários Ativos</td>
                <td>{{ analyticsData.activeUsers }}</td>
                <td :class="getVariationClass(8)">+8%</td>
                <td><span class="status-badge positive">Positivo</span></td>
                <td>📈</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';

interface AnalyticsData {
  totalUsers: number;
  approvedUsers: number;
  pendingUsers: number;
  activeUsers: number;
  newUsers: number;
  userGrowth: number;
  approvalRate: number;
  activityGrowth: number;
}

interface Activity {
  id: number;
  type: string;
  message: string;
  timestamp: string;
  user: string;
}

interface RoleDistribution {
  name: string;
  count: number;
  percentage: number;
  color: string;
}

export default defineComponent({
  name: 'AnalyticsPage',
  setup() {
    const selectedPeriod = ref('7');
    const selectedMetric = ref('users');
    const loading = ref(false);

    const analyticsData = ref<AnalyticsData>({
      totalUsers: 0,
      approvedUsers: 0,
      pendingUsers: 0,
      activeUsers: 0,
      newUsers: 0,
      userGrowth: 0,
      approvalRate: 0,
      activityGrowth: 0
    });

    const recentActivity = ref<Activity[]>([]);
    const roleDistribution = ref<RoleDistribution[]>([]);
    const userRegistrationData = ref<any[]>([]);

    const loadAnalyticsData = async () => {
      loading.value = true;
      try {
        // Simulação de dados - substitua por chamada real à API
        await new Promise(resolve => setTimeout(resolve, 1000));

        analyticsData.value = {
          totalUsers: 154,
          approvedUsers: 142,
          pendingUsers: 12,
          activeUsers: 89,
          newUsers: 23,
          userGrowth: 15,
          approvalRate: 92,
          activityGrowth: 8
        };

        // Dados de exemplo para gráficos
        userRegistrationData.value = [
          { label: 'Seg', value: 60, count: 12, isToday: false },
          { label: 'Ter', value: 45, count: 9, isToday: false },
          { label: 'Qua', value: 75, count: 15, isToday: false },
          { label: 'Qui', value: 30, count: 6, isToday: false },
          { label: 'Sex', value: 90, count: 18, isToday: false },
          { label: 'Sáb', value: 50, count: 10, isToday: false },
          { label: 'Dom', value: 40, count: 8, isToday: true }
        ];

        roleDistribution.value = [
          { name: 'ADMIN', count: 5, percentage: 3, color: '#ef4444' },
          { name: 'USER', count: 120, percentage: 78, color: '#3b82f6' },
          { name: 'MODERATOR', count: 29, percentage: 19, color: '#10b981' }
        ];

        recentActivity.value = [
          {
            id: 1,
            type: 'user_approved',
            message: 'Novo usuário aprovado',
            timestamp: new Date().toISOString(),
            user: 'João Silva'
          },
          {
            id: 2,
            type: 'user_registered',
            message: 'Novo cadastro realizado',
            timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
            user: 'Maria Santos'
          },
          {
            id: 3,
            type: 'login',
            message: 'Login realizado',
            timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
            user: 'Admin'
          }
        ];

      } catch (error) {
        console.error('Erro ao carregar dados analíticos:', error);
      } finally {
        loading.value = false;
      }
    };

    const getTrendClass = (value: number) => {
      if (value > 0) return 'positive';
      if (value < 0) return 'negative';
      return 'neutral';
    };

    const getVariationClass = (value: number) => {
      return value >= 0 ? 'positive' : 'negative';
    };

    const getActivityIcon = (type: string) => {
      const icons: { [key: string]: string } = {
        user_approved: '✅',
        user_registered: '👤',
        login: '🔐',
        logout: '🚪',
        update: '✏️'
      };
      return icons[type] || '📝';
    };

    const formatTime = (timestamp: string) => {
      return new Date(timestamp).toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    onMounted(() => {
      loadAnalyticsData();
    });

    return {
      selectedPeriod,
      selectedMetric,
      loading,
      analyticsData,
      recentActivity,
      roleDistribution,
      userRegistrationData,
      loadAnalyticsData,
      getTrendClass,
      getVariationClass,
      getActivityIcon,
      formatTime
    };
  }
});
</script>

<style scoped>
.analytics-page {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 30px;
}

.page-header h2 {
  margin: 0;
  color: var(--color-heading);
  font-size: 2em;
}

.page-header p {
  margin: 5px 0 0;
  color: var(--color-text-secondary);
}

.filters-section {
  display: flex;
  gap: 20px;
  margin-bottom: 30px;
  padding: 20px;
  background: var(--card-bg);
  border-radius: 10px;
  border: 1px solid var(--card-border);
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.filter-group label {
  font-weight: 600;
  color: var(--color-text);
  font-size: 0.9em;
}

.filter-group select {
  padding: 8px 12px;
  border: 1px solid var(--card-border);
  border-radius: 5px;
  background: var(--bg-color);
  color: var(--color-text);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: var(--card-bg);
  padding: 20px;
  border-radius: 10px;
  border: 1px solid var(--card-border);
  display: flex;
  align-items: center;
  gap: 15px;
}

.stat-icon {
  font-size: 2em;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--primary-color);
  border-radius: 10px;
  color: white;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 2em;
  font-weight: bold;
  color: var(--color-heading);
  line-height: 1;
}

.stat-label {
  color: var(--color-text-secondary);
  margin: 5px 0;
}

.stat-trend {
  font-size: 0.9em;
  font-weight: 600;
}

.stat-trend.positive {
  color: #10b981;
}

.stat-trend.negative {
  color: #ef4444;
}

.stat-trend.neutral {
  color: #6b7280;
}

.stat-badge.pending {
  background: #f59e0b;
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.8em;
}

.charts-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 20px;
  margin-bottom: 30px;
}

.chart-card {
  background: var(--card-bg);
  border-radius: 10px;
  border: 1px solid var(--card-border);
  padding: 20px;
}

.chart-card.full-width {
  grid-column: 1 / -1;
}

.chart-header {
  margin-bottom: 20px;
}

.chart-header h3 {
  margin: 0;
  color: var(--color-heading);
}

.chart-subtitle {
  color: var(--color-text-secondary);
  font-size: 0.9em;
}

.chart-container {
  min-height: 200px;
}

.chart-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: var(--color-text-secondary);
}

/* Gráfico de barras simples */
.bar-chart {
  display: flex;
  align-items: end;
  gap: 10px;
  height: 200px;
  padding: 20px 0;
}

.bar-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  gap: 5px;
}

.bar-track {
  width: 30px;
  height: 150px;
  background: var(--card-border);
  border-radius: 5px;
  position: relative;
}

.bar-fill {
  position: absolute;
  bottom: 0;
  width: 100%;
  background: var(--primary-color);
  border-radius: 5px;
  transition: height 0.3s ease;
}

.bar-fill.current-day {
  background: #10b981;
}

.bar-label {
  font-size: 0.8em;
  color: var(--color-text-secondary);
}

.bar-value {
  font-size: 0.9em;
  font-weight: 600;
}

/* Gráfico de pizza simples */
.pie-chart-placeholder {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.pie-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px;
  border-radius: 5px;
  background: var(--bg-color);
}

.pie-color {
  width: 20px;
  height: 20px;
  border-radius: 50%;
}

.pie-label {
  flex: 1;
  font-weight: 500;
}

.pie-value {
  color: var(--color-text-secondary);
  font-size: 0.9em;
}

/* Lista de atividades */
.activity-list {
  max-height: 400px;
  overflow-y: auto;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  border-bottom: 1px solid var(--card-border);
}

.activity-item:last-child {
  border-bottom: none;
}

.activity-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-color);
  border-radius: 50%;
  font-size: 1.2em;
}

.activity-content {
  flex: 1;
}

.activity-message {
  font-weight: 500;
  margin-bottom: 2px;
}

.activity-time {
  color: var(--color-text-secondary);
  font-size: 0.8em;
}

.activity-user {
  color: var(--color-text-secondary);
  font-size: 0.9em;
}

.empty-activity {
  text-align: center;
  padding: 40px;
  color: var(--color-text-secondary);
}

/* Tabela de métricas */
.metrics-table-section {
  margin-top: 30px;
}

.metrics-table-section h3 {
  margin-bottom: 15px;
  color: var(--color-heading);
}

.metrics-table {
  background: var(--card-bg);
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid var(--card-border);
}

.metrics-table table {
  width: 100%;
  border-collapse: collapse;
}

.metrics-table th,
.metrics-table td {
  padding: 12px 15px;
  text-align: left;
  border-bottom: 1px solid var(--card-border);
}

.metrics-table th {
  background: var(--table-header-bg);
  font-weight: 600;
  color: var(--color-heading);
}

.status-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.8em;
  font-weight: 500;
}

.status-badge.positive {
  background: #d1fae5;
  color: #065f46;
}

.status-badge.negative {
  background: #fee2e2;
  color: #991b1b;
}

.status-badge.stable {
  background: #fef3c7;
  color: #92400e;
}

.positive {
  color: #10b981;
}

.negative {
  color: #ef4444;
}

/* Responsividade */
@media (max-width: 768px) {
  .charts-grid {
    grid-template-columns: 1fr;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .filters-section {
    flex-direction: column;
  }
}
</style>