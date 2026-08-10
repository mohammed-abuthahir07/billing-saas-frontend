import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
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

  // Available products (from API) for the bill drawer — loaded on demand
  const [availableProducts, setAvailableProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);

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
      return list;
    } catch (err) {
      console.error('Failed to load products', err);
      return [];
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
    fetchBills();
  }, [fetchBills]);

  // ── Running totals calculation ─────────────────────────────────────
  const totals = useMemo(() => {
    const subtotal = lineItems.reduce((sum, item) => {
      const unitPrice = Number(item.sellingPrice) || Number(item.price) || 0;
      return sum + unitPrice * (Number(item.quantity) || 0);
    }, 0);

    const gst = lineItems.reduce((sum, item) => {
      const unitPrice = Number(item.sellingPrice) || Number(item.price) || 0;
      return sum + (unitPrice * (Number(item.quantity) || 0) * (Number(item.gst) || 0)) / 100;
    }, 0);

    return { subtotal, gst, total: subtotal + gst };
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
  const handleOpenCreateDrawer = async () => {
    setCustomerName('');
    setCustomerEmail('');
    setCustomerGST('');
    setCustomerAddress('');
    setStockError('');
    setIsDrawerOpen(true);

    let products = availableProducts;
    if (products.length === 0) {
      products = (await fetchProducts()) || [];
    }

    if (products.length > 0) {
      const first = products[0];
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

  let pdfContainer = null;

  try {
    // Load heavy PDF libs only when the user downloads
    const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
      import("jspdf"),
      import("html2canvas"),
    ]);

    /*
     * A4 at 96 DPI ≈ 794 x 1123 px
     *
     * We create a separate fixed-width PDF rendering area.
     * This prevents the mobile responsive layout from affecting
     * the generated PDF.
     */
    pdfContainer = document.createElement("div");

    pdfContainer.style.position = "absolute";
    pdfContainer.style.left = "-10000px";
    pdfContainer.style.top = "0";
    pdfContainer.style.width = "794px";
    pdfContainer.style.minWidth = "794px";
    pdfContainer.style.maxWidth = "794px";
    pdfContainer.style.background = "#ffffff";
    pdfContainer.style.padding = "0";
    pdfContainer.style.margin = "0";
    pdfContainer.style.overflow = "visible";
    pdfContainer.style.boxSizing = "border-box";

    // Clone invoice
    const clonedInvoice = printRef.current.cloneNode(true);

    // Remove anything that should not appear in PDF
    clonedInvoice
      .querySelectorAll(".print-hide")
      .forEach((el) => el.remove());

    /*
     * Force invoice itself to A4 width.
     */
    clonedInvoice.style.width = "794px";
    clonedInvoice.style.minWidth = "794px";
    clonedInvoice.style.maxWidth = "794px";
    clonedInvoice.style.margin = "0";
    clonedInvoice.style.padding = "40px";
    clonedInvoice.style.boxSizing = "border-box";
    clonedInvoice.style.background = "#ffffff";
    clonedInvoice.style.transform = "none";

    pdfContainer.appendChild(clonedInvoice);
    document.body.appendChild(pdfContainer);

    // Allow layout to settle without a long artificial delay
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));

    const canvas = await html2canvas(clonedInvoice, {
      scale: 1.5,
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#ffffff",
      windowWidth: 1200,
      windowHeight: 1600,
      logging: false
    });

    const imgData = canvas.toDataURL("image/jpeg", 0.92);

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
      compress: true
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    /*
     * PDF margins
     */
    const margin = 8;

    const pdfWidth = pageWidth - margin * 2;

    const imgHeight =
      (canvas.height * pdfWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = margin;

    /*
     * First page
     */
    pdf.addImage(
      imgData,
      "JPEG",
      margin,
      position,
      pdfWidth,
      imgHeight,
      undefined,
      "FAST"
    );

    heightLeft -= pageHeight - margin * 2;

    /*
     * Additional pages
     */
    while (heightLeft > 0) {
      position -= pageHeight - margin * 2;

      pdf.addPage();

      pdf.addImage(
        imgData,
        "JPEG",
        margin,
        position,
        pdfWidth,
        imgHeight,
        undefined,
        "FAST"
      );

      heightLeft -= pageHeight - margin * 2;
    }

    pdf.save(
      `Invoice-${
        targetInvoice?.invoice_number ||
        targetInvoice?.bill_number ||
        "Bill"
      }.pdf`
    );

  } catch (err) {
    console.error("PDF generation failed:", err);
    showToast("Failed to generate PDF", "error");

  } finally {
    /*
     * Always remove the temporary PDF container.
     */
    if (pdfContainer && document.body.contains(pdfContainer)) {
      document.body.removeChild(pdfContainer);
    }
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

      // Wait for preview DOM to paint before PDF capture
      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));

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
                {invoices.length > 0 ? invoices.map((inv, idx) => {
                  const status = getBillStatus(inv);
                  const statusKey = String(status).toLowerCase();
                  return (
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
                      <span className={`status-badge-table ${statusKey}`}>
                        {statusKey === 'paid' && <CheckCircle size={12} />}
                        {statusKey === 'pending' && <Clock size={12} />}
                        {statusKey === 'unpaid' && <AlertTriangle size={12} />}
                        <span>{status}</span>
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
                  );
                }) : (
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

      {/* Invoice Creator Drawer — portaled to body so layout transforms don't clip it */}
      {isDrawerOpen && createPortal(
        <div className="drawer-overlay" onClick={() => setIsDrawerOpen(false)}>
          <div className="drawer-card" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-topbar">
              <div className="drawer-header">
                <h2>New Invoice</h2>
                <p>Add client details and line items to generate a bill.</p>
              </div>
              <button className="drawer-close" onClick={() => setIsDrawerOpen(false)} type="button" aria-label="Close">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateInvoiceSubmit} className="drawer-form">
              <div className="drawer-form-scroll">
                {stockError && (
                  <div className="stock-error-banner">
                    <AlertTriangle size={18} />
                    <span>{stockError}</span>
                  </div>
                )}

                <section className="drawer-section">
                  <h3 className="drawer-section-title">Seller &amp; Client</h3>

                  <div className="form-group">
                    <label htmlFor="seller-gst">Seller GST</label>
                    <input
                      id="seller-gst"
                      value={sellerGST}
                      onChange={(e) => setSellerGST(e.target.value)}
                      placeholder="e.g. 22AAAAA0000A1Z5"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="client-name">Client Name <span className="req">*</span></label>
                    <div className="input-with-icon">
                      <User size={16} className="field-icon" />
                      <input
                        id="client-name"
                        type="text"
                        placeholder="e.g. Acme Corp"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="client-email">Client Email</label>
                    <input
                      id="client-email"
                      type="email"
                      placeholder="e.g. invoices@acme.com"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                    />
                  </div>

                  <div className="form-grid">
                    <div className="form-group">
                      <label htmlFor="client-gst">Client GST</label>
                      <input
                        id="client-gst"
                        type="text"
                        placeholder="GSTIN Number"
                        value={customerGST}
                        onChange={(e) => setCustomerGST(e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="client-address">Client Address</label>
                      <input
                        id="client-address"
                        type="text"
                        placeholder="Billing address"
                        value={customerAddress}
                        onChange={(e) => setCustomerAddress(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="form-grid">
                    <div className="form-group">
                      <label htmlFor="issued-date">Issued Date</label>
                      <input
                        id="issued-date"
                        type="date"
                        value={invoiceDate}
                        onChange={(e) => setInvoiceDate(e.target.value)}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="due-date">Due Date</label>
                      <input
                        id="due-date"
                        type="date"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </section>

                <section className="drawer-section line-items-section">
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
                                  Only {item.stock} in stock
                                </div>
                              )}

                              <div className="line-item-content">
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

                                <div className="col-qty">
                                  <label className="col-label">Qty</label>
                                  <input
                                    type="text"
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    placeholder="Qty"
                                    value={item.quantity}
                                    onChange={(e) => {
                                      const value = e.target.value.replace(/[^0-9]/g, "");
                                      handleItemChange(idx, "quantity", value);
                                    }}
                                    required
                                  />
                                  <div className="meta-text">Avail: {item.stock}</div>
                                </div>

                                <div className="col-weight">
                                  <label className="col-label">Weight / Unit</label>
                                  <div className="weight-unit-group">
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
                                      placeholder="Kg / Box"
                                      value={item.unit}
                                      onChange={(e) => handleItemChange(idx, "unit", e.target.value)}
                                    />
                                  </div>
                                </div>

                                <div className="col-price">
                                  <label className="col-label">Price</label>
                                  <input
                                    type="number"
                                    placeholder="Price"
                                    value={item.sellingPrice}
                                    onChange={(e) =>
                                      handleItemChange(idx, "sellingPrice", e.target.value)
                                    }
                                  />
                                  <div className="meta-text">GST: {item.gst}%</div>
                                </div>

                                <div className="col-total">
                                  <span className="col-label">Total</span>
                                  <strong>₹{total.toFixed(2)}</strong>
                                </div>

                                <div className="col-action">
                                  <button
                                    type="button"
                                    className="remove-line-btn"
                                    onClick={() => handleRemoveLineItem(idx)}
                                    disabled={lineItems.length === 1}
                                    aria-label="Remove item"
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
                </section>
              </div>

              <div className="drawer-footer">
                <div className="breakdown-card">
                  <div className="breakdown-row">
                    <span>Subtotal</span>
                    <span>{fmt(totals.subtotal)}</span>
                  </div>
                  <div className="breakdown-row">
                    <span>GST</span>
                    <span>+{fmt(totals.gst)}</span>
                  </div>
                  <div className="breakdown-row final-total">
                    <span>Grand Total</span>
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
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Invoice Preview Modal */}
      {isPreviewOpen && selectedInvoice && createPortal(
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
        </div>,
        document.body
      )}
    </div>
  );
};

export default Bill;