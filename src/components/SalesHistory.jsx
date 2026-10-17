import React, { useState } from 'react';
import {
  Search,
  Receipt,
  FileSpreadsheet,
  Trash2,
  Calendar,
  CreditCard,
  Banknote,
  QrCode,
  ArrowUpDown
} from 'lucide-react';
import { formatUSD, formatKHR, usdToRiel, formatDate } from '../utils/helpers';

export default function SalesHistory({
  sales,
  setSales,
  settings,
  lang,
  onViewInvoice
}) {
  const isKh = lang === 'km';

  const [searchQuery, setSearchQuery] = useState('');
  const [filterPayment, setFilterPayment] = useState('ALL');
  const [filterPeriod, setFilterPeriod] = useState('ALL'); // ALL, TODAY, WEEK, MONTH

  // Filter Sales
  const filteredSales = sales.filter((s) => {
    // Payment filter
    if (filterPayment !== 'ALL' && s.paymentMethod !== filterPayment) return false;

    // Period filter
    const saleDate = new Date(s.date);
    const now = new Date();
    if (filterPeriod === 'TODAY') {
      const isToday =
        saleDate.getDate() === now.getDate() &&
        saleDate.getMonth() === now.getMonth() &&
        saleDate.getFullYear() === now.getFullYear();
      if (!isToday) return false;
    } else if (filterPeriod === 'WEEK') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      if (saleDate < weekAgo) return false;
    } else if (filterPeriod === 'MONTH') {
      const isMonth =
        saleDate.getMonth() === now.getMonth() &&
        saleDate.getFullYear() === now.getFullYear();
      if (!isMonth) return false;
    }

    // Search query
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;

    return (
      s.id?.toLowerCase().includes(q) ||
      s.customer?.toLowerCase().includes(q) ||
      s.cashier?.toLowerCase().includes(q) ||
      s.items?.some((it) => it.nameKh?.toLowerCase().includes(q) || it.nameEn?.toLowerCase().includes(q))
    );
  });

  // Analytics
  const totalSalesUSD = filteredSales.reduce((sum, s) => sum + (s.total || 0), 0);
  const totalSalesKHR = usdToRiel(totalSalesUSD, settings.exchangeRate);

  const cashSalesTotal = filteredSales
    .filter((s) => s.paymentMethod === 'CASH')
    .reduce((sum, s) => sum + (s.total || 0), 0);

  const khqrSalesTotal = filteredSales
    .filter((s) => s.paymentMethod === 'KHQR')
    .reduce((sum, s) => sum + (s.total || 0), 0);

  // Delete invoice
  const handleDeleteSale = (id) => {
    if (window.confirm(isKh ? `តើអ្នកពិតជាចង់លុបវិក្កយបត្រ ${id} នេះមែនទេ?` : `Are you sure you want to delete invoice ${id}?`)) {
      setSales((prev) => prev.filter((s) => s.id !== id));
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* KPI Cards for Sales */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div>
            <div className="kpi-title">{isKh ? 'ចំណូលលក់សរុប (Total Sales)' : 'Total Sales Amount'}</div>
            <div className="kpi-value">{formatUSD(totalSalesUSD)}</div>
            <div className="kpi-sub" style={{ color: 'var(--primary)', fontWeight: 700 }}>
              ≈ {formatKHR(totalSalesKHR)}
            </div>
          </div>
          <div className="kpi-icon-wrap" style={{ background: 'var(--success-light)', color: 'var(--success)' }}>
            <Receipt size={26} />
          </div>
        </div>

        <div className="kpi-card">
          <div>
            <div className="kpi-title">{isKh ? 'ចំណូលលុយសុទ្ធ (Cash)' : 'Cash Payments'}</div>
            <div className="kpi-value">{formatUSD(cashSalesTotal)}</div>
            <div className="kpi-sub" style={{ color: 'var(--text-muted)' }}>
              {filteredSales.filter((s) => s.paymentMethod === 'CASH').length} {isKh ? 'ប្រតិបត្តិការ' : 'transactions'}
            </div>
          </div>
          <div className="kpi-icon-wrap" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
            <Banknote size={26} />
          </div>
        </div>

        <div className="kpi-card">
          <div>
            <div className="kpi-title">{isKh ? 'ស្កេន KHQR (Bakong)' : 'KHQR Bakong Payments'}</div>
            <div className="kpi-value">{formatUSD(khqrSalesTotal)}</div>
            <div className="kpi-sub" style={{ color: 'var(--text-muted)' }}>
              {filteredSales.filter((s) => s.paymentMethod === 'KHQR').length} {isKh ? 'ប្រតិបត្តិការ' : 'transactions'}
            </div>
          </div>
          <div className="kpi-icon-wrap" style={{ background: 'rgba(225, 29, 72, 0.12)', color: '#e11d48' }}>
            <QrCode size={26} />
          </div>
        </div>

        <div className="kpi-card">
          <div>
            <div className="kpi-title">{isKh ? 'ចំនួនវិក្កយបត្រសរុប' : 'Total Invoices'}</div>
            <div className="kpi-value">{filteredSales.length}</div>
            <div className="kpi-sub" style={{ color: 'var(--success)', fontWeight: 600 }}>
              {isKh ? 'ការទូទាត់ជោគជ័យ 100%' : '100% Completed'}
            </div>
          </div>
          <div className="kpi-icon-wrap" style={{ background: 'var(--secondary-light)', color: 'var(--secondary)' }}>
            <FileSpreadsheet size={26} />
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="card" style={{ padding: '16px 20px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', alignItems: 'center', justifyContent: 'space-between' }}>
          <div className="search-box">
            <Search className="search-icon" size={18} />
            <input
              type="text"
              className="input-field"
              placeholder={isKh ? 'ស្វែងរកលេខវិក្កយបត្រ, អតិថិជន...' : 'Search invoice ID, customer...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {/* Period Filters */}
            <button
              className={`category-pill ${filterPeriod === 'ALL' ? 'active' : ''}`}
              onClick={() => setFilterPeriod('ALL')}
            >
              {isKh ? 'ទាំងអស់' : 'All Time'}
            </button>
            <button
              className={`category-pill ${filterPeriod === 'TODAY' ? 'active' : ''}`}
              onClick={() => setFilterPeriod('TODAY')}
            >
              {isKh ? 'ថ្ងៃនេះ' : 'Today'}
            </button>
            <button
              className={`category-pill ${filterPeriod === 'WEEK' ? 'active' : ''}`}
              onClick={() => setFilterPeriod('WEEK')}
            >
              {isKh ? '7 ថ្ងៃចុងក្រោយ' : 'Last 7 Days'}
            </button>
            <button
              className={`category-pill ${filterPeriod === 'MONTH' ? 'active' : ''}`}
              onClick={() => setFilterPeriod('MONTH')}
            >
              {isKh ? 'ខែនេះ' : 'This Month'}
            </button>

            {/* Payment Method Filters */}
            <div style={{ borderLeft: '1px solid var(--border-subtle)', marginLeft: '6px', paddingLeft: '6px', display: 'flex', gap: '8px' }}>
              <button
                className={`category-pill ${filterPayment === 'CASH' ? 'active' : ''}`}
                onClick={() => setFilterPayment(filterPayment === 'CASH' ? 'ALL' : 'CASH')}
              >
                💵 {isKh ? 'លុយសុទ្ធ' : 'Cash'}
              </button>
              <button
                className={`category-pill ${filterPayment === 'KHQR' ? 'active' : ''}`}
                onClick={() => setFilterPayment(filterPayment === 'KHQR' ? 'ALL' : 'KHQR')}
              >
                📱 KHQR
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Sales Invoices Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>{isKh ? 'លេខវិក្កយបត្រ' : 'Invoice #'}</th>
                <th>{isKh ? 'កាលបរិច្ឆេទ' : 'Date & Time'}</th>
                <th>{isKh ? 'អតិថិជន' : 'Customer'}</th>
                <th>{isKh ? 'មុខទំនិញដែលបានទិញ' : 'Items Purchased'}</th>
                <th>{isKh ? 'វិធីទូទាត់' : 'Payment'}</th>
                <th>{isKh ? 'បញ្ចុះតម្លៃ' : 'Discount'}</th>
                <th>{isKh ? 'សរុបបង់ ($)' : 'Total ($)'}</th>
                <th>{isKh ? 'អ្នកគិតលុយ' : 'Cashier'}</th>
                <th style={{ textAlign: 'right' }}>{isKh ? 'សកម្មភាព' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody>
              {filteredSales.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                    📄 {isKh ? 'មិនមានប្រវត្តិការលក់ត្រូវតាមលក្ខខណ្ឌនេះទេ!' : 'No sales records found!'}
                  </td>
                </tr>
              ) : (
                filteredSales.map((s) => (
                  <tr key={s.id}>
                    <td style={{ fontWeight: 800, color: 'var(--primary)', fontFamily: 'monospace' }}>
                      {s.id}
                    </td>

                    <td style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                      {formatDate(s.date, lang)}
                    </td>

                    <td style={{ fontWeight: 600 }}>{s.customer || 'អតិថិជនទូទៅ'}</td>

                    <td>
                      <div style={{ fontSize: '0.82rem' }}>
                        {s.items?.map((it, idx) => (
                          <span key={idx} style={{ display: 'inline-block', marginRight: '6px' }}>
                            {isKh ? it.nameKh : it.nameEn} <b style={{ color: 'var(--primary)' }}>×{it.qty}</b>
                            {idx < s.items.length - 1 ? ',' : ''}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td>
                      <span className={`badge-tag ${s.paymentMethod === 'KHQR' ? 'danger' : 'success'}`}>
                        {s.paymentMethod}
                      </span>
                    </td>

                    <td style={{ color: s.discount > 0 ? 'var(--danger)' : 'var(--text-muted)' }}>
                      {s.discount > 0 ? `-${formatUSD(s.discount)}` : '$0.00'}
                    </td>

                    <td>
                      <div style={{ fontWeight: 900, fontSize: '0.95rem' }}>
                        {formatUSD(s.total)}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                        {formatKHR(s.totalRiel || usdToRiel(s.total, settings.exchangeRate))}
                      </div>
                    </td>

                    <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                      {s.cashier || 'Cashier'}
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => onViewInvoice(s)}
                          title={isKh ? 'មើល ឬ បោះពុម្ពវិក្កយបត្រ' : 'View / Print receipt'}
                        >
                          <Receipt size={14} />
                          <span>{isKh ? 'វិក្កយបត្រ' : 'Receipt'}</span>
                        </button>

                        <button
                          className="control-btn"
                          style={{ padding: '6px 8px', color: 'var(--danger)' }}
                          onClick={() => handleDeleteSale(s.id)}
                          title={isKh ? 'លុប' : 'Delete'}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
