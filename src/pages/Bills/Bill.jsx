import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useAuth } from '../../context/AuthContext';
import { useReactToPrint } from "react-to-print";
import {
  Receipt,
  Plus,
  Trash2,
  Printer,
  Eye,
  X,
  AlertTriangle,
  Loader2,
  RefreshCw,
  Download,
  Package,
  User,
  Save,
  CheckCircle,
  Clock
} from 'lucide-react';
import { getProducts } from '../../services/productService';
import { createBill, getBills } from '../../services/billService';
import './Bills.css';

const Bill = () => {
  const { user } = useAuth();
  const printRef = useRef(null);

  // Bills list
  const [invoices, setInvoices] = useState([]);
  const [billsLoading, setBillsLoading] = useState(true);
  const [billsError, setBillsError] = useState('');

  // Available products (from API) for the bill drawer
  const [availableProducts, setAvailableProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);

  const [sellerGST, setSellerGST] = useState("");

  // UI state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [stockError, setStockError] = useState('');
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // New bill form
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerGST, setCustomerGST] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split('T')[0];
  });
  
  // Line item initialization
  const [lineItems, setLineItems] = useState([]);

  // ── Toast helper ───────────────────────────────────────────────────────────
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 4000);
  };

  // ── Fetch products for dropdown ────────────────────────────────────────────
  const fetchProducts = useCallback(async () => {
    setProductsLoading(true);
    try {
      const data = await getProducts();
      const list = Array.isArray(data) ? data : (data.products || []);
      setAvailableProducts(list);
      
      if (list.length > 0) {
        setLineItems([
          {
            productName: list[0].item_name,
            quantity: 1,
            weight: "",
            unit: "Kg",
            sellingPrice: Number(list[0].price) || 0,
            price: Number(list[0].price) || 0,
            gst: Number(list[0].gst) || 0,
            stock: Number(list[0].quantity) || 0
          }
        ]);
      }
    } catch (err) {
      console.error('Failed to load products', err);
    } finally {
      setProductsLoading(false);
    }
  }, []);

  // ── Fetch existing bills ───────────────────────────────────────────────────
  const fetchBills = useCallback(async () => {
    setBillsLoading(true);
    setBillsError('');
    try {
      const data = await getBills();
      const list = Array.isArray(data) ? data : (data.bills || data.invoices || []);
      setInvoices(list);
    } catch (err) {
      if (err.response?.status === 404) {
        setInvoices([]);
      } else {
        const msg = err.response?.data?.message || err.response?.data?.error || 'Failed to load bills.';
        setBillsError(msg);
      }
    } finally {
      setBillsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
    fetchBills();
  }, [fetchProducts, fetchBills]);

  // ── Running totals calculation ─────────────────────────────────────
  const calculateTotals = () => {
    const subtotal = lineItems.reduce((sum, item) => {
      const unitPrice = Number(item.sellingPrice) || Number(item.price) || 0;
      return sum + unitPrice * (Number(item.quantity) || 0);
    }, 0);

    const gst = lineItems.reduce((sum, item) => {
      const unitPrice = Number(item.sellingPrice) || Number(item.price) || 0;
      return sum + (unitPrice * (Number(item.quantity) || 0) * (Number(item.gst) || 0)) / 100;
    }, 0);

    const grandTotal = subtotal + gst;
    return { subtotal, gst, total: grandTotal };
  };

  // const totals = calculateTotals();
  const totals = useMemo(() => {
    return calculateTotals();
}, [lineItems]);

  // ── Line item helpers ──────────────────────────────────────────────────────
  const handleAddLineItem = () => {
    if (availableProducts.length === 0) return;
    const first = availableProducts[0];
    setLineItems([
      ...lineItems,
      {
        productName: first.item_name,
        quantity: 1,
        weight: "",
        unit: "Kg",
        sellingPrice: Number(first.price) || 0,
        price: Number(first.price) || 0,
        gst: Number(first.gst) || 0,
        stock: Number(first.quantity) || 0
      }
    ]);
  };

  const handleRemoveLineItem = (index) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter((_, i) => i !== index));
    }
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...lineItems];
    
    if (field === 'productName') {
      const product = availableProducts.find(p => p.item_name === value);
      if (product) {
        newItems[index] = {
          ...newItems[index],
          productName: product.item_name,
          quantity: 1,
          price: Number(product.price) || 0,
          sellingPrice: Number(product.price) || 0,
          gst: Number(product.gst) || 0,
          stock: Number(product.quantity) || 0
        };
      }
    } else if (field === 'quantity') {
      newItems[index].quantity = value === "" ? "" : parseInt(value, 10);
    } else if (field === "weight") {
      newItems[index].weight = value;
    } else if (field === "unit") {
      newItems[index].unit = value;
    } else if (field === "sellingPrice") {
      newItems[index].sellingPrice = value;
    }
    setLineItems(newItems);
    setStockError('');
  };

  // ── Open drawer ────────────────────────────────────────────────────────────
  const handleOpenCreateDrawer = () => {
    setCustomerName('');
    setCustomerEmail('');
    setCustomerGST('');
    setCustomerAddress('');
    setStockError('');
    if (availableProducts.length > 0) {
      const first = availableProducts[0];
      setLineItems([
        {
          productName: first.item_name,
          quantity: 1,
          weight: "",
          unit: "Kg",
          sellingPrice: Number(first.price) || 0,
          price: Number(first.price) || 0,
          gst: Number(first.gst) || 0,
          stock: Number(first.quantity) || 0
        }
      ]);
    } else {
      setLineItems([{ productName: "", quantity: 1, weight: "", unit: "Kg", sellingPrice: 0, price: 0, gst: 0, stock: 0 }]);
    }
    setIsDrawerOpen(true);
  };

  // ── Stock validation ───────────────────────────────────────────────────────
  const validateStock = () => {
    for (const item of lineItems) {
      if (item.stock !== undefined && item.stock !== null && item.stock < item.quantity) {
        return `Insufficient stock for "${item.productName}". Available: ${item.stock}, Requested: ${item.quantity}`;
      }
    }
    return null;
  };

  // ── Print & PDF Handlers ───────────────────────────────────────────────────
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Invoice-${selectedInvoice?.invoice_number || selectedInvoice?.bill_number || 'Receipt'}`,
    pageStyle: `
      @page {
        size: A4;
        margin: 12mm;
      }
      body {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      .receipt-printable-area {
        width: 100%;
        padding: 0;
        margin: 0;
        transform: none !important;
      }
    `
  });

  const handleDownloadPDF = async (inv) => {
    const targetInvoice = inv || selectedInvoice;
    if (!printRef.current) return;

    try {
      const canvas = await html2canvas(printRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#fff"
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");

      const pdfWidth = pdf.internal.pageSize.getWidth(); // 210mm
      const pdfPageHeight = pdf.internal.pageSize.getHeight(); // 297mm
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      // First page
      pdf.addImage(imgData, "PNG", 0, position, pdfWidth, imgHeight);
      heightLeft -= pdfPageHeight;

      // Loop through remaining content and auto-create pages
      while (heightLeft > 0) {
        position -= pdfPageHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, pdfWidth, imgHeight);
        heightLeft -= pdfPageHeight;
      }

      pdf.save(`Invoice-${targetInvoice?.invoice_number || targetInvoice?.bill_number || "Bill"}.pdf`);
    } catch (err) {
      console.error("PDF generation failed:", err);
      showToast("Failed to generate PDF", "error");
    }
  };

  // ── Submit bill payload ─────────────────────────────────────────────────────
  const handleCreateInvoiceSubmit = async (e) => {
    e.preventDefault();
    setStockError('');

    if (!customerName.trim()) return;

    const stockIssue = validateStock();
    if (stockIssue) {
      setStockError(stockIssue);
      return;
    }

    setSubmitting(true);

    const trimmedSellerGST = sellerGST.trim();
    const trimmedCustomerGST = customerGST.trim();

    const payload = {
      sellerName: user?.name,
      sellerEmail: user?.email,
      sellerGST: trimmedSellerGST,

      customerName: customerName.trim(),
      customerEmail: customerEmail.trim() || 'customer@example.com',
      customerGST: trimmedCustomerGST,
      customerAddress: customerAddress.trim(),

      products: lineItems.map(item => ({
        productName: item.productName,
        quantity: item.quantity,
        weight: item.weight,
        unit: item.unit,
        sellingPrice: Number(item.sellingPrice) || Number(item.price) || 0
      }))
    };

    try {
      const data = await createBill(payload);

      const rawInvoice = data.invoice || data || {};
      const newInvoice = {
        ...rawInvoice,
        items: data.items || rawInvoice.items || [],
        sellerGST: rawInvoice.sellerGST || rawInvoice.seller_gst || trimmedSellerGST,
        seller_gst: rawInvoice.seller_gst || rawInvoice.sellerGST || trimmedSellerGST,
        customerGST: rawInvoice.customerGST || rawInvoice.customer_gst || trimmedCustomerGST,
        customer_gst: rawInvoice.customer_gst || rawInvoice.customerGST || trimmedCustomerGST,
      };

      setSelectedInvoice(newInvoice);
      setIsPreviewOpen(true);

      // Wait for state update & DOM render
      await new Promise(resolve => setTimeout(resolve, 500));

      await handleDownloadPDF(newInvoice);

      setIsPreviewOpen(false);
      showToast("Bill created successfully!");
      setIsDrawerOpen(false);

      await Promise.all([
        fetchBills(),
        fetchProducts()
      ]);

    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || 'Failed to create bill.';
      const lowerMsg = msg.toLowerCase();
      if (
        lowerMsg.includes('stock') ||
        lowerMsg.includes('insufficient') ||
        lowerMsg.includes('out of stock') ||
        lowerMsg.includes('quantity')
      ) {
        setStockError(`⚠️ ${msg}`);
      } else {
        showToast(msg, 'error');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handlePreviewInvoice = (invoice) => {
    setSelectedInvoice(invoice);
    setIsPreviewOpen(true);
  };

  // const fmt = (val) => `₹${parseFloat(val || 0).toFixed(2)}`;
  const fmt = useCallback((val)=>{
   return `₹${parseFloat(val || 0).toFixed(2)}`;
},[]);
  const fmtDate = (dateStr) => {
    if (!dateStr) return '—';
    try {
      return new Date(dateStr).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch { 
      return dateStr; 
    }
  };

  const getBillStatus = (bill) => bill?.status || 'paid';

  return (
    <div className="bills-container">
      {/* Toast */}
      {toast.show && (
        <div className={`bills-toast ${toast.type}`}>
          {toast.type === 'error' ? <AlertTriangle size={16} /> : <CheckCircle size={16} />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <header className="bills-header animate-slide-up">
        <div className="header-info">
          <h1>Bills &amp; Invoices</h1>
          <p>Generate bills, track revenue and manage transactions.</p>
        </div>
        <button className="create-bill-btn" onClick={handleOpenCreateDrawer}>
          <Plus size={18} />
          <span>New Invoice</span>
        </button>
      </header>

      {/* Bills List */}
      <section className="bills-card animate-slide-up delay-1">
        {billsLoading && (
          <div className="bills-loading">
            <Loader2 size={32} className="spin-icon" />
            <p>Loading bills...</p>
          </div>
        )}

        {!billsLoading && billsError && (
          <div className="bills-error">
            <AlertTriangle size={28} />
            <p>{billsError}</p>
            <button className="retry-btn" onClick={fetchBills}>
              <RefreshCw size={14} /> Retry
            </button>
          </div>
        )}

        {!billsLoading && !billsError && (
          <div className="table-responsive">
            <table className="bills-table">
              <thead>
                <tr>
                  <th>Recipient</th>
                  <th>Issued</th>
                  <th>Total Value</th>
                  <th>Status</th>
                  <th className="action-column">Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoices.length > 0 ? invoices.map((inv, idx) => (
                  <tr key={inv.id || idx}>
                    <td>
                      <div className="recipient-meta">
                        <span className="customer-name">{inv.customer_name || inv.customerName || 'N/A'}</span>
                        <span className="customer-email">{inv.customer_email || inv.customerEmail || ''}</span>
                      </div>
                    </td>
                    <td className="date-cell">{fmtDate(inv.created_at || inv.date)}</td>
                    <td className="font-semibold text-primary-color">
                      {fmt(inv.grand_total || inv.total_amount || inv.total)}
                    </td>
                    <td>
                      <span className={`status-badge-table ${getBillStatus(inv).toLowerCase()}`}>
                        {getBillStatus(inv) === 'paid' && <CheckCircle size={12} />}
                        {getBillStatus(inv) === 'pending' && <Clock size={12} />}
                        {getBillStatus(inv) === 'unpaid' && <AlertTriangle size={12} />}
                        <span>{getBillStatus(inv)}</span>
                      </span>
                    </td>
                    <td className="action-column">
                      <div className="invoice-actions">
                        <button
                          className="preview-action"
                          onClick={() => handlePreviewInvoice(inv)}
                          title="Preview Invoice"
                        >
                          <Eye size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="5" className="empty-table-cell">
                      <Receipt size={40} style={{ opacity: 0.3 }} />
                      <p>No bills yet. Create your first invoice!</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Invoice Creator Drawer */}
      {isDrawerOpen && (
        <div className="drawer-overlay" onClick={() => setIsDrawerOpen(false)}>
          <div className="drawer-card animate-slide-in-right" onClick={(e) => e.stopPropagation()}>
            <button className="drawer-close" onClick={() => setIsDrawerOpen(false)}>
              <X size={20} />
            </button>
            <div className="drawer-header">
              <h2>New Invoice Form</h2>
              <p>Fill in customer details and add products</p>
            </div>

            <form onSubmit={handleCreateInvoiceSubmit} className="drawer-form">
              {stockError && (
                <div className="stock-error-banner">
                  <AlertTriangle size={18} />
                  <span>{stockError}</span>
                </div>
              )}

              <div className="form-group">
                <label>Seller GST</label>
                <input
                  value={sellerGST}
                  onChange={(e) => setSellerGST(e.target.value)}
                  placeholder="Seller GST"
                />
              </div>

              <div className="form-group">
                <label>Client Name *</label>
                <div className="input-with-icon">
                  <User size={16} className="field-icon" />
                  <input
                    type="text"
                    placeholder="e.g. Acme Corp"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Client Email</label>
                <input
                  type="email"
                  placeholder="e.g. invoices@acme.com"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                />
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label>Client GST</label>
                  <input
                    type="text"
                    placeholder="GSTIN Number"
                    value={customerGST}
                    onChange={(e) => setCustomerGST(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Client Address</label>
                  <input
                    type="text"
                    placeholder="Billing Address"
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label>Issued Date</label>
                  <input
                    type="date"
                    value={invoiceDate}
                    onChange={(e) => setInvoiceDate(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Due Date</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Line Items */}
              <div className="line-items-section">
                <div className="section-title">
                  <h3>Products</h3>
                  <button
                    type="button"
                    className="add-line-btn"
                    onClick={handleAddLineItem}
                    disabled={availableProducts.length === 0}
                  >
                    <Plus size={14} /> Add Item
                  </button>
                </div>

                {productsLoading ? (
                  <div className="products-loading-inline">
                    <Loader2 size={18} className="spin-icon" /> Loading products...
                  </div>
                ) : availableProducts.length === 0 ? (
                  <div className="no-products-warning">
                    <Package size={16} />
                    <span>
                      No products found. <a href="/products">Add products first.</a>
                    </span>
                  </div>
                ) : (
                  <div className="line-items-scroll-wrapper">
                    <div className="line-items-table">
                      {lineItems.map((item, idx) => {
                        const unitPrice = Number(item.sellingPrice) || Number(item.price) || 0;
                        const total = unitPrice * Number(item.quantity || 0);

                        return (
                          <div className="line-item-row" key={idx}>
                            {item.stock !== undefined && item.stock < item.quantity && (
                              <div className="item-stock-warning">
                                ⚠️ Only {item.stock} in stock
                              </div>
                            )}

                            <div className="line-item-content">
                              {/* 1. Product Select Dropdown */}
                              <div className="col-product">
                                <label className="col-label">Product</label>
                                <select
                                  value={item.productName}
                                  onChange={(e) =>
                                    handleItemChange(idx, "productName", e.target.value)
                                  }
                                >
                                  {availableProducts.map((p) => (
                                    <option key={p.id || p.item_name} value={p.item_name}>
                                      {p.item_name}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              {/* 2. Quantity Input & Stock Info */}
                              <div className="col-qty">
                                <label className="col-label">Qty</label>
                                <input
                                  type="text"
                                  inputMode="numeric"
                                  pattern="[0-9]*"
                                  placeholder="Enter Qty"
                                  value={item.quantity}
                                  onChange={(e) => {
                                    const value = e.target.value.replace(/[^0-9]/g, "");
                                    handleItemChange(idx, "quantity", value);
                                  }}
                                  required
                                />
                                <div className="meta-text">Available: {item.stock}</div>
                              </div>

                              {/* 3. Weight & Unit */}
                              <div className="col-weight">
                                <label className="col-label">Weight &amp; Unit</label>
                                <div className="weight-unit-group" style={{ display: 'flex', gap: '4px' }}>
                                  <input
                                    type="number"
                                    placeholder="Weight"
                                    value={item.weight}
                                    onChange={(e) =>
                                      handleItemChange(idx, "weight", e.target.value)
                                    }
                                  />
              
                                  <input
                                    type="text"
                                    placeholder="Kg / Packet / Bottle / Box"
                                    value={item.unit}
                                    onChange={(e) => handleItemChange(idx, "unit", e.target.value)}
                                  />
                                </div>
                              </div>

                              {/* 4. Selling Price */}
                              <div className="col-price">
                                <label className="col-label">Selling Price</label>
                                <input
                                  type="number"
                                  placeholder="Selling Price"
                                  value={item.sellingPrice}
                                  onChange={(e) =>
                                    handleItemChange(idx, "sellingPrice", e.target.value)
                                  }
                                />
                                <div className="meta-text">GST: {item.gst}%</div>
                              </div>

                              {/* 5. Total Amount */}
                              <div className="col-total">
                                <span className="col-label">Total</span>
                                <strong>₹{total.toFixed(2)}</strong>
                              </div>

                              {/* 6. Remove Item Button */}
                              <div className="col-action">
                                <button
                                  type="button"
                                  className="remove-line-btn"
                                  onClick={() => handleRemoveLineItem(idx)}
                                  disabled={lineItems.length === 1}
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Totals Summary */}
              <div className="breakdown-card">
                <div className="breakdown-row">
                  <span>Subtotal:</span>
                  <span>{fmt(totals.subtotal)}</span>
                </div>
                <div className="breakdown-row">
                  <span>GST:</span>
                  <span>+{fmt(totals.gst)}</span>
                </div>
                <div className="breakdown-row final-total">
                  <span>Grand Total:</span>
                  <span>{fmt(totals.total)}</span>
                </div>
              </div>

              <button
                type="submit"
                className="save-invoice-btn"
                disabled={submitting || availableProducts.length === 0}
              > 
                {submitting ? (
                  <><Loader2 size={16} className="spin-icon" /> Generating Bill...</>
                ) : (
                  <><Save size={16} /><span>Generate Bill</span></>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Invoice Preview Modal */}
      {isPreviewOpen && selectedInvoice && (
        <div className="modal-overlay" onClick={() => setIsPreviewOpen(false)}>
          <div className="receipt-card animate-scale-up" onClick={(e) => e.stopPropagation()}>
            <div className="receipt-actions-top print-hide">
              <button className="print-btn" onClick={handlePrint}>
                <Printer size={16} /> Print Receipt
              </button>
              <button className="print-btn" onClick={() => handleDownloadPDF(selectedInvoice)} style={{ marginLeft: '8px' }}>
                <Download size={16} /> Download PDF
              </button>
              <button className="close-btn" onClick={() => setIsPreviewOpen(false)}>
                <X size={20} />
              </button>
            </div>
            
            <div className="receipt-printable-area" ref={printRef}>
              <div className="receipt-header">
                <div>
                  <h1 className="billing-saas-logo">Billing SaaS</h1>
                  <p className="corporate-sub">Seller Name: {user?.name || 'Business Owner'}</p>
                  <p className="corporate-sub">Seller Email: {user?.email}</p>  
                
                </div>
                <div className="receipt-meta-top">
                  <h2>INVOICE</h2>
                  <p className="corporate-sub text-sm">
                    Customer Name: {selectedInvoice.customer_name || selectedInvoice.customerName} <br/>
                    Customer Email: {selectedInvoice.customer_email || selectedInvoice.customerEmail} <br />
                    Customer GST: {selectedInvoice.customer_gst || selectedInvoice.customerGST || "N/A"}
                  </p>
                </div>
              </div>

              <hr className="receipt-divider" />

              <div className="receipt-addresses-grid">
                <div>
                  <h4>Issued By:</h4>
                  <p className="firm-bold">{user?.name || 'Business'}</p>
                  <p className="sub-addr">{user?.email || ''}</p>
                </div>
                <div>
                  <h4>Bill To:</h4>
                  <p className="firm-bold">{selectedInvoice.customer_name || selectedInvoice.customerName || 'N/A'}</p>
                  <p className="sub-addr">{selectedInvoice.customer_email || selectedInvoice.customerEmail || ''}</p>
                </div>
              </div>

              <div className="receipt-dates-grid">
                <div>
                  <span>Date Issued:</span>{' '}
                  <strong>{fmtDate(selectedInvoice.created_at || selectedInvoice.date)}</strong>
                </div>
                <div>
                  <span>Status:</span>{' '}
                  <strong className={`invoice-status-flag ${getBillStatus(selectedInvoice).toLowerCase()}`}>
                    {getBillStatus(selectedInvoice)}
                  </strong>
                </div>
              </div>

              {/* Items table */}
              {(selectedInvoice.items || selectedInvoice.bill_items || selectedInvoice.products) && (
                <div className="table-scroll-wrapper">
                  <table className="receipt-items-table">
                    <thead>
                      <tr>
                        <th>Item</th>
                        <th>Weight</th>
                        <th>Unit</th>
                        <th className="text-right">Price</th>
                        <th className="text-center">Qty</th>
                        <th className="text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(selectedInvoice.items || selectedInvoice.bill_items || selectedInvoice.products || []).map((item, idx) => {
                        const unitPrice = item.selling_price || item.sellingPrice || item.price || 0;
                        const qty = item.quantity || 1;
                        const itemTotal = item.total || (unitPrice * qty);

                        return (
                          <tr key={idx}>
                            <td>
                              {item.name || item.product_name || item.productName || 'Item'}
                            </td>
                            <td>{item.weight || '—'}</td>
                            <td>{item.unit || '—'}</td>
                            <td className="text-right">{fmt(unitPrice)}</td>
                            <td className="text-center">{qty}</td>
                            <td className="text-right">{fmt(itemTotal)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="receipt-totals-wrap">
                <div className="totals-row">
                  <span>Subtotal:</span>
                  <span>{fmt(selectedInvoice.subtotal || selectedInvoice.sub_total || totals.subtotal)}</span>
                </div>
                <div className="totals-row">
                  <span>GST:</span>
                  <span>+{fmt(selectedInvoice.gst || selectedInvoice.gst_amount)}</span>
                </div>
                <div className="totals-row grand-total">
                  <span>Grand Total:</span>
                  <span>{fmt(selectedInvoice.grand_total || selectedInvoice.total_amount || selectedInvoice.total || totals.total)}</span>
                </div>
                <div className="receipt-footer">
                  <p>Thank you for your business!</p>
                  <p className="foot-note-small">Powered by Billing SaaS. All rights reserved.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Bill;