import React from 'react';
import { Printer, X, CheckCircle2, QrCode } from 'lucide-react';
import { formatUSD, formatKHR, formatDate } from '../utils/helpers';

export default function ReceiptModal({ invoice, settings, lang, onClose }) {
  if (!invoice) return null;
  const isKh = lang === 'km';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '420px', padding: '16px' }}
      >
        <div className="modal-header no-print" style={{ padding: '8px 0 16px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={20} style={{ color: 'var(--success)' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>
              {isKh ? 'វិក្កយបត្រទូទាត់ប្រាក់' : 'Payment Receipt'}
            </h3>
          </div>
          <button className="control-btn" style={{ padding: '6px' }} onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Printable 80mm POS Thermal Receipt */}
        <div className="receipt-wrapper printable-area">
          <div className="receipt-header">
            <div className="receipt-title">{settings.storeNameKh}</div>
            <div style={{ fontSize: '0.85rem', color: '#4b5563', fontWeight: 600 }}>
              {settings.storeNameEn}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '4px' }}>
              {settings.address}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
              Tel: {settings.phone}
            </div>
          </div>

          {/* Invoice Meta */}
          <div style={{ fontSize: '0.78rem', marginBottom: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
              <span style={{ color: '#6b7280' }}>{isKh ? 'លេខវិក្កយបត្រ:' : 'Invoice No:'}</span>
              <span style={{ fontWeight: 800 }}>{invoice.id}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
              <span style={{ color: '#6b7280' }}>{isKh ? 'កាលបរិច្ឆេទ:' : 'Date:'}</span>
              <span>{formatDate(invoice.date, 'km')}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
              <span style={{ color: '#6b7280' }}>{isKh ? 'អ្នកគិតលុយ:' : 'Cashier:'}</span>
              <span>{invoice.cashier || 'Cashier'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#6b7280' }}>{isKh ? 'អតិថិជន:' : 'Customer:'}</span>
              <span>{invoice.customer || 'អតិថិជនទូទៅ'}</span>
            </div>
          </div>

          <div className="receipt-divider" />

          {/* Itemized list */}
          <div style={{ marginBottom: '12px' }}>
            {invoice.items?.map((item, idx) => (
              <div key={idx} style={{ marginBottom: '8px' }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 700 }}>
                  {item.nameKh || item.nameEn}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#4b5563' }}>
                  <span>
                    {item.qty} × {formatUSD(item.price)}
                  </span>
                  <span style={{ fontWeight: 700, color: '#111827' }}>
                    {formatUSD(item.total || item.price * item.qty)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="receipt-divider" />

          {/* Financial Breakdown */}
          <div style={{ fontSize: '0.82rem' }}>
            <div className="receipt-item-row">
              <span style={{ color: '#6b7280' }}>{isKh ? 'សរុបរង (Subtotal):' : 'Subtotal:'}</span>
              <span style={{ fontWeight: 700 }}>{formatUSD(invoice.subtotal)}</span>
            </div>

            {invoice.discount > 0 && (
              <div className="receipt-item-row" style={{ color: '#dc2626' }}>
                <span>{isKh ? 'បញ្ចុះតម្លៃ (Discount):' : 'Discount:'}</span>
                <span>-{formatUSD(invoice.discount)}</span>
              </div>
            )}

            <div
              className="receipt-item-row"
              style={{ fontSize: '1.1rem', fontWeight: 900, marginTop: '8px', borderTop: '1px dashed #9ca3af', paddingTop: '6px' }}
            >
              <span>{isKh ? 'សរុបត្រូវបង់:' : 'TOTAL:'}</span>
              <span>{formatUSD(invoice.total)}</span>
            </div>

            <div style={{ textAlign: 'right', fontWeight: 800, fontSize: '0.9rem', color: '#4f46e5', marginBottom: '8px' }}>
              {formatKHR(invoice.totalRiel)}
            </div>

            {/* Payment details */}
            <div style={{ borderTop: '1px dashed #9ca3af', paddingTop: '6px', fontSize: '0.78rem' }}>
              <div className="receipt-item-row">
                <span style={{ color: '#6b7280' }}>{isKh ? 'វិធីទូទាត់:' : 'Payment:'}</span>
                <span style={{ fontWeight: 800 }}>
                  {invoice.paymentMethod === 'KHQR' ? '📱 KHQR Bakong' : '💵 CASH (លុយសុទ្ធ)'}
                </span>
              </div>

              {invoice.paymentMethod === 'CASH' && (
                <>
                  <div className="receipt-item-row">
                    <span style={{ color: '#6b7280' }}>{isKh ? 'ប្រាក់ទទួល:' : 'Cash Received:'}</span>
                    <span>{formatUSD(invoice.cashReceived || invoice.total)}</span>
                  </div>
                  <div className="receipt-item-row" style={{ fontWeight: 800, color: '#059669' }}>
                    <span>{isKh ? 'ប្រាក់អាប់ជូន:' : 'Change:'}</span>
                    <span>
                      {formatUSD(invoice.cashChange || 0)} ({formatKHR(invoice.cashChangeRiel || 0)})
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="receipt-divider" />

          {/* Footer Note */}
          <div style={{ textAlign: 'center', fontSize: '0.74rem', color: '#6b7280' }}>
            <div style={{ fontWeight: 700, color: '#111827', marginBottom: '2px' }}>
              {settings.receiptFooterKh}
            </div>
            <div>{settings.receiptFooterEn}</div>
            <div style={{ marginTop: '8px', fontSize: '0.68rem', opacity: 0.8 }}>
              Powered by SmartStok System
            </div>
          </div>
        </div>

        {/* Modal Buttons */}
        <div className="modal-footer no-print" style={{ padding: '16px 0 0 0', background: 'transparent' }}>
          <button className="btn btn-secondary" onClick={onClose}>
            {isKh ? 'បិទ' : 'Close'}
          </button>
          <button className="btn btn-primary" onClick={handlePrint} style={{ fontWeight: 800 }}>
            <Printer size={18} />
            <span>{isKh ? 'បោះពុម្ពវិក្កយបត្រ (Print)' : 'Print Receipt'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
