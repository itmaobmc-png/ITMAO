import React, { useState } from 'react';
import {
  Search,
  Plus,
  Boxes,
  AlertTriangle,
  Edit,
  Trash2,
  ArrowDownToLine,
  Barcode,
  Layers,
  Sparkles,
  X,
  Check,
  Printer
} from 'lucide-react';
import { INITIAL_CATEGORIES } from '../data/initialData';
import { formatUSD, formatKHR, usdToRiel } from '../utils/helpers';

export default function Products({
  products,
  setProducts,
  settings,
  lang,
  onRecordStockMovement,
  restockItemTarget,
  setRestockItemTarget,
  isAddModalOpen,
  setIsAddModalOpen
}) {
  const isKh = lang === 'km';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [stockStatusFilter, setStockStatusFilter] = useState('all'); // all, low, out, instock

  // Edit Modal State
  const [editingProduct, setEditingProduct] = useState(null);

  // Barcode Modal State
  const [barcodeProduct, setBarcodeProduct] = useState(null);

  // Restock Input State
  const [restockQty, setRestockQty] = useState(10);
  const [restockCost, setRestockCost] = useState('');
  const [restockSupplier, setRestockSupplier] = useState('');
  const [restockNote, setRestockNote] = useState('');

  // New Product Form State
  const [newProduct, setNewProduct] = useState({
    nameKh: '',
    nameEn: '',
    category: 'beverages',
    barcode: '',
    costPrice: '',
    sellingPrice: '',
    stockQty: 10,
    minStock: 5,
    unit: 'កំប៉ុង',
    supplier: '',
    emoji: '📦',
    image: ''
  });

  // Filter products
  const filteredProducts = products.filter((p) => {
    const matchesCat = selectedCategory === 'all' || p.category === selectedCategory;

    let matchesStatus = true;
    if (stockStatusFilter === 'low') matchesStatus = p.stockQty > 0 && p.stockQty <= p.minStock;
    else if (stockStatusFilter === 'out') matchesStatus = p.stockQty <= 0;
    else if (stockStatusFilter === 'instock') matchesStatus = p.stockQty > p.minStock;

    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      p.nameKh?.toLowerCase().includes(query) ||
      p.nameEn?.toLowerCase().includes(query) ||
      p.barcode?.toLowerCase().includes(query) ||
      p.supplier?.toLowerCase().includes(query) ||
      p.id?.toLowerCase().includes(query);

    return matchesCat && matchesStatus && matchesSearch;
  });

  // Delete product
  const handleDeleteProduct = (id) => {
    const target = products.find((p) => p.id === id);
    const name = isKh ? target?.nameKh : target?.nameEn;
    if (window.confirm(isKh ? `តើអ្នកប្រាកដជាចង់លុបទំនិញ "${name}" នេះចេញពីប្រព័ន្ធមែនទេ?` : `Are you sure you want to delete "${name}"?`)) {
      setProducts((prev) => prev.filter((p) => p.id !== id));
    }
  };

  // Add Product Submit
  const handleCreateProduct = (e) => {
    e.preventDefault();
    if (!newProduct.nameKh && !newProduct.nameEn) {
      alert(isKh ? 'សូមបញ្ចូលឈ្មោះទំនិញ!' : 'Please enter product name!');
      return;
    }

    const cost = parseFloat(newProduct.costPrice) || 0;
    const sell = parseFloat(newProduct.sellingPrice) || 0;
    const qty = parseInt(newProduct.stockQty, 10) || 0;

    const created = {
      id: `PRD-${Date.now().toString().slice(-5)}`,
      barcode: newProduct.barcode || `${Math.floor(100000000000 + Math.random() * 900000000000)}`,
      nameKh: newProduct.nameKh || newProduct.nameEn,
      nameEn: newProduct.nameEn || newProduct.nameKh,
      category: newProduct.category,
      costPrice: cost,
      sellingPrice: sell,
      stockQty: qty,
      minStock: parseInt(newProduct.minStock, 10) || 5,
      unit: newProduct.unit || 'កញ្ចប់',
      supplier: newProduct.supplier || 'ទូទៅ',
      emoji: newProduct.emoji || '📦',
      image: newProduct.image || '',
      updatedAt: new Date().toISOString()
    };

    setProducts((prev) => [created, ...prev]);

    // Record stock movement if qty > 0
    if (qty > 0) {
      onRecordStockMovement({
        id: `MOV-${Date.now().toString().slice(-6)}`,
        date: new Date().toISOString(),
        productId: created.id,
        productName: isKh ? created.nameKh : created.nameEn,
        type: 'INITIAL_STOCK',
        quantity: qty,
        costPrice: cost,
        supplier: created.supplier,
        notes: isKh ? 'បញ្ចូលស្តុកដំបូង' : 'Initial stock'
      });
    }

    setIsAddModalOpen(false);
    setNewProduct({
      nameKh: '',
      nameEn: '',
      category: 'beverages',
      barcode: '',
      costPrice: '',
      sellingPrice: '',
      stockQty: 10,
      minStock: 5,
      unit: 'កំប៉ុង',
      supplier: '',
      emoji: '📦',
      image: ''
    });
  };

  // Edit Product Submit
  const handleUpdateProduct = (e) => {
    e.preventDefault();
    setProducts((prev) =>
      prev.map((p) => (p.id === editingProduct.id ? { ...editingProduct, updatedAt: new Date().toISOString() } : p))
    );
    setEditingProduct(null);
  };

  // Restock Submit
  const handleExecuteRestock = (e) => {
    e.preventDefault();
    if (!restockItemTarget) return;

    const addQty = parseInt(restockQty, 10) || 0;
    if (addQty <= 0) {
      alert(isKh ? 'សូមបញ្ចូលចំនួននាំចូលធំជាង 0' : 'Quantity must be greater than 0');
      return;
    }

    const unitCost = restockCost !== '' ? parseFloat(restockCost) : restockItemTarget.costPrice;

    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === restockItemTarget.id) {
          return {
            ...p,
            stockQty: p.stockQty + addQty,
            costPrice: unitCost,
            supplier: restockSupplier || p.supplier,
            updatedAt: new Date().toISOString()
          };
        }
        return p;
      })
    );

    // Record Movement
    onRecordStockMovement({
      id: `MOV-${Date.now().toString().slice(-6)}`,
      date: new Date().toISOString(),
      productId: restockItemTarget.id,
      productName: isKh ? restockItemTarget.nameKh : restockItemTarget.nameEn,
      type: 'RESTOCK_IN',
      quantity: addQty,
      costPrice: unitCost,
      supplier: restockSupplier || restockItemTarget.supplier,
      notes: restockNote || (isKh ? 'នាំចូលស្តុកបន្ថែម' : 'Restock shipment')
    });

    setRestockItemTarget(null);
    setRestockQty(10);
    setRestockCost('');
    setRestockSupplier('');
    setRestockNote('');
  };

  // Inventory Totals
  const totalCostValue = products.reduce((sum, p) => sum + p.costPrice * p.stockQty, 0);
  const totalRetailValue = products.reduce((sum, p) => sum + p.sellingPrice * p.stockQty, 0);
  const totalUnits = products.reduce((sum, p) => sum + p.stockQty, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Banner Stats */}
      <div
        className="card"
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          background: 'var(--bg-card)'
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px' }}>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              {isKh ? 'មុខទំនិញសរុប' : 'Total Items'}
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>{products.length}</div>
          </div>
          <div style={{ borderLeft: '1px solid var(--border-subtle)', paddingLeft: '20px' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              {isKh ? 'បរិមាណស្តុកសរុប' : 'Total Stock Units'}
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>{totalUnits.toLocaleString()}</div>
          </div>
          <div style={{ borderLeft: '1px solid var(--border-subtle)', paddingLeft: '20px' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              {isKh ? 'ទុនស្តុកសរុប (Cost Asset)' : 'Total Cost Asset'}
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary)' }}>
              {formatUSD(totalCostValue)}
            </div>
          </div>
          <div style={{ borderLeft: '1px solid var(--border-subtle)', paddingLeft: '20px' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              {isKh ? 'តម្លៃលក់សរុប (Retail Value)' : 'Total Retail Value'}
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--success)' }}>
              {formatUSD(totalRetailValue)}
            </div>
          </div>
        </div>

        <button className="btn btn-primary btn-lg" onClick={() => setIsAddModalOpen(true)}>
          <Plus size={18} />
          <span>{isKh ? 'បន្ថែមទំនិញថ្មី' : 'Add New Product'}</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="card" style={{ padding: '16px 20px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Search Box */}
          <div className="search-box">
            <Search className="search-icon" size={18} />
            <input
              type="text"
              className="input-field"
              placeholder={isKh ? 'ស្វែងរកតាមឈ្មោះ, Barcode, អ្នកផ្គត់ផ្គង់...' : 'Search product, barcode, supplier...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Status filters */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              className={`category-pill ${stockStatusFilter === 'all' ? 'active' : ''}`}
              onClick={() => setStockStatusFilter('all')}
            >
              {isKh ? 'ទាំងអស់' : 'All'} ({products.length})
            </button>
            <button
              className={`category-pill ${stockStatusFilter === 'low' ? 'active' : ''}`}
              onClick={() => setStockStatusFilter('low')}
            >
              ⚠️ {isKh ? 'ជិតអស់ស្តុក' : 'Low Stock'} (
              {products.filter((p) => p.stockQty > 0 && p.stockQty <= p.minStock).length})
            </button>
            <button
              className={`category-pill ${stockStatusFilter === 'out' ? 'active' : ''}`}
              onClick={() => setStockStatusFilter('out')}
            >
              🛑 {isKh ? 'អស់ពីស្តុក' : 'Out of Stock'} (
              {products.filter((p) => p.stockQty <= 0).length})
            </button>
          </div>
        </div>

        {/* Categories Bar */}
        <div className="pos-category-pills" style={{ marginTop: '14px', marginBottom: 0 }}>
          {INITIAL_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              className={`category-pill ${selectedCategory === cat.id ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat.id)}
            >
              {isKh ? cat.nameKh : cat.nameEn}
            </button>
          ))}
        </div>
      </div>

      {/* Products Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>{isKh ? 'ទំនិញ' : 'Product'}</th>
                <th>{isKh ? 'បាកូដ / SKU' : 'Barcode / SKU'}</th>
                <th>{isKh ? 'ប្រភេទ' : 'Category'}</th>
                <th>{isKh ? 'ថ្លៃដើម' : 'Cost Price'}</th>
                <th>{isKh ? 'តម្លៃលក់' : 'Sell Price'}</th>
                <th>{isKh ? 'ចំណេញ / ឯកតា' : 'Margin / Profit'}</th>
                <th>{isKh ? 'ចំនួនក្នុងស្តុក' : 'Stock Qty'}</th>
                <th>{isKh ? 'អ្នកផ្គត់ផ្គង់' : 'Supplier'}</th>
                <th style={{ textAlign: 'right' }}>{isKh ? 'សកម្មភាព' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                    🔍 {isKh ? 'រកមិនឃើញទំនិញដែលត្រូវនឹងការស្វែងរកទេ!' : 'No matching products found!'}
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const isZero = p.stockQty <= 0;
                  const isLow = p.stockQty > 0 && p.stockQty <= p.minStock;
                  const profit = p.sellingPrice - p.costPrice;
                  const profitPercent = p.costPrice > 0 ? ((profit / p.costPrice) * 100).toFixed(0) : 100;

                  return (
                    <tr key={p.id}>
                      {/* Product Name & Icon */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div
                            style={{
                              width: '42px',
                              height: '42px',
                              borderRadius: 'var(--radius-sm)',
                              overflow: 'hidden',
                              background: 'var(--bg-card-subtle)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '1.4rem',
                              flexShrink: 0
                            }}
                          >
                            {p.image ? (
                              <img
                                src={p.image}
                                alt={p.nameEn}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              />
                            ) : (
                              <span>{p.emoji || '📦'}</span>
                            )}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: '0.88rem' }}>{p.nameKh}</div>
                            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{p.nameEn}</div>
                          </div>
                        </div>
                      </td>

                      {/* Barcode */}
                      <td>
                        <div
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontFamily: 'monospace',
                            fontSize: '0.8rem',
                            background: 'var(--bg-card-subtle)',
                            padding: '2px 6px',
                            borderRadius: '4px'
                          }}
                        >
                          <Barcode size={14} style={{ color: 'var(--text-muted)' }} />
                          <span>{p.barcode || p.id}</span>
                        </div>
                      </td>

                      {/* Category */}
                      <td>
                        <span className="badge-tag" style={{ background: 'var(--bg-card-subtle)', border: '1px solid var(--border-subtle)' }}>
                          {p.category}
                        </span>
                      </td>

                      {/* Cost */}
                      <td style={{ fontWeight: 600 }}>{formatUSD(p.costPrice)}</td>

                      {/* Sell */}
                      <td style={{ fontWeight: 800, color: 'var(--primary)' }}>
                        {formatUSD(p.sellingPrice)}
                        <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                          {formatKHR(usdToRiel(p.sellingPrice, settings.exchangeRate))}
                        </span>
                      </td>

                      {/* Profit */}
                      <td>
                        <span style={{ fontWeight: 700, color: 'var(--success)', fontSize: '0.85rem' }}>
                          +{formatUSD(profit)}
                        </span>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>
                          ({profitPercent}%)
                        </span>
                      </td>

                      {/* Stock Qty */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span
                            className={`badge-tag ${isZero ? 'danger' : isLow ? 'warning' : 'success'}`}
                            style={{ fontWeight: 800 }}
                          >
                            {p.stockQty} {p.unit}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                          {isKh ? `កម្រិតរោទិ៍:` : `Min:`} {p.minStock} {p.unit}
                        </div>
                      </td>

                      {/* Supplier */}
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                        {p.supplier || '-'}
                      </td>

                      {/* Actions */}
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '6px' }}>
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => {
                              setRestockItemTarget(p);
                              setRestockCost(p.costPrice);
                              setRestockSupplier(p.supplier);
                            }}
                            title={isKh ? 'នាំចូលស្តុកបន្ថែម' : 'Restock item'}
                          >
                            <ArrowDownToLine size={14} />
                            <span>{isKh ? 'នាំចូល' : 'Restock'}</span>
                          </button>

                          <button
                            className="control-btn"
                            style={{ padding: '6px 8px' }}
                            onClick={() => setBarcodeProduct(p)}
                            title={isKh ? 'មើល/បោះពុម្ពបាកូដ' : 'Barcode label'}
                          >
                            <Barcode size={15} />
                          </button>

                          <button
                            className="control-btn"
                            style={{ padding: '6px 8px' }}
                            onClick={() => setEditingProduct({ ...p })}
                            title={isKh ? 'កែសម្រួល' : 'Edit'}
                          >
                            <Edit size={15} />
                          </button>

                          <button
                            className="control-btn"
                            style={{ padding: '6px 8px', color: 'var(--danger)' }}
                            onClick={() => handleDeleteProduct(p.id)}
                            title={isKh ? 'លុប' : 'Delete'}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Add New Product */}
      {isAddModalOpen && (
        <div className="modal-overlay" onClick={() => setIsAddModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <form onSubmit={handleCreateProduct}>
              <div className="modal-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Plus size={20} style={{ color: 'var(--primary)' }} />
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>
                    {isKh ? 'បន្ថែមទំនិញថ្មីចូលស្តុក' : 'Add New Product to Inventory'}
                  </h3>
                </div>
                <button
                  type="button"
                  className="control-btn"
                  style={{ padding: '6px' }}
                  onClick={() => setIsAddModalOpen(false)}
                >
                  <X size={18} />
                </button>
              </div>

              <div className="modal-body">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="input-group">
                    <label className="input-label">{isKh ? 'ឈ្មោះទំនិញ (ភាសាខ្មែរ)*' : 'Product Name (Khmer)*'}</label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="ឧ. ទឹកក្រូច កូកា កូឡា"
                      value={newProduct.nameKh}
                      onChange={(e) => setNewProduct({ ...newProduct, nameKh: e.target.value })}
                      required
                    />
                  </div>

                  <div className="input-group">
                    <label className="input-label">{isKh ? 'ឈ្មោះទំនិញ (English)' : 'Product Name (English)'}</label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="e.g. Coca Cola Can 330ml"
                      value={newProduct.nameEn}
                      onChange={(e) => setNewProduct({ ...newProduct, nameEn: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="input-group">
                    <label className="input-label">{isKh ? 'ប្រភេទមុខទំនិញ' : 'Category'}</label>
                    <select
                      className="input-field"
                      value={newProduct.category}
                      onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                    >
                      {INITIAL_CATEGORIES.filter((c) => c.id !== 'all').map((c) => (
                        <option key={c.id} value={c.id}>
                          {isKh ? c.nameKh : c.nameEn}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="input-group">
                    <label className="input-label">{isKh ? 'លេខបាកូដ (Barcode)' : 'Barcode / SKU'}</label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="88501234..."
                      value={newProduct.barcode}
                      onChange={(e) => setNewProduct({ ...newProduct, barcode: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="input-group">
                    <label className="input-label">{isKh ? 'ថ្លៃដើមទុន ($)' : 'Cost Price ($)'}</label>
                    <input
                      type="number"
                      step="0.01"
                      className="input-field"
                      placeholder="0.50"
                      value={newProduct.costPrice}
                      onChange={(e) => setNewProduct({ ...newProduct, costPrice: e.target.value })}
                      required
                    />
                  </div>

                  <div className="input-group">
                    <label className="input-label">{isKh ? 'តម្លៃលក់ចេញ ($)*' : 'Selling Price ($)*'}</label>
                    <input
                      type="number"
                      step="0.01"
                      className="input-field"
                      placeholder="0.75"
                      value={newProduct.sellingPrice}
                      onChange={(e) => setNewProduct({ ...newProduct, sellingPrice: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                  <div className="input-group">
                    <label className="input-label">{isKh ? 'បរិមាណស្តុកដំបូង' : 'Initial Stock'}</label>
                    <input
                      type="number"
                      className="input-field"
                      value={newProduct.stockQty}
                      onChange={(e) => setNewProduct({ ...newProduct, stockQty: e.target.value })}
                    />
                  </div>

                  <div className="input-group">
                    <label className="input-label">{isKh ? 'រោទិ៍ជិតអស់ (Min)' : 'Min Alert'}</label>
                    <input
                      type="number"
                      className="input-field"
                      value={newProduct.minStock}
                      onChange={(e) => setNewProduct({ ...newProduct, minStock: e.target.value })}
                    />
                  </div>

                  <div className="input-group">
                    <label className="input-label">{isKh ? 'ឯកតា (Unit)' : 'Unit'}</label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="កំប៉ុង, ដប, កញ្ចប់..."
                      value={newProduct.unit}
                      onChange={(e) => setNewProduct({ ...newProduct, unit: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="input-group">
                    <label className="input-label">{isKh ? 'អ្នកផ្គត់ផ្គង់ (Supplier)' : 'Supplier'}</label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="ឧ. ដេប៉ូ ភ្នំពេញ"
                      value={newProduct.supplier}
                      onChange={(e) => setNewProduct({ ...newProduct, supplier: e.target.value })}
                    />
                  </div>

                  <div className="input-group">
                    <label className="input-label">{isKh ? 'រូបភាពតំណាង (Image URL / Emoji)' : 'Image URL or Emoji'}</label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="https://... ឬ 🥤"
                      value={newProduct.image || newProduct.emoji}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val.startsWith('http')) setNewProduct({ ...newProduct, image: val });
                        else setNewProduct({ ...newProduct, emoji: val });
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsAddModalOpen(false)}>
                  {isKh ? 'បោះបង់' : 'Cancel'}
                </button>
                <button type="submit" className="btn btn-primary">
                  <Check size={18} />
                  <span>{isKh ? 'រក្សាទុកទំនិញ' : 'Save Product'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Product */}
      {editingProduct && (
        <div className="modal-overlay" onClick={() => setEditingProduct(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <form onSubmit={handleUpdateProduct}>
              <div className="modal-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Edit size={20} style={{ color: 'var(--primary)' }} />
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>
                    {isKh ? 'កែសម្រួលព័ត៌មានទំនិញ' : 'Edit Product'}
                  </h3>
                </div>
                <button
                  type="button"
                  className="control-btn"
                  style={{ padding: '6px' }}
                  onClick={() => setEditingProduct(null)}
                >
                  <X size={18} />
                </button>
              </div>

              <div className="modal-body">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="input-group">
                    <label className="input-label">{isKh ? 'ឈ្មោះ (ខ្មែរ)' : 'Name (Khmer)'}</label>
                    <input
                      type="text"
                      className="input-field"
                      value={editingProduct.nameKh}
                      onChange={(e) => setEditingProduct({ ...editingProduct, nameKh: e.target.value })}
                      required
                    />
                  </div>
                  <div className="input-group">
                    <label className="input-label">{isKh ? 'ឈ្មោះ (English)' : 'Name (English)'}</label>
                    <input
                      type="text"
                      className="input-field"
                      value={editingProduct.nameEn}
                      onChange={(e) => setEditingProduct({ ...editingProduct, nameEn: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="input-group">
                    <label className="input-label">{isKh ? 'ថ្លៃដើម ($)' : 'Cost Price ($)'}</label>
                    <input
                      type="number"
                      step="0.01"
                      className="input-field"
                      value={editingProduct.costPrice}
                      onChange={(e) => setEditingProduct({ ...editingProduct, costPrice: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="input-group">
                    <label className="input-label">{isKh ? 'តម្លៃលក់ ($)' : 'Selling Price ($)'}</label>
                    <input
                      type="number"
                      step="0.01"
                      className="input-field"
                      value={editingProduct.sellingPrice}
                      onChange={(e) => setEditingProduct({ ...editingProduct, sellingPrice: parseFloat(e.target.value) || 0 })}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                  <div className="input-group">
                    <label className="input-label">{isKh ? 'ស្តុកបច្ចុប្បន្ន' : 'Stock Qty'}</label>
                    <input
                      type="number"
                      className="input-field"
                      value={editingProduct.stockQty}
                      onChange={(e) => setEditingProduct({ ...editingProduct, stockQty: parseInt(e.target.value, 10) || 0 })}
                    />
                  </div>
                  <div className="input-group">
                    <label className="input-label">{isKh ? 'រោទិ៍ជិតអស់' : 'Min Alert'}</label>
                    <input
                      type="number"
                      className="input-field"
                      value={editingProduct.minStock}
                      onChange={(e) => setEditingProduct({ ...editingProduct, minStock: parseInt(e.target.value, 10) || 0 })}
                    />
                  </div>
                  <div className="input-group">
                    <label className="input-label">{isKh ? 'ឯកតា' : 'Unit'}</label>
                    <input
                      type="text"
                      className="input-field"
                      value={editingProduct.unit}
                      onChange={(e) => setEditingProduct({ ...editingProduct, unit: e.target.value })}
                    />
                  </div>
                </div>

                <div className="input-group">
                  <label className="input-label">{isKh ? 'អ្នកផ្គត់ផ្គង់' : 'Supplier'}</label>
                  <input
                    type="text"
                    className="input-field"
                    value={editingProduct.supplier || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, supplier: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setEditingProduct(null)}>
                  {isKh ? 'បោះបង់' : 'Cancel'}
                </button>
                <button type="submit" className="btn btn-primary">
                  <Check size={18} />
                  <span>{isKh ? 'ធ្វើបច្ចុប្បន្នភាព' : 'Update Product'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Restock (នាំចូលស្តុក) */}
      {restockItemTarget && (
        <div className="modal-overlay" onClick={() => setRestockItemTarget(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <form onSubmit={handleExecuteRestock}>
              <div className="modal-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ArrowDownToLine size={20} style={{ color: 'var(--primary)' }} />
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>
                    {isKh ? 'នាំចូលស្តុកបន្ថែម (Stock In)' : 'Restock Product'}
                  </h3>
                </div>
                <button
                  type="button"
                  className="control-btn"
                  style={{ padding: '6px' }}
                  onClick={() => setRestockItemTarget(null)}
                >
                  <X size={18} />
                </button>
              </div>

              <div className="modal-body">
                {/* Product Summary */}
                <div
                  style={{
                    padding: '12px 16px',
                    background: 'var(--bg-card-subtle)',
                    borderRadius: 'var(--radius-md)',
                    marginBottom: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 800 }}>
                      {isKh ? restockItemTarget.nameKh : restockItemTarget.nameEn}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      SKU: {restockItemTarget.barcode || restockItemTarget.id}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{isKh ? 'ស្តុកបច្ចុប្បន្ន' : 'Current Stock'}</div>
                    <span className="badge-tag primary" style={{ fontWeight: 800 }}>
                      {restockItemTarget.stockQty} {restockItemTarget.unit}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="input-group">
                    <label className="input-label">
                      {isKh ? `ចំនួននាំចូលបន្ថែម (${restockItemTarget.unit})*` : `Restock Quantity (${restockItemTarget.unit})*`}
                    </label>
                    <input
                      type="number"
                      min="1"
                      className="input-field"
                      style={{ fontSize: '1.2rem', fontWeight: 800 }}
                      value={restockQty}
                      onChange={(e) => setRestockQty(e.target.value)}
                      required
                    />
                  </div>

                  <div className="input-group">
                    <label className="input-label">{isKh ? 'ថ្លៃដើមនាំចូលថ្មី ($)' : 'Cost Price per Unit ($)'}</label>
                    <input
                      type="number"
                      step="0.01"
                      className="input-field"
                      placeholder={restockItemTarget.costPrice}
                      value={restockCost}
                      onChange={(e) => setRestockCost(e.target.value)}
                    />
                  </div>
                </div>

                <div className="input-group">
                  <label className="input-label">{isKh ? 'អ្នកផ្គត់ផ្គង់ (Supplier)' : 'Supplier'}</label>
                  <input
                    type="text"
                    className="input-field"
                    value={restockSupplier}
                    onChange={(e) => setRestockSupplier(e.target.value)}
                    placeholder={restockItemTarget.supplier || 'ឧ. ក្រុមហ៊ុនចែកចាយ'}
                  />
                </div>

                <div className="input-group">
                  <label className="input-label">{isKh ? 'ចំណាំ / លេខកញ្ចប់' : 'Note / Reference'}</label>
                  <input
                    type="text"
                    className="input-field"
                    value={restockNote}
                    onChange={(e) => setRestockNote(e.target.value)}
                    placeholder="នាំចូលប្រចាំសប្តាហ៍..."
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setRestockItemTarget(null)}>
                  {isKh ? 'បោះបង់' : 'Cancel'}
                </button>
                <button type="submit" className="btn btn-success" style={{ fontWeight: 800 }}>
                  <Check size={18} />
                  <span>
                    {isKh ? `បញ្ជាក់នាំចូល +${restockQty} ${restockItemTarget.unit}` : `Confirm Restock +${restockQty}`}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Barcode Label Print */}
      {barcodeProduct && (
        <div className="modal-overlay" onClick={() => setBarcodeProduct(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Barcode size={20} style={{ color: 'var(--primary)' }} />
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>
                  {isKh ? 'ស្លាកបាកូដទំនិញ (Barcode Sticker)' : 'Barcode Label'}
                </h3>
              </div>
              <button
                type="button"
                className="control-btn"
                style={{ padding: '6px' }}
                onClick={() => setBarcodeProduct(null)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="modal-body" style={{ textAlign: 'center' }}>
              <div
                className="printable-area"
                style={{
                  display: 'inline-block',
                  background: '#ffffff',
                  color: '#000000',
                  padding: '20px 30px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.06)'
                }}
              >
                <div style={{ fontSize: '0.82rem', fontWeight: 700, marginBottom: '2px' }}>
                  {settings.storeNameKh}
                </div>
                <div style={{ fontSize: '0.95rem', fontWeight: 800, marginBottom: '8px' }}>
                  {isKh ? barcodeProduct.nameKh : barcodeProduct.nameEn}
                </div>

                {/* SVG Mock Barcode */}
                <svg width="220" height="70" viewBox="0 0 220 70">
                  <rect width="220" height="70" fill="#ffffff" />
                  <g fill="#000000">
                    <rect x="10" y="5" width="3" height="48" />
                    <rect x="15" y="5" width="1" height="48" />
                    <rect x="18" y="5" width="4" height="48" />
                    <rect x="25" y="5" width="2" height="48" />
                    <rect x="30" y="5" width="5" height="48" />
                    <rect x="38" y="5" width="1" height="48" />
                    <rect x="42" y="5" width="3" height="48" />
                    <rect x="48" y="5" width="2" height="48" />
                    <rect x="54" y="5" width="4" height="48" />
                    <rect x="62" y="5" width="2" height="48" />
                    <rect x="67" y="5" width="1" height="48" />
                    <rect x="72" y="5" width="5" height="48" />
                    <rect x="80" y="5" width="3" height="48" />
                    <rect x="86" y="5" width="1" height="48" />
                    <rect x="91" y="5" width="4" height="48" />
                    <rect x="98" y="5" width="2" height="48" />
                    <rect x="104" y="5" width="5" height="48" />
                    <rect x="112" y="5" width="1" height="48" />
                    <rect x="116" y="5" width="3" height="48" />
                    <rect x="122" y="5" width="2" height="48" />
                    <rect x="128" y="5" width="4" height="48" />
                    <rect x="136" y="5" width="2" height="48" />
                    <rect x="142" y="5" width="5" height="48" />
                    <rect x="150" y="5" width="1" height="48" />
                    <rect x="154" y="5" width="3" height="48" />
                    <rect x="160" y="5" width="2" height="48" />
                    <rect x="166" y="5" width="4" height="48" />
                    <rect x="174" y="5" width="2" height="48" />
                    <rect x="180" y="5" width="5" height="48" />
                    <rect x="188" y="5" width="1" height="48" />
                    <rect x="192" y="5" width="3" height="48" />
                    <rect x="198" y="5" width="4" height="48" />
                    <rect x="206" y="5" width="2" height="48" />
                  </g>
                  <text
                    x="110"
                    y="65"
                    fontFamily="monospace"
                    fontSize="11"
                    textAnchor="middle"
                    fill="#000000"
                    fontWeight="700"
                  >
                    {barcodeProduct.barcode || barcodeProduct.id}
                  </text>
                </svg>

                <div style={{ marginTop: '8px', fontSize: '1.25rem', fontWeight: 900, color: '#4f46e5' }}>
                  {formatUSD(barcodeProduct.sellingPrice)}
                  <span style={{ fontSize: '0.85rem', color: '#4b5563', fontWeight: 600, marginLeft: '6px' }}>
                    / {formatKHR(usdToRiel(barcodeProduct.sellingPrice, settings.exchangeRate))}
                  </span>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setBarcodeProduct(null)}>
                {isKh ? 'បិទ' : 'Close'}
              </button>
              <button className="btn btn-primary" onClick={() => window.print()}>
                <Printer size={18} />
                <span>{isKh ? 'បោះពុម្ពស្លាក (Print)' : 'Print Label'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
