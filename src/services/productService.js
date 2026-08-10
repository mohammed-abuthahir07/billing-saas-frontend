import api from './api';

/**
 * Fetch all products for the currently logged-in user.
 * GET /api/products
 */
export const getProducts = async () => {
  const response = await api.get('/products');
  return response.data; // Array of product objects
};

/**
 * Create a new product.
 * POST /api/products
 * @param {{ name, sku, category, price, stock }} productData
 */
export const createProduct = async (productData) => {
  const response = await api.post('/products', productData);
  return response.data;
};

/**
 * Update an existing product.
 * PUT /api/products/:id
 * @param {number|string} id
 * @param {{ name, sku, category, price, stock }} productData
 */
export const updateProduct = async (id, productData) => {
  const response = await api.put(`/products/${id}`, productData);
  return response.data;
};

/**
 * Delete a product.
 * DELETE /api/products/:id
 * @param {number|string} id
 */
export const deleteProduct = async (id) => {
  const response = await api.delete(`/products/${id}`);
  return response.data;
};
