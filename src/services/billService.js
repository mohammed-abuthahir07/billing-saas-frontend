import api from './api';

/**
 * Create a new bill/invoice.
 * POST /api/billing/create
 *
 * Expected payload:
 * {
 *   customerName: string,
 *   customerEmail: string,
 *   items: [{ productId: number, quantity: number, price: number }],
 *   discount: number,   // percentage 0-100
 *   tax: number         // percentage 0-100
 * }
 *
 * The backend validates stock availability (MySQL) and returns an error
 * if any item's quantity exceeds available stock.
 * On success, the backend generates a PDF and may return a pdfUrl.
 */
export const createBill = async (billData) => {
  const response = await api.post('/billing/create', billData);
  return response.data;
};

/**
 * Fetch all bills for the current user.
 * GET /api/billing
 * Falls back gracefully if the endpoint doesn't exist.
 */
export const getBills = async () => {
  const response = await api.get('/billing');
  return response.data;
};
