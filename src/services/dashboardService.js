import api from './api';

/**
 * Fetch dashboard stats for the currently logged-in user.
 * GET /api/dashboard
 *
 * Response shape:
 * {
 *   success: true,
 *   dashboard: {
 *     totalProducts: number,
 *     totalStock: string,
 *     todaySales: string,
 *     monthlySales: string,
 *     yearlySales: string,
 *     totalRevenue: string,
 *     totalBills: number
 *   },
 *   recentBills: [],
 *   lowStockProducts: [],
 *   bestSellingProducts: []
 * }
 */
export const getDashboard = async () => {
  const response = await api.get('/dashboard');
  return response.data;
};
