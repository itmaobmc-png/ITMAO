import React, { useState } from 'react';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  ArrowDownToLine,
  Barcode,
  X,
  Check,
  Printer,
  LayoutGrid,
  List,
  Upload,
  Lock,
  ShoppingBag
} from 'lucide-react';
import { formatKHR } from '../utils/helpers';

export default function Products({
  products,
  setProducts,
  settings,
  lang,
  onRecordStockMovement,
  restockItemTarget,
  setRestockItemTarget,
  isAddModalOpen,
  setIsAddModalOpen,
  onAddToCart
}) {
  const isKh = lang === 'km';

  // Anyone can edit prices and products freely
  const canEditPrice = true;
  const canAddProduct = true;
  const canEditProduct = true;
  const canDeleteProduct = true;
  const canViewCostPrice = true;

  const [viewMode, setViewMode] = useState('grid'); // 'grid' (Menu Cards) or 'table' (List Table)
  const [searchQuery, setSearchQuery] = useState('');

  // Quick Inline Edit Price State
  const [quickEditPriceId, setQuickEditPriceId] = useState(null);
  const [quickEditPriceVal, setQuickEditPriceVal] = useState('');

  const startQuickEditPrice = (product, e) => {
    if (e) e.stopPropagation();
    setQuickEditPriceId(product.id);
    setQuickEditPriceVal(product.sellingPrice);
  };

  const handleSaveQuickPrice = (productId) => {
    const newPrice = parseFloat(quickEditPriceVal);
    if (!isNaN(newPrice) && newPrice >= 0) {
      setProducts((prev) =>
        prev.map((p) => (p.id === productId ? { ...p, sellingPrice: newPrice, updatedAt: new Date().toISOString() } : p))
      );
    }
    setQuickEditPriceId(null);
  };

  // Edit Modal State
  const [editingProduct, setEditingProduct] = useState(null);

  // Barcode Modal State
  const [barcodeProduct, setBarcodeProduct] = useState(null);

  // Image File Upload supporting PNG and JPG/JPEG
  const handleImageFile = (file, isEditing = false) => {
    if (!file) return;

    // Check PNG and JPG/JPEG formats
    const isPng = file.type === 'image/png' || /\.png$/i.test(file.name);
    const isJpg = file.type === 'image/jpeg' || file.type === 'image/jpg' || /\.(jpe?g)$/i.test(file.name);

    if (!isPng && !isJpg) {
      alert(isKh ? 'ប្រព័ន្ធទទួលស្គាល់តែប្រភេទរូបភាព PNG និង JPG ប៉ុណ្ណោះ!' : 'Only PNG and JPG/JPEG image formats are supported!');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_SIZE = 500;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_SIZE) {
            height = Math.round((height * MAX_SIZE) / width);
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width = Math.round((width * MAX_SIZE) / height);
            height = MAX_SIZE;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Keep transparent background for PNG; use high-quality JPEG for JPG
        const optimizedBase64 = isPng
          ? canvas.toDataURL('image/png')
          : canvas.toDataURL('image/jpeg', 0.88);

        if (isEditing) {
          setEditingProduct((prev) => ({ ...prev, image: optimizedBase64 }));
        } else {
          setNewProduct((prev) => ({ ...prev, image: optimizedBase64 }));
        }
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  // Restock Input State
  const [restockQty, setRestockQty] = useState(10);
  const [restockCost, setRestockCost] = useState('');
  const [restockSupplier, setRestockSupplier] = useState('');
  const [restockNote, setRestockNote] = useState('');

  // New Product Form State
  const [newProduct, setNewProduct] = useState({
    nameKh: '',
    barcode: '',
    costPrice: '',
    sellingPrice: '',
    stockQty: 10,
    minStock: 5,
    unit: 'កំប៉ុង',
    emoji: '📦',
    image: ''
  });

  // Filter products by search query
  const filteredProducts = products.filter((p) => {
    const query = searchQuery.toLowerCase().trim();
    return (
      !query ||
      p.nameKh?.toLowerCase().includes(query) ||
      p.barcode?.toLowerCase().includes(query) ||
      p.id?.toLowerCase().includes(query)
    );
  });

  // Delete product
  const handleDeleteProduct = (id) => {
    if (!canDeleteProduct) {
      alert(isKh ? '🔒 គណនីបុគ្គលិកពុំមានសិទ្ធិលុបទំនិញទេ! សូមទាក់ទង Admin។' : '🔒 Staff account cannot delete items!');
      return;
    }
    const target = products.find((p) => p.id === id);
    const name = target?.nameKh || '';
    if (window.confirm(isKh ? `តើអ្នកប្រាកដជាចង់លុបទំនិញ "${name}" នេះចេញពីប្រព័ន្ធមែនទេ?` : `Are you sure you want to delete "${name}"?`)) {
      setProducts((prev) => prev.filter((p) => p.id !== id));
    }
  };

  // Add Product Submit
  const handleCreateProduct = (e) => {
    e.preventDefault();
    if (!canAddProduct) {
      alert(isKh ? '🔒 គណនីបុគ្គលិកពុំមានសិទ្ធិបន្ថែមទំនិញថ្មីទេ! សូមទាក់ទង Admin។' : '🔒 Staff account cannot add items!');
      return;
    }
    if (!newProduct.nameKh) {
      alert(isKh ? 'សូមបញ្ចូលឈ្មោះទំនិញ!' : 'Please enter product name!');
      return;
    }

    const cost = parseFloat(newProduct.costPrice) || 0;
    const sell = parseFloat(newProduct.sellingPrice) || 0;
    const qty = parseInt(newProduct.stockQty, 10) || 0;

    const created = {
      id: `PRD-${Date.now().toString().slice(-5)}`,
      barcode: newProduct.barcode || `${Math.floor(100000000000 + Math.random() * 900000000000)}`,
      nameKh: newProduct.nameKh,
      costPrice: cost,
      sellingPrice: sell,
      stockQty: qty,
      minStock: parseInt(newProduct.minStock, 10) || 5,
      unit: newProduct.unit || 'កញ្ចប់',
      emoji: newProduct.emoji || '📦',
      image: newProduct.image || '',
      updatedAt: new Date().toISOString()
    };

    setProducts((prev) => [created, ...prev]);

    // Record stock movement if qty > 0
    if (onRecordStockMovement && qty > 0) {
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
      barcode: '',
      costPrice: '',
      sellingPrice: '',
      stockQty: 10,
      minStock: 5,
      unit: 'កំប៉ុង',
      emoji: '📦',
      image: ''
    });
  };

  // Edit Product Submit
  const handleUpdateProduct = (e) => {
    e.preventDefault();
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === editingProduct.id) {
          const finalSellingPrice = canEditPrice ? editingProduct.sellingPrice : p.sellingPrice;
          const finalCostPrice = canViewCostPrice ? editingProduct.costPrice : p.costPrice;
          return {
            ...p,
            ...(canEditProduct ? editingProduct : {}),
            sellingPrice: finalSellingPrice,
            costPrice: finalCostPrice,
            updatedAt: new Date().toISOString()
          };
        }
        return p;
      })
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
    if (onRecordStockMovement) {
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
    }

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
      {/* Top Banner: Menu ផលិតផល និងតម្លៃ */}
      <div
        className="card"
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          background: 'linear-gradient(135deg, var(--bg-card) 0%, var(--bg-card-subtle) 100%)',
          border: '1px solid var(--border-subtle)'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <span style={{ fontSize: '1.6rem' }}>📋</span>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--text-main)' }}>
              {isKh ? 'Menu ផលិតផល និងតម្លៃទំនិញ' : 'Product & Price Menu'}
            </h2>
            <span className="badge-tag primary" style={{ fontWeight: 800 }}>
              {products.length} {isKh ? 'មុខទំនិញ' : 'Items'}
            </span>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            {isKh
              ? 'បញ្ជីមុខទំនិញ និងតម្លៃលក់គិតជាប្រាក់រៀល (៛) ងាយស្រួលមើល និងគ្រប់គ្រង'
              : 'Complete product catalog and selling prices in Cambodian Riel (KHR ៛)'}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* View mode toggle (Grid Menu Cards vs Table List) */}
          <div style={{ display: 'flex', background: 'var(--bg-card-subtle)', padding: '3px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
            <button
              type="button"
              className={`control-btn ${viewMode === 'grid' ? 'active' : ''}`}
              style={{
                padding: '6px 12px',
                background: viewMode === 'grid' ? 'var(--primary)' : 'transparent',
                color: viewMode === 'grid' ? '#fff' : 'var(--text-main)',
                border: 'none',
                borderRadius: '4px',
                fontWeight: 700,
                fontSize: '0.82rem',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer'
              }}
              onClick={() => setViewMode('grid')}
            >
              <LayoutGrid size={15} />
              <span>{isKh ? 'ផលិតផល' : 'Products'}</span>
            </button>
            <button
              type="button"
              className={`control-btn ${viewMode === 'table' ? 'active' : ''}`}
              style={{
                padding: '6px 12px',
                background: viewMode === 'table' ? 'var(--primary)' : 'transparent',
                color: viewMode === 'table' ? '#fff' : 'var(--text-main)',
                border: 'none',
                borderRadius: '4px',
                fontWeight: 700,
                fontSize: '0.82rem',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer'
              }}
              onClick={() => setViewMode('table')}
            >
              <List size={15} />
              <span>{isKh ? 'តារាងបញ្ជី' : 'Table List'}</span>
            </button>
          </div>

          {/* Add Product Button */}
          <button
            className="btn btn-primary btn-lg"
            onClick={() => setIsAddModalOpen(true)}
          >
            <Plus size={18} />
            <span>{isKh ? 'បន្ថែមទំនិញថ្មី' : 'Add New Product'}</span>
          </button>
        </div>
      </div>

      {/* Search Toolbar */}
      <div className="card" style={{ padding: '14px 20px' }}>
        <div className="search-box" style={{ maxWidth: '480px', width: '100%' }}>
          <Search className="search-icon" size={18} />
          <input
            type="text"
            className="input-field"
            placeholder={isKh ? 'ស្វែងរកតាមឈ្មោះទំនិញ ឬ Barcode...' : 'Search product name or barcode...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* GRID VIEW (Menu Cards) */}
      {viewMode === 'grid' && (
        <div>
          {filteredProducts.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '50px 20px', color: 'var(--text-muted)' }}>
              🔍 {isKh ? 'រកមិនឃើញទំនិញដែលត្រូវនឹងការស្វែងរកទេ!' : 'No matching products found!'}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: '16px' }}>
              {filteredProducts.map((p) => {
                const isZero = p.stockQty <= 0;
                const isLow = p.stockQty > 0 && p.stockQty <= p.minStock;

                return (
                  <div
                    key={p.id}
                    className="card"
                    style={{
                      padding: '16px',
                      display: 'flex',
                      flexDirection: 'column',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-subtle)',
                      background: 'var(--bg-card)',
                      transition: 'all 0.2s ease',
                      position: 'relative'
                    }}
                  >
                    {/* Top: Stock Status */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: '10px' }}>
                      <span
                        className={`badge-tag ${isZero ? 'danger' : isLow ? 'warning' : 'success'}`}
                        style={{ fontSize: '0.72rem', fontWeight: 800 }}
                      >
                        {isZero ? (isKh ? 'អស់ស្តុក' : 'Out') : `${p.stockQty} ${p.unit}`}
                      </span>
                    </div>

                    {/* Product Image / Emoji */}
                    <div
                      style={{
                        width: '100%',
                        height: '140px',
                        borderRadius: 'var(--radius-sm)',
                        background: 'var(--bg-card-subtle)',
                        overflow: 'hidden',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '3.2rem',
                        marginBottom: '12px'
                      }}
                    >
                      {p.image ? (
                        <img src={p.image} alt={p.nameKh} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <span>{p.emoji || '📦'}</span>
                      )}
                    </div>

                    {/* Product Name */}
                    <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--text-main)', lineHeight: 1.3, marginBottom: p.barcode ? '4px' : '12px' }}>
                      {p.nameKh}
                    </div>
                    {p.barcode && (
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '12px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        #{p.barcode}
                      </div>
                    )}

                    {/* Price in Khmer Riel & Actions */}
                    <div style={{ marginTop: 'auto', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                          {canEditPrice
                            ? (isKh ? 'តម្លៃលក់ (ចុចដើម្បីកែ)' : 'Price (Click to edit)')
                            : (isKh ? 'តម្លៃលក់ 🔒' : 'Price 🔒')}
                        </div>
                        {quickEditPriceId === p.id ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }} onClick={(e) => e.stopPropagation()}>
                            <input
                              type="number"
                              step="100"
                              autoFocus
                              value={quickEditPriceVal}
                              onChange={(e) => setQuickEditPriceVal(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSaveQuickPrice(p.id);
                                if (e.key === 'Escape') setQuickEditPriceId(null);
                              }}
                              style={{
                                width: '105px',
                                padding: '4px 6px',
                                fontSize: '1rem',
                                fontWeight: 800,
                                border: '2px solid var(--primary)',
                                borderRadius: 'var(--radius-sm)',
                                background: 'var(--bg-card)',
                                color: 'var(--text-main)',
                                outline: 'none'
                              }}
                            />
                            <button
                              type="button"
                              className="btn btn-primary btn-sm"
                              style={{ padding: '4px 6px' }}
                              onClick={() => handleSaveQuickPrice(p.id)}
                              title={isKh ? 'រក្សាទុក' : 'Save'}
                            >
                              <Check size={14} />
                            </button>
                            <button
                              type="button"
                              className="btn btn-secondary btn-sm"
                              style={{ padding: '4px 6px' }}
                              onClick={() => setQuickEditPriceId(null)}
                              title={isKh ? 'បោះបង់' : 'Cancel'}
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ) : (
                          <div
                            onClick={(e) => startQuickEditPrice(p, e)}
                            style={{
                              cursor: canEditPrice ? 'pointer' : 'default',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px'
                            }}
                            title={canEditPrice ? (isKh ? 'ចុចលើតម្លៃនេះដើម្បីកែប្រែភ្លាមៗ' : 'Click to quick edit price') : (isKh ? '🔒 គ្មានសិទ្ធិកែតម្លៃទេ (ចុចមើលព័ត៌មាន)' : 'Price edit locked')}
                          >
                            <span style={{ fontSize: '1.35rem', fontWeight: 900, color: 'var(--primary)', lineHeight: 1.2 }}>
                              {formatKHR(p.sellingPrice)}
                            </span>
                            {canEditPrice ? (
                              <Edit size={13} style={{ color: 'var(--text-muted)', opacity: 0.7 }} />
                            ) : (
                              <Lock size={12} style={{ color: 'var(--text-muted)', opacity: 0.5 }} />
                            )}
                          </div>
                        )}
                      </div>

                      <div style={{ display: 'flex', gap: '6px' }}>
                        {(canEditProduct || canEditPrice) && (
                          <button
                            className="control-btn"
                            style={{ padding: '6px 8px' }}
                            onClick={() => setEditingProduct({ ...p })}
                            title={isKh ? 'កែប្រែតម្លៃ/ទំនិញ' : 'Edit item'}
                          >
                            <Edit size={15} />
                          </button>
                        )}
                        {canDeleteProduct && (
                          <button
                            className="control-btn"
                            style={{ padding: '6px 8px', color: 'var(--danger)' }}
                            onClick={() => handleDeleteProduct(p.id, p.nameKh)}
                            title={isKh ? 'លុប' : 'Delete item'}
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Sell Out / Add to Cart Action Button */}
                    <button
                      type="button"
                      className="btn btn-success"
                      disabled={isZero}
                      onClick={() => onAddToCart && onAddToCart(p)}
                      style={{
                        width: '100%',
                        marginTop: '10px',
                        padding: '9px 12px',
                        fontWeight: 800,
                        fontSize: '0.86rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        borderRadius: 'var(--radius-sm)'
                      }}
                    >
                      <ShoppingBag size={15} />
                      <span>{isZero ? (isKh ? 'អស់ពីស្តុក' : 'Out of stock') : (isKh ? '+ ដាក់លក់ចេញ' : '+ Add to Sale')}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TABLE VIEW (List Table) */}
      {viewMode === 'table' && (
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>{isKh ? 'ទំនិញ' : 'Product'}</th>
                <th>{isKh ? 'បាកូដ / SKU' : 'Barcode / SKU'}</th>
                <th>{isKh ? 'ថ្លៃដើម' : 'Cost Price'}</th>
                <th>{isKh ? 'តម្លៃលក់' : 'Sell Price'}</th>
                <th>{isKh ? 'ចំណេញ / ឯកតា' : 'Margin / Profit'}</th>
                <th>{isKh ? 'ចំនួនក្នុងស្តុក' : 'Stock Qty'}</th>
                <th style={{ textAlign: 'right' }}>{isKh ? 'សកម្មភាព' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
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
                            <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>{p.nameKh}</div>
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

                      {/* Cost */}
                      <td style={{ fontWeight: 600 }}>
                        {canViewCostPrice ? formatKHR(p.costPrice) : <span style={{ color: 'var(--text-muted)' }}>•••• ៛</span>}
                      </td>

                      {/* Sell Price (Inline Quick Edit) */}
                      <td>
                        {quickEditPriceId === p.id ? (
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <input
                              type="number"
                              step="100"
                              autoFocus
                              value={quickEditPriceVal}
                              onChange={(e) => setQuickEditPriceVal(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSaveQuickPrice(p.id);
                                if (e.key === 'Escape') setQuickEditPriceId(null);
                              }}
                              style={{
                                width: '100px',
                                padding: '4px 6px',
                                fontSize: '0.9rem',
                                fontWeight: 800,
                                border: '2px solid var(--primary)',
                                borderRadius: 'var(--radius-sm)',
                                background: 'var(--bg-card)',
                                color: 'var(--text-main)',
                                outline: 'none'
                              }}
                            />
                            <button
                              type="button"
                              className="btn btn-primary btn-sm"
                              style={{ padding: '3px 6px' }}
                              onClick={() => handleSaveQuickPrice(p.id)}
                              title={isKh ? 'រក្សាទុក' : 'Save'}
                            >
                              <Check size={13} />
                            </button>
                            <button
                              type="button"
                              className="btn btn-secondary btn-sm"
                              style={{ padding: '3px 6px' }}
                              onClick={() => setQuickEditPriceId(null)}
                              title={isKh ? 'បោះបង់' : 'Cancel'}
                            >
                              <X size={13} />
                            </button>
                          </div>
                        ) : (
                          <div
                            onClick={(e) => startQuickEditPrice(p, e)}
                            style={{
                              cursor: canEditPrice ? 'pointer' : 'default',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              fontWeight: 800,
                              color: 'var(--primary)'
                            }}
                            title={canEditPrice ? (isKh ? 'ចុចដើម្បីកែតម្លៃរហ័ស' : 'Click to quick edit price') : (isKh ? '🔒 គ្មានសិទ្ធិកែតម្លៃទេ' : 'Price edit locked')}
                          >
                            <span>{formatKHR(p.sellingPrice)}</span>
                            {canEditPrice ? (
                              <Edit size={13} style={{ color: 'var(--text-muted)', opacity: 0.6 }} />
                            ) : (
                              <Lock size={12} style={{ color: 'var(--text-muted)', opacity: 0.5 }} />
                            )}
                          </div>
                        )}
                      </td>

                      {/* Profit */}
                      <td>
                        {canViewCostPrice ? (
                          <>
                            <span style={{ fontWeight: 700, color: 'var(--success)', fontSize: '0.85rem' }}>
                              +{formatKHR(profit)}
                            </span>
                            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>
                              ({profitPercent}%)
                            </span>
                          </>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>••••</span>
                        )}
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

                      {/* Actions */}
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '6px' }}>
                          <button
                            className="btn btn-success btn-sm"
                            disabled={isZero}
                            onClick={() => onAddToCart && onAddToCart(p)}
                            title={isKh ? 'ដាក់លក់ចេញ' : 'Add to sale'}
                            style={{ padding: '6px 10px', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                          >
                            <ShoppingBag size={14} />
                            <span>{isKh ? 'លក់ចេញ' : 'Sell'}</span>
                          </button>

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

                          {(canEditProduct || canEditPrice) && (
                            <button
                              className="control-btn"
                              style={{ padding: '6px 8px' }}
                              onClick={() => setEditingProduct({ ...p })}
                              title={isKh ? 'កែសម្រួល' : 'Edit'}
                            >
                              <Edit size={15} />
                            </button>
                          )}

                          {canDeleteProduct && (
                            <button
                              className="control-btn"
                              style={{ padding: '6px 8px', color: 'var(--danger)' }}
                              onClick={() => handleDeleteProduct(p.id)}
                              title={isKh ? 'លុប' : 'Delete'}
                            >
                              <Trash2 size={15} />
                            </button>
                          )}
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
      )}

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
                <div className="input-group">
                  <label className="input-label">{isKh ? 'ឈ្មោះទំនិញ*' : 'Product Name*'}</label>
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
                  <label className="input-label">{isKh ? 'លេខបាកូដ (Barcode)' : 'Barcode / SKU'}</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="88501234..."
                    value={newProduct.barcode}
                    onChange={(e) => setNewProduct({ ...newProduct, barcode: e.target.value })}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="input-group">
                    <label className="input-label">{isKh ? 'ថ្លៃដើមទុន (៛)' : 'Cost Price (KHR ៛)'}</label>
                    <input
                      type="number"
                      step="100"
                      className="input-field"
                      placeholder="1800"
                      value={newProduct.costPrice}
                      onChange={(e) => setNewProduct({ ...newProduct, costPrice: e.target.value })}
                      required
                    />
                  </div>

                  <div className="input-group">
                    <label className="input-label">{isKh ? 'តម្លៃលក់ចេញ (៛)*' : 'Selling Price (KHR ៛)*'}</label>
                    <input
                      type="number"
                      step="100"
                      className="input-field"
                      placeholder="2500"
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

                {/* Image Uploader & Preview (Add Modal) */}
                <div className="input-group">
                  <label className="input-label">
                    {isKh ? 'រូបភាពទំនិញ (ជ្រើសរើសរូបពីកុំព្យូទ័រ/ទូរស័ព្ទ)' : 'Product Image (Upload Photo)'}
                  </label>
                  
                  <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                    {/* Preview thumbnail */}
                    <div
                      style={{
                        width: '84px',
                        height: '84px',
                        borderRadius: 'var(--radius-md)',
                        border: '2px dashed var(--border-subtle)',
                        background: 'var(--bg-card-subtle)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                        position: 'relative',
                        flexShrink: 0
                      }}
                    >
                      {newProduct.image ? (
                        <>
                          <img src={newProduct.image} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          <button
                            type="button"
                            onClick={() => setNewProduct({ ...newProduct, image: '' })}
                            style={{
                              position: 'absolute',
                              top: '3px',
                              right: '3px',
                              background: 'rgba(239, 68, 68, 0.85)',
                              color: '#fff',
                              border: 'none',
                              borderRadius: '50%',
                              width: '20px',
                              height: '20px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer'
                            }}
                            title={isKh ? 'លុបរូបភាព' : 'Remove Image'}
                          >
                            <X size={12} />
                          </button>
                        </>
                      ) : (
                        <span style={{ fontSize: '2.2rem' }}>{newProduct.emoji || '📦'}</span>
                      )}
                    </div>

                    {/* Actions: Browse File & URL */}
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                        <label
                          className="btn btn-secondary btn-sm"
                          style={{
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            fontWeight: 700,
                            padding: '8px 12px',
                            background: 'var(--primary-light)',
                            color: 'var(--primary)',
                            border: '1px solid var(--primary)'
                          }}
                        >
                          <Upload size={16} />
                          <span>{isKh ? '📁 ជ្រើសរើសរូបភាព (PNG, JPG)' : '📁 Choose Image (PNG, JPG)'}</span>
                          <input
                            type="file"
                            accept=".png, .jpg, .jpeg, image/png, image/jpeg"
                            style={{ display: 'none' }}
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                handleImageFile(e.target.files[0], false);
                              }
                              e.target.value = '';
                            }}
                          />
                        </label>
                      </div>

                      <input
                        type="text"
                        className="input-field"
                        style={{ fontSize: '0.82rem', padding: '6px 10px' }}
                        placeholder={isKh ? 'ឬបិទភ្ជាប់តំណភ្ជាប់រូបភាព (https://...) ឬ Emoji' : 'Or paste Image URL (https://...) or Emoji'}
                        value={newProduct.image && !newProduct.image.startsWith('data:') ? newProduct.image : newProduct.emoji}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val.startsWith('http')) setNewProduct({ ...newProduct, image: val });
                          else setNewProduct({ ...newProduct, emoji: val });
                        }}
                      />
                    </div>
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
                <div className="input-group">
                  <label className="input-label">{isKh ? 'ឈ្មោះទំនិញ*' : 'Product Name*'}</label>
                  <input
                    type="text"
                    className="input-field"
                    value={editingProduct.nameKh}
                    onChange={(e) => setEditingProduct({ ...editingProduct, nameKh: e.target.value })}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="input-group">
                    <label className="input-label">
                      <span>{isKh ? 'ថ្លៃដើម (៛)' : 'Cost Price (KHR ៛)'}</span>
                      {!canViewCostPrice && (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>
                          🔒 {isKh ? 'បានបិទបាំង' : 'Hidden'}
                        </span>
                      )}
                    </label>
                    <input
                      type={canViewCostPrice ? 'number' : 'text'}
                      step="100"
                      className="input-field"
                      disabled={!canViewCostPrice}
                      value={canViewCostPrice ? editingProduct.costPrice : '••••••'}
                      onChange={(e) => setEditingProduct({ ...editingProduct, costPrice: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="input-group">
                    <label className="input-label">
                      <span>{isKh ? 'តម្លៃលក់ (៛)*' : 'Selling Price (KHR ៛)*'}</span>
                      {!canEditPrice && (
                        <span style={{ color: 'var(--danger)', fontSize: '0.72rem', fontWeight: 700 }}>
                          🔒 {isKh ? 'គ្មានសិទ្ធិកែ' : 'Locked'}
                        </span>
                      )}
                    </label>
                    <input
                      type="number"
                      step="100"
                      className="input-field"
                      disabled={!canEditPrice}
                      style={{
                        background: !canEditPrice ? 'var(--bg-hover)' : undefined,
                        cursor: !canEditPrice ? 'not-allowed' : undefined
                      }}
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

                {/* Image Uploader & Preview (Edit Modal) */}
                <div className="input-group" style={{ marginTop: '14px' }}>
                  <label className="input-label">
                    {isKh ? 'រូបភាពទំនិញ (ជ្រើសរើសរូបពីកុំព្យូទ័រ/ទូរស័ព្ទ)' : 'Product Image (Upload Photo)'}
                  </label>
                  
                  <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                    {/* Preview thumbnail */}
                    <div
                      style={{
                        width: '84px',
                        height: '84px',
                        borderRadius: 'var(--radius-md)',
                        border: '2px dashed var(--border-subtle)',
                        background: 'var(--bg-card-subtle)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                        position: 'relative',
                        flexShrink: 0
                      }}
                    >
                      {editingProduct.image ? (
                        <>
                          <img src={editingProduct.image} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          <button
                            type="button"
                            onClick={() => setEditingProduct({ ...editingProduct, image: '' })}
                            style={{
                              position: 'absolute',
                              top: '3px',
                              right: '3px',
                              background: 'rgba(239, 68, 68, 0.85)',
                              color: '#fff',
                              border: 'none',
                              borderRadius: '50%',
                              width: '20px',
                              height: '20px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer'
                            }}
                            title={isKh ? 'លុបរូបភាព' : 'Remove Image'}
                          >
                            <X size={12} />
                          </button>
                        </>
                      ) : (
                        <span style={{ fontSize: '2.2rem' }}>{editingProduct.emoji || '📦'}</span>
                      )}
                    </div>

                    {/* Actions: Browse File & URL */}
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                        <label
                          className="btn btn-secondary btn-sm"
                          style={{
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            fontWeight: 700,
                            padding: '8px 12px',
                            background: 'var(--primary-light)',
                            color: 'var(--primary)',
                            border: '1px solid var(--primary)'
                          }}
                        >
                          <Upload size={16} />
                          <span>{isKh ? '📁 ជ្រើសរើសរូបភាព (PNG, JPG)' : '📁 Choose Image (PNG, JPG)'}</span>
                          <input
                            type="file"
                            accept=".png, .jpg, .jpeg, image/png, image/jpeg"
                            style={{ display: 'none' }}
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                handleImageFile(e.target.files[0], true);
                              }
                              e.target.value = '';
                            }}
                          />
                        </label>
                      </div>

                      <input
                        type="text"
                        className="input-field"
                        style={{ fontSize: '0.82rem', padding: '6px 10px' }}
                        placeholder={isKh ? 'ឬបិទភ្ជាប់តំណភ្ជាប់រូបភាព (https://...) ឬ Emoji' : 'Or paste Image URL (https://...) or Emoji'}
                        value={editingProduct.image && !editingProduct.image.startsWith('data:') ? editingProduct.image : editingProduct.emoji}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val.startsWith('http')) setEditingProduct({ ...editingProduct, image: val });
                          else setEditingProduct({ ...editingProduct, emoji: val });
                        }}
                      />
                    </div>
                  </div>
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
                      {restockItemTarget.nameKh}
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
                    <label className="input-label">{isKh ? 'ថ្លៃដើមនាំចូលថ្មី (៛)' : 'Cost Price per Unit (KHR ៛)'}</label>
                    <input
                      type="number"
                      step="100"
                      className="input-field"
                      placeholder={restockItemTarget.costPrice}
                      value={restockCost}
                      onChange={(e) => setRestockCost(e.target.value)}
                    />
                  </div>
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
                  {barcodeProduct.nameKh}
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

                <div style={{ marginTop: '8px', fontSize: '1.4rem', fontWeight: 900, color: '#4f46e5' }}>
                  {formatKHR(barcodeProduct.sellingPrice)}
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
