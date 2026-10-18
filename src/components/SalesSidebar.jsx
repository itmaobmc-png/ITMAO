import React, { useState } from 'react';
import {
  Plus,
  ShoppingBag,
  Trash2,
  Minus,
  Plus as PlusIcon,
  X,
  CheckCircle2,
  QrCode,
  Banknote,
  DollarSign
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { formatKHR, playSuccessSound, playBeep } from '../utils/helpers';

export default function SalesSidebar({
  cart,
  setCart,
  settings,
  lang,
  onOpenAddProduct,
  onCompleteSale
}) {
  const isKh = lang === 'km';

  // Checkout Modal State
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('CASH'); // 'CASH' or 'KHQR'
  const [cashReceived, setCashReceived] = useState('');
  const [customerName, setCustomerName] = useState('');

  // Cart Calculations
  const cartTotalQty = cart.reduce((sum, item) => sum + item.qty, 0);
  const cartSubtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const cartTotal = cartSubtotal;

  // Quantity updates
  const handleUpdateQty = (productId, delta) => {
    playBeep();
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === productId) {
            const newQty = item.qty + delta;
            if (newQty <= 0) return null;
            if (item.stockQty !== undefined && newQty > item.stockQty) {
              alert(isKh ? `ស្តុកនៅសល់ត្រឹមតែ ${item.stockQty} ${item.unit || ''} ប៉ុណ្ណោះ!` : `Only ${item.stockQty} left in stock!`);
              return item;
            }
            return { ...item, qty: newQty };
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const handleRemoveItem = (productId) => {
    setCart((prev) => prev.filter((item) => item.id !== productId));
  };

  const handleClearCart = () => {
    if (cart.length === 0) return;
    if (window.confirm(isKh ? 'តើអ្នកចង់លុបទំនិញទាំងអស់ចេញពីកន្ត្រកមែនទេ?' : 'Clear all items from cart?')) {
      setCart([]);
    }
  };

  // Open Checkout
  const handleOpenCheckout = () => {
    if (cart.length === 0) return;
    setCashReceived(cartTotal.toString());
    setIsCheckoutOpen(true);
  };

  // Confirm Sale & Generate Receipt
  const handleConfirmSale = () => {
    const receivedNum = paymentMethod === 'CASH' ? parseFloat(cashReceived) || cartTotal : cartTotal;

    if (paymentMethod === 'CASH' && receivedNum < cartTotal) {
      alert(isKh ? 'ប្រាក់ទទួលពីអតិថិជនមិនទាន់គ្រប់ចំនួនត្រូវបង់ទេ!' : 'Received cash is less than total amount!');
      return;
    }

    const changeDue = Math.max(0, receivedNum - cartTotal);

    const newSale = {
      id: `INV-${Date.now().toString().slice(-6)}`,
      date: new Date().toISOString(),
      items: cart.map((it) => ({
        id: it.id,
        nameKh: it.nameKh,
        nameEn: it.nameEn || it.nameKh,
        price: it.price,
        qty: it.qty,
        unit: it.unit || 'កំប៉ុង',
        total: it.price * it.qty,
        costPrice: it.costPrice || 0
      })),
      subtotal: cartSubtotal,
      discount: 0,
      total: cartTotal,
      totalRiel: cartTotal,
      paymentMethod,
      cashReceived: receivedNum,
      cashChange: changeDue,
      cashier: 'បុគ្គលិក (Staff)',
      customer: customerName || (isKh ? 'អតិថិជនទូទៅ' : 'Walk-in Customer'),
      status: 'COMPLETED'
    };

    // Confetti & Sound
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 }
      });
      playSuccessSound();
    } catch {
      // Ignore
    }

    onCompleteSale(newSale);
    setCart([]);
    setIsCheckoutOpen(false);
    setCustomerName('');
  };

  return (
    <div
      style={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        position: 'sticky',
        top: '80px'
      }}
    >
      {/* 1. TOP QUICK ACTION BUTTON: បន្ថែមទំនិញថ្មី */}
      <button
        type="button"
        className="btn btn-primary"
        onClick={onOpenAddProduct}
        style={{
          width: '100%',
          padding: '13px 18px',
          fontWeight: 900,
          fontSize: '1rem',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-md)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px'
        }}
      >
        <Plus size={20} />
        <span>{isKh ? 'បន្ថែមទំនិញថ្មី' : 'Add New Product'}</span>
      </button>

      {/* 2. CART PANEL: ដាក់លក់ចេញ */}
      <div
        className="card"
        style={{
          padding: 0,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 'var(--radius-lg)',
          border: '1.5px solid var(--border-subtle)',
          boxShadow: 'var(--shadow-md)',
          background: 'var(--bg-card)',
          maxHeight: 'calc(100vh - 170px)'
        }}
      >
        {/* Cart Header */}
        <div
          style={{
            padding: '14px 18px',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--bg-card-subtle)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShoppingBag size={18} style={{ color: 'var(--primary)' }} />
            <span style={{ fontWeight: 800, fontSize: '0.98rem' }}>
              {isKh ? 'កន្ត្រកលក់ចេញ' : 'Sales Cart'}
            </span>
            <span
              className="badge-tag primary"
              style={{ fontSize: '0.74rem', padding: '1px 7px', fontWeight: 800 }}
            >
              {cartTotalQty}
            </span>
          </div>

          {cart.length > 0 && (
            <button
              type="button"
              onClick={handleClearCart}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--danger)',
                cursor: 'pointer',
                fontSize: '0.78rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
              title={isKh ? 'លុបទំនិញទាំងអស់' : 'Clear all'}
            >
              <Trash2 size={13} />
              <span>{isKh ? 'សម្អាត' : 'Clear'}</span>
            </button>
          )}
        </div>

        {/* Cart Items List */}
        <div
          style={{
            padding: '12px 16px',
            overflowY: 'auto',
            maxHeight: '340px',
            minHeight: '160px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}
        >
          {cart.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '40px 14px',
                color: 'var(--text-muted)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <span style={{ fontSize: '2.5rem' }}>🛍️</span>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)' }}>
                {isKh ? 'កន្ត្រកទទេស្អាត' : 'Cart is empty'}
              </div>
              <div style={{ fontSize: '0.78rem' }}>
                {isKh ? 'ចុចលើទំនិញខាងឆ្វេងដើម្បីដាក់លក់ចេញ' : 'Click on any product to add to cart'}
              </div>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '8px 10px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg-card-subtle)',
                  border: '1px solid var(--border-subtle)'
                }}
              >
                {/* Thumb */}
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '6px',
                    overflow: 'hidden',
                    background: 'var(--bg-card)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.2rem',
                    flexShrink: 0
                  }}
                >
                  {item.image ? (
                    <img src={item.image} alt={item.nameKh} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span>{item.emoji || '📦'}</span>
                  )}
                </div>

                {/* Details */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}
                  >
                    {item.nameKh}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 800 }}>
                    {formatKHR(item.price)}
                  </div>
                </div>

                {/* Qty Controls */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    background: 'var(--bg-card)',
                    borderRadius: '4px',
                    padding: '2px 4px',
                    border: '1px solid var(--border-subtle)'
                  }}
                >
                  <button
                    type="button"
                    onClick={() => handleUpdateQty(item.id, -1)}
                    style={{
                      width: '20px',
                      height: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'var(--text-main)'
                    }}
                  >
                    <Minus size={12} />
                  </button>
                  <span style={{ fontSize: '0.82rem', fontWeight: 800, minWidth: '18px', textAlign: 'center' }}>
                    {item.qty}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleUpdateQty(item.id, 1)}
                    style={{
                      width: '20px',
                      height: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'var(--text-main)'
                    }}
                  >
                    <PlusIcon size={12} />
                  </button>
                </div>

                {/* Remove */}
                <button
                  type="button"
                  onClick={() => handleRemoveItem(item.id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    padding: '2px'
                  }}
                  title={isKh ? 'ដកចេញ' : 'Remove'}
                >
                  <X size={14} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Cart Summary & ដាក់លក់ចេញ Action */}
        <div
          style={{
            padding: '16px 18px',
            borderTop: '1px solid var(--border-subtle)',
            background: 'var(--bg-card-subtle)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            <span>{isKh ? 'ចំនួនសរុប:' : 'Total Items:'}</span>
            <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>
              {cartTotalQty} {isKh ? 'មុខ' : 'items'}
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderTop: '1px dashed var(--border-strong)',
              paddingTop: '10px',
              marginTop: '8px',
              marginBottom: '14px'
            }}
          >
            <span style={{ fontWeight: 800, fontSize: '0.98rem' }}>{isKh ? 'សរុបត្រូវបង់:' : 'Total:'}</span>
            <span style={{ fontSize: '1.35rem', fontWeight: 900, color: 'var(--primary)' }}>
              {formatKHR(cartTotal)}
            </span>
          </div>

          {/* Big Action Button: ដាក់លក់ចេញ */}
          <button
            type="button"
            className="btn btn-success"
            disabled={cart.length === 0}
            onClick={handleOpenCheckout}
            style={{
              width: '100%',
              padding: '14px 16px',
              fontSize: '1.05rem',
              fontWeight: 900,
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              cursor: cart.length === 0 ? 'not-allowed' : 'pointer',
              opacity: cart.length === 0 ? 0.6 : 1,
              boxShadow: cart.length > 0 ? '0 4px 12px rgba(16, 185, 129, 0.35)' : 'none'
            }}
          >
            <ShoppingBag size={20} />
            <span>{isKh ? 'ដាក់លក់ចេញ (Checkout)' : 'Sell Out (Checkout)'}</span>
          </button>
        </div>
      </div>

      {/* CHECKOUT / ដាក់លក់ចេញ MODAL */}
      {isCheckoutOpen && (
        <div className="modal-overlay" onClick={() => setIsCheckoutOpen(false)} style={{ zIndex: 110 }}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '480px' }}
          >
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShoppingBag size={20} style={{ color: 'var(--primary)' }} />
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>
                  {isKh ? 'ទូទាត់ប្រាក់ & ដាក់លក់ចេញ' : 'Payment & Checkout'}
                </h3>
              </div>
              <button className="control-btn" onClick={() => setIsCheckoutOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {/* Total amount header */}
              <div
                style={{
                  textAlign: 'center',
                  padding: '16px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--primary-light)',
                  border: '1.5px solid var(--primary)'
                }}
              >
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  {isKh ? 'ទឹកប្រាក់ត្រូវទូទាត់សរុប' : 'Total Amount to Pay'}
                </div>
                <div style={{ fontSize: '1.9rem', fontWeight: 900, color: 'var(--primary)', marginTop: '2px' }}>
                  {formatKHR(cartTotal)}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  {cartTotalQty} {isKh ? 'មុខទំនិញក្នុងកន្ត្រក' : 'items in cart'}
                </div>
              </div>

              {/* Customer Name */}
              <div className="input-group">
                <label className="input-label">{isKh ? 'ឈ្មោះអតិថិជន (ជាជម្រើស)' : 'Customer Name (Optional)'}</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder={isKh ? 'អតិថិជនទូទៅ' : 'Walk-in customer'}
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                />
              </div>

              {/* Payment Method Selector */}
              <div>
                <label className="input-label" style={{ marginBottom: '8px' }}>
                  {isKh ? 'ជ្រើសរើសវិធីទូទាត់ប្រាក់' : 'Select Payment Method'}
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('CASH')}
                    className="btn"
                    style={{
                      padding: '12px',
                      borderRadius: 'var(--radius-md)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      fontWeight: 800,
                      background: paymentMethod === 'CASH' ? 'var(--primary-light)' : 'var(--bg-card-subtle)',
                      border: `2px solid ${paymentMethod === 'CASH' ? 'var(--primary)' : 'var(--border-subtle)'}`,
                      color: paymentMethod === 'CASH' ? 'var(--primary)' : 'var(--text-main)'
                    }}
                  >
                    <Banknote size={18} />
                    <span>{isKh ? '💵 លុយសុទ្ធ (Cash)' : 'Cash'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('KHQR')}
                    className="btn"
                    style={{
                      padding: '12px',
                      borderRadius: 'var(--radius-md)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      fontWeight: 800,
                      background: paymentMethod === 'KHQR' ? 'rgba(225, 29, 72, 0.12)' : 'var(--bg-card-subtle)',
                      border: `2px solid ${paymentMethod === 'KHQR' ? '#e11d48' : 'var(--border-subtle)'}`,
                      color: paymentMethod === 'KHQR' ? '#e11d48' : 'var(--text-main)'
                    }}
                  >
                    <QrCode size={18} />
                    <span>{isKh ? '📱 ស្កេន KHQR' : 'KHQR Bakong'}</span>
                  </button>
                </div>
              </div>

              {/* CASH Payment details */}
              {paymentMethod === 'CASH' && (
                <div>
                  <div className="input-group">
                    <label className="input-label">
                      <span>{isKh ? 'ប្រាក់ទទួលពីអតិថិជន (៛)' : 'Cash Received (៛)'}</span>
                    </label>
                    <input
                      type="number"
                      step="500"
                      className="input-field"
                      style={{ fontSize: '1.2rem', fontWeight: 800 }}
                      value={cashReceived}
                      onChange={(e) => setCashReceived(e.target.value)}
                    />
                  </div>

                  {/* Quick Cash Buttons */}
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
                    {[cartTotal, 10000, 20000, 50000, 100000].map((amt, idx) => (
                      <button
                        key={idx}
                        type="button"
                        className="control-btn"
                        style={{ fontSize: '0.78rem', padding: '5px 10px', fontWeight: 700 }}
                        onClick={() => setCashReceived(amt.toString())}
                      >
                        {formatKHR(amt)}
                      </button>
                    ))}
                  </div>

                  {/* Change calculation */}
                  {parseFloat(cashReceived) >= cartTotal && (
                    <div
                      style={{
                        padding: '12px 14px',
                        borderRadius: 'var(--radius-md)',
                        background: 'var(--success-light)',
                        border: '1px solid rgba(16, 185, 129, 0.4)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--success)' }}>
                        {isKh ? 'ប្រាក់អាប់ត្រូវជូនវិញ:' : 'Change Due:'}
                      </span>
                      <span style={{ fontSize: '1.3rem', fontWeight: 900, color: 'var(--success)' }}>
                        {formatKHR(parseFloat(cashReceived) - cartTotal)}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* KHQR Bakong Card */}
              {paymentMethod === 'KHQR' && (
                <div className="khqr-card" style={{ padding: '16px' }}>
                  <div className="khqr-header" style={{ marginBottom: '10px' }}>
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', opacity: 0.9 }}>
                        KHQR Payment
                      </div>
                      <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>
                        {settings.khqrMerchantName || 'PIDOR SHOP'}
                      </div>
                    </div>
                    <div style={{ background: '#fff', color: '#e11d48', padding: '2px 8px', borderRadius: '4px', fontWeight: 900, fontSize: '0.75rem' }}>
                      BAKONG
                    </div>
                  </div>

                  {/* QR SVG Simulation */}
                  <div style={{ background: '#fff', padding: '10px', borderRadius: '8px', display: 'inline-block' }}>
                    <svg width="150" height="150" viewBox="0 0 100 100">
                      <rect width="100" height="100" fill="#ffffff" />
                      <rect x="5" y="5" width="26" height="26" fill="#000000" rx="3" />
                      <rect x="9" y="9" width="18" height="18" fill="#ffffff" rx="2" />
                      <rect x="13" y="13" width="10" height="10" fill="#e11d48" rx="1" />
                      <rect x="69" y="5" width="26" height="26" fill="#000000" rx="3" />
                      <rect x="73" y="9" width="18" height="18" fill="#ffffff" rx="2" />
                      <rect x="77" y="13" width="10" height="10" fill="#e11d48" rx="1" />
                      <rect x="5" y="69" width="26" height="26" fill="#000000" rx="3" />
                      <rect x="9" y="73" width="18" height="18" fill="#ffffff" rx="2" />
                      <rect x="13" y="77" width="10" height="10" fill="#e11d48" rx="1" />
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

                  <div style={{ marginTop: '10px' }}>
                    <div style={{ fontSize: '1.25rem', fontWeight: 900 }}>
                      {formatKHR(cartTotal)}
                    </div>
                    <div style={{ fontSize: '0.74rem', opacity: 0.9 }}>
                      {settings.khqrBakongId || 'pidorshop@acleda'}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setIsCheckoutOpen(false)}>
                {isKh ? 'បោះបង់' : 'Cancel'}
              </button>
              <button
                type="button"
                className="btn btn-success"
                onClick={handleConfirmSale}
                style={{ fontWeight: 800, padding: '12px 20px', gap: '6px' }}
              >
                <CheckCircle2 size={18} />
                <span>{isKh ? 'បញ្ជាក់ការលក់ & ចេញវិក្កយបត្រ' : 'Confirm Sale & Print'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
