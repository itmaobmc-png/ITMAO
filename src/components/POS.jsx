import React, { useState } from 'react';
import {
  Search,
  Plus,
  Minus,
  Trash2,
  CreditCard,
  Banknote,
  QrCode,
  X,
  CheckCircle2,
  Sparkles,
  ShoppingBag
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { INITIAL_CATEGORIES } from '../data/initialData';
import { formatUSD, formatKHR, usdToRiel, playBeep, playSuccessSound } from '../utils/helpers';

export default function POS({
  products,
  cart,
  setCart,
  settings,
  lang,
  onCompleteSale
}) {
  const isKh = lang === 'km';
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [customer, setCustomer] = useState('អតិថិជនទូទៅ (Walk-in)');
  const [discount, setDiscount] = useState(0);

  // Payment Modal states
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('CASH'); // 'CASH' or 'KHQR'
  const [cashReceived, setCashReceived] = useState('');

  // Filter products
  const filteredProducts = products.filter((p) => {
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      p.nameKh?.toLowerCase().includes(query) ||
      p.nameEn?.toLowerCase().includes(query) ||
      p.barcode?.toLowerCase().includes(query) ||
      p.id?.toLowerCase().includes(query);

    return matchesCategory && matchesSearch;
  });

  // Cart operations
  const addToCart = (product) => {
    if (product.stockQty <= 0) return;

    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.id === product.id);
      if (existing) {
        if (existing.qty >= product.stockQty) {
          alert(isKh ? `ស្តុកទំនិញនេះនៅសល់ត្រឹមតែ ${product.stockQty} ប៉ុណ្ណោះ!` : `Stock limit reached: only ${product.stockQty} available!`);
          return prevCart;
        }
        playBeep();
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        );
      } else {
        playBeep();
        return [...prevCart, { ...product, qty: 1 }];
      }
    });
  };

  const updateCartQty = (productId, delta) => {
    setCart((prevCart) => {
      const product = products.find((p) => p.id === productId);
      return prevCart
        .map((item) => {
          if (item.id === productId) {
            const newQty = item.qty + delta;
            if (newQty <= 0) return null;
            if (product && newQty > product.stockQty) {
              alert(isKh ? `មិនអាចលក់លើសចំនួនក្នុងស្តុក (${product.stockQty}) បានទេ!` : `Cannot exceed available stock of ${product.stockQty}!`);
              return item;
            }
            playBeep();
            return { ...item, qty: newQty };
          }
          return item;
        })
        .filter(Boolean);
    });
  };

  const removeCartItem = (productId) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
  };

  const clearCart = () => {
    if (cart.length === 0) return;
    if (window.confirm(isKh ? 'តើអ្នកប្រាកដជាចង់សម្អាតកន្ត្រកទំនិញនេះមែនទេ?' : 'Clear all items in cart?')) {
      setCart([]);
    }
  };

  // Totals
  const subtotal = cart.reduce((sum, item) => sum + item.sellingPrice * item.qty, 0);
  const discountVal = Number(discount) || 0;
  const totalUSD = Math.max(0, subtotal - discountVal);
  const totalKHR = usdToRiel(totalUSD, settings.exchangeRate);

  // Checkout handling
  const handleOpenCheckout = () => {
    if (cart.length === 0) return;
    setCashReceived(totalUSD.toFixed(2));
    setIsCheckoutOpen(true);
  };

  const handleFinishPayment = () => {
    const receivedNum = Number(cashReceived) || totalUSD;
    if (paymentMethod === 'CASH' && receivedNum < totalUSD) {
      alert(isKh ? 'ចំនួនប្រាក់ទទួលមិនទាន់គ្រប់គ្រាន់នៅឡើយទេ!' : 'Cash received is less than total amount!');
      return;
    }

    const changeUSD = paymentMethod === 'CASH' ? Math.max(0, receivedNum - totalUSD) : 0;
    const changeKHR = usdToRiel(changeUSD, settings.exchangeRate);

    const saleRecord = {
      id: `INV-${Date.now().toString().slice(-7)}`,
      date: new Date().toISOString(),
      items: cart.map((it) => ({
        id: it.id,
        nameKh: it.nameKh,
        nameEn: it.nameEn,
        price: it.sellingPrice,
        costPrice: it.costPrice,
        qty: it.qty,
        total: it.sellingPrice * it.qty,
        unit: it.unit
      })),
      subtotal,
      discount: discountVal,
      total: totalUSD,
      totalRiel: totalKHR,
      paymentMethod,
      cashReceived: paymentMethod === 'CASH' ? receivedNum : totalUSD,
      cashChange: changeUSD,
      cashChangeRiel: changeKHR,
      cashier: 'សុខា (Cashier)',
      customer,
      status: 'COMPLETED'
    };

    playSuccessSound();
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });

    onCompleteSale(saleRecord);
    setIsCheckoutOpen(false);
    setCart([]);
  };

  return (
    <div className="pos-layout">
      {/* Left: Product Selector */}
      <div>
        {/* Search & Top Action */}
        <div className="pos-products-header">
          <div className="search-box">
            <Search className="search-icon" size={18} />
            <input
              type="text"
              className="input-field"
              placeholder={isKh ? 'ស្វែងរកឈ្មោះ, Barcode, ឬ SKU...' : 'Search name, barcode or SKU...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              {isKh ? `បង្ហាញ ${filteredProducts.length} មុខ` : `Showing ${filteredProducts.length} items`}
            </span>
          </div>
        </div>

        {/* Category Pills */}
        <div className="pos-category-pills">
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

        {/* Product Cards Grid */}
        <div className="product-grid">
          {filteredProducts.map((p) => {
            const isZero = p.stockQty <= 0;
            const isLow = p.stockQty > 0 && p.stockQty <= p.minStock;

            return (
              <div
                key={p.id}
                className={`product-card ${isZero ? 'out-of-stock' : ''}`}
                onClick={() => !isZero && addToCart(p)}
                title={isZero ? (isKh ? 'អស់ពីស្តុក' : 'Out of Stock') : (isKh ? 'ចុចដើម្បីដាក់ចូលកន្ត្រក' : 'Click to add to cart')}
              >
                <div className="product-thumb">
                  {p.image ? (
                    <img src={p.image} alt={p.nameEn} loading="lazy" />
                  ) : (
                    <span>{p.emoji || '📦'}</span>
                  )}
                  {/* Stock Tag on Top Corner */}
                  <span
                    className={`badge-tag ${isZero ? 'danger' : isLow ? 'warning' : 'success'}`}
                    style={{ position: 'absolute', top: '6px', right: '6px', fontSize: '0.68rem', padding: '2px 6px' }}
                  >
                    {isZero ? (isKh ? 'អស់ស្តុក' : 'Out') : `${p.stockQty} ${p.unit}`}
                  </span>
                </div>

                <div className="product-name-kh" title={p.nameKh}>
                  {p.nameKh}
                </div>
                <div className="product-name-en" title={p.nameEn}>
                  {p.nameEn}
                </div>

                <div className="product-meta">
                  <div>
                    <div className="product-price">{formatUSD(p.sellingPrice)}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      {formatKHR(usdToRiel(p.sellingPrice, settings.exchangeRate))}
                    </div>
                  </div>

                  <button
                    className="btn btn-primary btn-sm"
                    disabled={isZero}
                    style={{ padding: '6px 8px', borderRadius: 'var(--radius-sm)' }}
                  >
                    <Plus size={15} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right: Cart Panel */}
      <div className="pos-cart-panel">
        <div className="cart-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShoppingBag size={20} style={{ color: 'var(--primary)' }} />
            <h3 style={{ fontSize: '1rem', fontWeight: 800 }}>
              {isKh ? 'កន្ត្រកទំនិញ' : 'Cart'} ({cart.length})
            </h3>
          </div>
          {cart.length > 0 && (
            <button
              onClick={clearCart}
              style={{ background: 'transparent', border: 'none', color: 'var(--danger)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', fontWeight: 600 }}
              title={isKh ? 'សម្អាតកន្ត្រក' : 'Clear Cart'}
            >
              <Trash2 size={14} />
              <span>{isKh ? 'លុបទាំងអស់' : 'Clear'}</span>
            </button>
          )}
        </div>

        {/* Customer select */}
        <div style={{ padding: '10px 18px', borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-card-subtle)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px' }}>
            {isKh ? 'អតិថិជន (Customer)' : 'Customer'}
          </div>
          <select
            className="input-field"
            value={customer}
            onChange={(e) => setCustomer(e.target.value)}
            style={{ padding: '6px 10px', fontSize: '0.85rem' }}
          >
            <option value="អតិថិជនទូទៅ (Walk-in)">{isKh ? 'អតិថិជនទូទៅ (Walk-in Customer)' : 'Walk-in Customer'}</option>
            <option value="អតិថិជន VIP (VIP Member)">{isKh ? 'អតិថិជន VIP (VIP Member)' : 'VIP Member'}</option>
            <option value="អតិថិជនប្រចាំ (Regular)">{isKh ? 'អតិថិជនប្រចាំ (Regular)' : 'Regular'}</option>
          </select>
        </div>

        {/* Cart Item List */}
        <div className="cart-items-list">
          {cart.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 10px', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>🛒</div>
              <div style={{ fontWeight: 700 }}>{isKh ? 'មិនទាន់មានទំនិញក្នុងកន្ត្រក' : 'Cart is empty'}</div>
              <div style={{ fontSize: '0.8rem', marginTop: '4px' }}>
                {isKh ? 'សូមចុចលើទំនិញដើម្បីដាក់បញ្ចូល' : 'Click any product to add'}
              </div>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="cart-item">
                <div className="cart-item-info">
                  <div className="cart-item-title" title={isKh ? item.nameKh : item.nameEn}>
                    {isKh ? item.nameKh : item.nameEn}
                  </div>
                  <div className="cart-item-price">
                    {formatUSD(item.sellingPrice)} × {item.qty} = <b>{formatUSD(item.sellingPrice * item.qty)}</b>
                  </div>
                </div>

                <div className="cart-qty-ctrl">
                  <button
                    className="cart-qty-btn"
                    onClick={() => updateCartQty(item.id, -1)}
                    title="Decrease"
                  >
                    <Minus size={13} />
                  </button>
                  <span className="cart-qty-num">{item.qty}</span>
                  <button
                    className="cart-qty-btn"
                    onClick={() => updateCartQty(item.id, 1)}
                    title="Increase"
                  >
                    <Plus size={13} />
                  </button>
                </div>

                <button
                  onClick={() => removeCartItem(item.id)}
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
                  title="Remove"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Cart Summary & Checkout */}
        <div className="cart-summary">
          <div className="summary-row">
            <span>{isKh ? 'សរុបរង (Subtotal)' : 'Subtotal'}</span>
            <span style={{ fontWeight: 700 }}>{formatUSD(subtotal)}</span>
          </div>

          <div className="summary-row">
            <span>{isKh ? 'បញ្ចុះតម្លៃ ($) (Discount)' : 'Discount ($)'}</span>
            <input
              type="number"
              min="0"
              step="0.05"
              value={discount}
              onChange={(e) => setDiscount(Math.max(0, parseFloat(e.target.value) || 0))}
              style={{
                width: '75px',
                padding: '3px 6px',
                textAlign: 'right',
                borderRadius: '4px',
                border: '1px solid var(--border-subtle)',
                background: 'var(--bg-card)'
              }}
            />
          </div>

          <div className="summary-row total">
            <span>{isKh ? 'សរុបត្រូវបង់' : 'Total Due'}</span>
            <span>{formatUSD(totalUSD)}</span>
          </div>
          <div className="summary-total-riel">
            ≈ {formatKHR(totalKHR)}
          </div>

          <button
            className="btn btn-primary btn-lg"
            style={{ width: '100%', fontWeight: 800 }}
            disabled={cart.length === 0}
            onClick={handleOpenCheckout}
          >
            <Banknote size={20} />
            <span>{isKh ? 'គិតលុយទូទាត់ (Checkout)' : 'Proceed to Checkout'}</span>
          </button>
        </div>
      </div>

      {/* Checkout Modal */}
      {isCheckoutOpen && (
        <div className="modal-overlay" onClick={() => setIsCheckoutOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={20} style={{ color: 'var(--primary)' }} />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>
                  {isKh ? 'ទូទាត់ប្រាក់ការបញ្ជាទិញ' : 'Payment Checkout'}
                </h3>
              </div>
              <button
                className="control-btn"
                style={{ padding: '6px' }}
                onClick={() => setIsCheckoutOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              {/* Total Due Banner */}
              <div
                style={{
                  background: 'var(--bg-card-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '16px',
                  textAlign: 'center',
                  marginBottom: '20px',
                  border: '1px solid var(--border-subtle)'
                }}
              >
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 700 }}>
                  {isKh ? 'ចំនួនទឹកប្រាក់សរុប' : 'Total Due Amount'}
                </div>
                <div style={{ fontSize: '2.1rem', fontWeight: 900, color: 'var(--primary)', lineHeight: 1.2 }}>
                  {formatUSD(totalUSD)}
                </div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '2px' }}>
                  {formatKHR(totalKHR)}
                </div>
              </div>

              {/* Payment Method Selector */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                <button
                  type="button"
                  className="btn"
                  onClick={() => setPaymentMethod('CASH')}
                  style={{
                    padding: '14px',
                    flexDirection: 'column',
                    gap: '6px',
                    background: paymentMethod === 'CASH' ? 'var(--primary-light)' : 'var(--bg-card-subtle)',
                    borderColor: paymentMethod === 'CASH' ? 'var(--primary)' : 'var(--border-subtle)',
                    color: paymentMethod === 'CASH' ? 'var(--primary)' : 'var(--text-main)'
                  }}
                >
                  <Banknote size={26} />
                  <span style={{ fontWeight: 800 }}>{isKh ? 'លុយសុទ្ធ (CASH)' : 'Cash Payment'}</span>
                </button>

                <button
                  type="button"
                  className="btn"
                  onClick={() => setPaymentMethod('KHQR')}
                  style={{
                    padding: '14px',
                    flexDirection: 'column',
                    gap: '6px',
                    background: paymentMethod === 'KHQR' ? 'rgba(225, 29, 72, 0.12)' : 'var(--bg-card-subtle)',
                    borderColor: paymentMethod === 'KHQR' ? '#e11d48' : 'var(--border-subtle)',
                    color: paymentMethod === 'KHQR' ? '#e11d48' : 'var(--text-main)'
                  }}
                >
                  <QrCode size={26} />
                  <span style={{ fontWeight: 800 }}>{isKh ? 'ស្កេន KHQR (Bakong)' : 'KHQR Bakong'}</span>
                </button>
              </div>

              {/* CASH Tender Details */}
              {paymentMethod === 'CASH' && (
                <div>
                  <div className="input-group">
                    <label className="input-label">
                      <span>{isKh ? 'ប្រាក់ទទួលពីអតិថិជន ($)' : 'Cash Received ($)'}</span>
                    </label>
                    <input
                      type="number"
                      step="0.05"
                      className="input-field"
                      style={{ fontSize: '1.25rem', fontWeight: 800 }}
                      value={cashReceived}
                      onChange={(e) => setCashReceived(e.target.value)}
                    />
                  </div>

                  {/* Quick Tender Options */}
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
                    {[totalUSD, 5, 10, 20, 50, 100].map((amt, idx) => (
                      <button
                        key={idx}
                        type="button"
                        className="control-btn"
                        style={{ fontSize: '0.8rem', padding: '6px 10px', fontWeight: 700 }}
                        onClick={() => setCashReceived(amt.toFixed(2))}
                      >
                        {formatUSD(amt)}
                      </button>
                    ))}
                  </div>

                  {/* Change Calculation */}
                  {Number(cashReceived) >= totalUSD && (
                    <div
                      style={{
                        padding: '12px 16px',
                        borderRadius: 'var(--radius-md)',
                        background: 'var(--success-light)',
                        border: '1px solid rgba(16, 185, 129, 0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--success)', fontWeight: 700 }}>
                          {isKh ? 'ប្រាក់អាប់ត្រូវជូនវិញ' : 'Change Due'}
                        </div>
                        <div style={{ fontSize: '1.35rem', fontWeight: 900, color: 'var(--success)' }}>
                          {formatUSD(Number(cashReceived) - totalUSD)}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right', fontWeight: 700, color: 'var(--success)' }}>
                        ≈ {formatKHR(usdToRiel(Number(cashReceived) - totalUSD, settings.exchangeRate))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* KHQR Bakong Card */}
              {paymentMethod === 'KHQR' && (
                <div className="khqr-card">
                  <div className="khqr-header">
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', opacity: 0.9, letterSpacing: '0.05em' }}>
                        KHQR Payment
                      </div>
                      <div style={{ fontWeight: 800, fontSize: '1rem' }}>
                        {settings.khqrMerchantName}
                      </div>
                    </div>
                    <div style={{ background: '#ffffff', color: '#e11d48', padding: '3px 8px', borderRadius: '4px', fontWeight: 900, fontSize: '0.8rem' }}>
                      BAKONG
                    </div>
                  </div>

                  <div className="khqr-qr-container">
                    {/* SVG generated dynamic QR simulation */}
                    <svg width="170" height="170" viewBox="0 0 100 100">
                      <rect width="100" height="100" fill="#ffffff" />
                      {/* Top-left position marker */}
                      <rect x="5" y="5" width="26" height="26" fill="#000000" rx="3" />
                      <rect x="9" y="9" width="18" height="18" fill="#ffffff" rx="2" />
                      <rect x="13" y="13" width="10" height="10" fill="#e11d48" rx="1" />
                      {/* Top-right position marker */}
                      <rect x="69" y="5" width="26" height="26" fill="#000000" rx="3" />
                      <rect x="73" y="9" width="18" height="18" fill="#ffffff" rx="2" />
                      <rect x="77" y="13" width="10" height="10" fill="#e11d48" rx="1" />
                      {/* Bottom-left position marker */}
                      <rect x="5" y="69" width="26" height="26" fill="#000000" rx="3" />
                      <rect x="9" y="73" width="18" height="18" fill="#ffffff" rx="2" />
                      <rect x="13" y="77" width="10" height="10" fill="#e11d48" rx="1" />
                      {/* Decorative QR code matrix dots */}
                      <rect x="36" y="8" width="5" height="10" fill="#000" />
                      <rect x="46" y="8" width="8" height="6" fill="#000" />
                      <rect x="58" y="12" width="6" height="8" fill="#000" />
                      <rect x="36" y="24" width="22" height="6" fill="#000" />
                      <rect x="8" y="38" width="8" height="18" fill="#000" />
                      <rect x="22" y="38" width="12" height="6" fill="#000" />
                      <rect x="40" y="38" width="20" height="20" fill="#e11d48" rx="4" />
                      <circle cx="50" cy="48" r="4" fill="#fff" />
                      <rect x="68" y="38" width="8" height="14" fill="#000" />
                      <rect x="82" y="44" width="10" height="10" fill="#000" />
                      <rect x="36" y="68" width="12" height="8" fill="#000" />
                      <rect x="54" y="68" width="18" height="6" fill="#000" />
                      <rect x="42" y="80" width="10" height="12" fill="#000" />
                      <rect x="58" y="82" width="18" height="10" fill="#000" />
                      <rect x="82" y="72" width="10" height="18" fill="#000" />
                    </svg>
                  </div>

                  <div style={{ marginTop: '12px' }}>
                    <div style={{ fontSize: '1.25rem', fontWeight: 900 }}>
                      {formatUSD(totalUSD)} / {formatKHR(totalKHR)}
                    </div>
                    <div style={{ fontSize: '0.78rem', opacity: 0.9 }}>
                      {settings.khqrBakongId}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setIsCheckoutOpen(false)}>
                {isKh ? 'បោះបង់' : 'Cancel'}
              </button>
              <button
                className="btn btn-success"
                style={{ fontWeight: 800, padding: '12px 24px' }}
                onClick={handleFinishPayment}
              >
                <CheckCircle2 size={18} />
                <span>{isKh ? 'បញ្ជាក់ការបង់ប្រាក់ & ចេញវិក្កយបត្រ' : 'Confirm & Print Receipt'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
