import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  X,
  Package,
  DollarSign,
  Loader2,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../../services/productService';
import './Products.css';

const Products = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Loading & error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [editingProductId, setEditingProductId] = useState(null);

  // Form states aligned with Backend API keys
  const [formData, setFormData] = useState({
    itemName: "",
    category: "Software",
    sku: "",
    description: "",
    gst: "",
    quantity: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const categories = ['All', 'Software', 'Hardware', 'School Items', 'Masala', 'Other'];

  // ── Show a toast notification ──────────────────────────────────────────────
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3500);
  };

  // ── Fetch all products from API ────────────────────────────────────────────
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getProducts();
      const list = Array.isArray(data) ? data : (data.products || []);
      setProducts(list);
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || 'Failed to load products.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // ── Filter products client-side ────────────────────────────────────────────
  const filteredProducts = products.filter(product => {
    // Robust naming checks to prevent app crashes if fields are missing
    const productName = product.itemName || product.name || product.item_name || '';
    const productSku = product.sku || '';
    
    const matchesSearch =
      productName.toLowerCase().includes(search.toLowerCase()) ||
      productSku.toLowerCase().includes(search.toLowerCase());
      
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // ── Open modals ────────────────────────────────────────────────────────────
  const handleOpenCreateModal = () => {
    setModalMode('create');
    setFormData({ 
      itemName: '', 
      sku: '', 
      category: 'Software', 
      description: '', 
      gst: '', 
      quantity: '', 

    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (product) => {
    setModalMode('edit');
    setEditingProductId(product.id);
    setFormData({
      itemName: product.itemName || product.name || product.item_name || '',
      sku: product.sku || '',
      category: product.category || 'Software',
      description: product.description || '',
      gst: product.gst !== undefined ? product.gst : '',
      quantity: product.quantity !== undefined ? product.quantity : ''
    });
    setIsModalOpen(true);
  };

  // ── Delete product ─────────────────────────────────────────────────────────
  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await deleteProduct(id);
      setProducts(prev => prev.filter(p => p.id !== id));
      showToast('Product deleted successfully.');
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || 'Failed to delete product.';
      showToast(msg, 'error');
    }
  };

  // ── Submit create / edit ───────────────────────────────────────────────────
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const payload = {
      itemName: formData.itemName.trim(),
      category: formData.category,
      sku: formData.sku.trim() || `PROD-${Math.floor(Math.random() * 100000)}`,
      description: formData.description.trim(),
      gst: parseFloat(formData.gst) || 0,
      quantity: parseInt(formData.quantity, 10) || 0,
    };

    try {
      if (modalMode === 'create') {
        const data = await createProduct(payload);
        const newProduct = data.product || data;
        setProducts(prev => [newProduct, ...prev]);
        showToast('Product created successfully!');
      } else {
        const data = await updateProduct(editingProductId, payload);
        const updatedProduct = data.product || { ...payload, id: editingProductId };
        setProducts(prev =>
          prev.map(p => p.id === editingProductId ? updatedProduct : p)
        );
        showToast('Product updated successfully!');
      }
      setIsModalOpen(false);
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || 'Operation failed. Please try again.';
      showToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Stock display helper ───────────────────────────────────────────────────
  const getStockBadgeClass = (stock) => {
    if (stock === null || stock === undefined) return 'in-stock';
    if (stock <= 0) return 'low-stock';
    if (stock <= 10) return 'low-stock';
    return 'in-stock';
  };

  return (
    <div className="products-container">
      {/* Toast Notification */}
      {toast.show && (
        <div className={`products-toast ${toast.type}`}>
          {toast.type === 'error' ? <AlertCircle size={16} /> : <Package size={16} />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <header className="products-header animate-slide-up">
        <div className="header-info">
          <h1>Products &amp; Services</h1>
          <p>Manage your product catalogue — pricing, stock and categories stored in MySQL.</p>
        </div>
        <button className="add-product-btn" onClick={handleOpenCreateModal}>
          <Plus size={18} />
          <span>Add Product</span>
        </button>
      </header>

      {/* Filters Bar */}
      <section className="filters-bar animate-slide-up delay-1">
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search by name or SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="category-filters">
          <Filter size={16} className="filter-icon" />
          {categories.map(cat => (
            <button
              key={cat}
              className={`category-tab ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Products Table */}
      <section className="products-card animate-slide-up delay-2">
        {/* Loading State */}
        {loading && (
          <div className="products-loading">
            <Loader2 size={32} className="spin-icon" />
            <p>Loading products from database...</p>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="products-error">
            <AlertCircle size={32} />
            <p>{error}</p>
            <button className="retry-btn" onClick={fetchProducts}>
              <RefreshCw size={16} /> Retry
            </button>
          </div>
        )}

        {/* Products Table */}
        {!loading && !error && (
          <div className="table-responsive">
            <table className="products-table">
              <thead>
                <tr>
                  <th>Product Info</th>
                  <th>SKU</th>
                  <th>Category</th>
                  <th>GST</th>
                  <th>Stock</th>
                  <th className="action-column">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.length > 0 ? (
                  filteredProducts.map(prod => (
                    <tr key={prod.id}>
                      <td className="product-info-cell">
                        <div className="prod-avatar">
                          <Package size={18} />
                        </div>
                        <div className="prod-meta">
                          {/* Fallback chain handles variant keys returned by MySQL/Sequelize */}
                          <span className="prod-name">
                            {prod.itemName || prod.name || prod.item_name || 'Unnamed Product'}
                          </span>
                        </div>
                      </td>
                      <td className="font-mono text-sm">{prod.sku || '—'}</td>
                      <td>
                        <span className={`category-badge ${(prod.category || 'other').toLowerCase()}`}>
                          {prod.category || 'Other'}
                        </span>
                      </td>
                      <td className="price-cell">
                        {prod.gst}%
                      </td>
                      <td>
                        <span className={`stock-badge ${getStockBadgeClass(prod.quantity)}`}>
                          {prod.quantity !== undefined && prod.quantity !== null ? prod.quantity : 0}
                          {prod.quantity <= 10 && prod.quantity > 0 && <span className="low-label"> Low</span>}
                          {prod.quantity === 0 && <span className="low-label"> Out</span>}
                        </span>
                
                      </td>
                      
                      <td className="action-column">
                        <div className="action-buttons">
                          <button
                            className="edit-action"
                            onClick={() => handleOpenEditModal(prod)}
                            title="Edit"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            className="delete-action"
                            onClick={() => handleDeleteProduct(prod.id)}
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="empty-table-cell">
                      <Package size={40} style={{ opacity: 0.3 }} />
                      <p>
                        {products.length === 0
                          ? 'No products yet. Click "Add Product" to create your first one.'
                          : 'No products match your search filters.'}
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-card animate-scale-up" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setIsModalOpen(false)}>
              <X size={20} />
            </button>
            <div className="modal-header">
              <h2>{modalMode === 'create' ? 'Add New Product' : 'Edit Product'}</h2>
              <p>
                {modalMode === 'create'
                  ? 'Product will be saved to the MySQL database.'
                  : 'Changes will be updated in the database.'}
              </p>
            </div>

            <form onSubmit={handleFormSubmit} className="modal-form">
              <div className="form-group">
                <label>Product Name *</label>
                <input
                  type="text"
                  name="itemName"
                  placeholder="e.g. Premium Cotton Fabric"
                  value={formData.itemName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label>Category</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                  >
<option value="Software">Software</option>
<option value="Hardware">Hardware</option>
<option value="Electronics">Electronics</option>
<option value="Services">Services</option>
<option value="Consulting">Consulting</option>

<option value="Masala & Spices">Masala & Spices</option>
<option value="Groceries">Groceries</option>
<option value="Beverages">Beverages</option>
<option value="Bakery & Confectionery">Bakery & Confectionery</option>
<option value="Dairy & Dairy Products">Dairy & Dairy Products</option>
<option value="Organic & Health Food">Organic & Health Food</option>
<option value="Packaged Foods">Packaged Foods</option>

<option value="Kitchenware">Kitchenware</option>
<option value="Home Appliances">Home Appliances</option>
<option value="Furniture">Furniture</option>
<option value="Home Decor">Home Decor</option>
<option value="Cleaning & Housekeeping">Cleaning & Housekeeping</option>
<option value="Bed & Bath">Bed & Bath</option>

<option value="Apparel & Clothing">Apparel & Clothing</option>
<option value="Footwear">Footwear</option>
<option value="Fashion Accessories">Fashion Accessories</option>
<option value="Jewelry & Watches">Jewelry & Watches</option>
<option value="Beauty & Cosmetics">Beauty & Cosmetics</option>
<option value="Personal Care & Hygiene">Personal Care & Hygiene</option>

<option value="Sports Equipment">Sports Equipment</option>
<option value="Fitness & Gym">Fitness & Gym</option>
<option value="Outdoor & Camping">Outdoor & Camping</option>
<option value="Toys & Games">Toys & Games</option>

<option value="Medical & Healthcare">Medical & Healthcare</option>
<option value="Pharmaceuticals">Pharmaceuticals</option>
<option value="Supplements & Nutrition">Supplements & Nutrition</option>

<option value="Stationery & Office Supplies">Stationery & Office Supplies</option>
<option value="Books & Media">Books & Media</option>
<option value="Educational Materials">Educational Materials</option>

<option value="Industrial Equipment">Industrial Equipment</option>
<option value="Tools & Hardware">Tools & Hardware</option>
<option value="Electrical Supplies">Electrical Supplies</option>
<option value="Plumbing Supplies">Plumbing Supplies</option>
<option value="Safety & Security Gear">Safety & Security Gear</option>
<option value="Raw Materials">Raw Materials</option>
<option value="Packaging Materials">Packaging Materials</option>

<option value="Automotive Parts">Automotive Parts</option>
<option value="Vehicle Accessories">Vehicle Accessories</option>

<option value="Pet Supplies">Pet Supplies</option>
<option value="Gardening & Lawn Care">Gardening & Lawn Care</option>
<option value="Handicrafts & Art">Handicrafts & Art</option>
<option value="Gifts & Novelties">Gifts & Novelties</option>
<option value="Baby Care & Products">Baby Care & Products</option>
<option value="School Items">School Items</option>

<option value="Other">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>SKU Code</label>
                  <input
                    type="text"
                    name="sku"
                    placeholder="e.g. FAB-COT-001"
                    value={formData.sku}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group full-width">
                  <label>Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Enter product description"
                    rows={3}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>GST (%)</label>
                  <input
                    type="number"
                    name="gst"
                    value={formData.gst}
                    onChange={handleChange}
                    placeholder="Enter GST"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Stock Count *</label>
                  <input
                    type="number"
                    name="quantity"
                    min="0"
                    placeholder="e.g. 50"
                    value={formData.quantity}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="modal-submit-btn" disabled={submitting}>
                {submitting ? (
                  <><Loader2 size={16} className="spin-icon" /> Saving...</>
                ) : (
                  modalMode === 'create' ? 'Create Product' : 'Save Changes'
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;