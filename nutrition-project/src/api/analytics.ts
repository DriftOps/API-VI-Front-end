// export interface AnalyticsResponse {
//   totalUsers: number;
//   approvedUsers: number;
//   pendingUsers: number;
//   activeUsers: number;
//   newUsers: number;
//   userGrowth: number;
//   approvalRate: number;
//   activityGrowth: number;
//   userRegistrationData: any[];
//   roleDistribution: any[];
//   recentActivity: any[];
// }

// export const getAnalyticsData = async (period: string = '7'): Promise<AnalyticsResponse> => {
//   const token = localStorage.getItem('token');
  
//   const response = await fetch(`${API_URL}/analytics?period=${period}`, {
//     headers: {
//       'Authorization': `Bearer ${token}`,
//     },
//   });

//   if (!response.ok) {
//     throw new Error('Erro ao carregar dados analíticos');
//   }

//   return response.json();
// };