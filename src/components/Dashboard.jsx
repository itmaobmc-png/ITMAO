import React from 'react';
import {
  DollarSign,
  ShoppingCart,
  Boxes,
  AlertTriangle,
  TrendingUp,
  PackagePlus,
  ArrowUpRight,
  Receipt,
  Layers
} from 'lucide-react';
import { formatUSD, formatKHR, usdToRiel, formatDate } from '../utils/helpers';

export default function Dashboard({
  products,
  sales,
  settings,
  lang,
  setActiveTab,
  onOpenAddProduct,
  onOpenRestock,
  onViewInvoice
}) {
  const isKh = lang === 'km';

  // Calculations
  const totalRevenueUSD = sales.reduce((sum, s) => sum + (s.total || 0), 0);
  const totalRevenueKHR = usdToRiel(totalRevenueUSD, settings.exchangeRate);

  const totalInventoryCost = products.reduce((sum, p) => sum + (p.costPrice * p.stockQty), 0);
  const totalInventoryRetail = products.reduce((sum, p) => sum + (p.sellingPrice * p.stockQty), 0);
  const totalStockUnits = products.reduce((sum, p) => sum + (p.stockQty || 0), 0);

  const lowStockItems = products.filter((p) => p.stockQty > 0 && p.stockQty <= p.minStock);
  const outOfStockItems = products.filter((p) => p.stockQty <= 0);

  // Top selling products count from sales
  const salesMap = {};
  sales.forEach((s) => {
    s.items?.forEach((it) => {
      salesMap[it.id] = (salesMap[it.id] || 0) + it.qty;
    });
  });

  const topProducts = [...products]
    .map((p) => ({ ...p, soldQty: salesMap[p.id] || 0 }))
    .sort((a, b) => b.soldQty - a.soldQty)
    .slice(0, 5);

  const recentSales = [...sales].reverse().slice(0, 5);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Banner / Welcome */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, #4f46e5 0%, #312e81 100%)',
          color: '#ffffff',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
          <div>
            <span style={{ display: 'inline-block', padding: '4px 10px', background: 'rgba(255,255,255,0.18)', borderRadius: '999px', fontSize: '0.78rem', fontWeight: 700, marginBottom: '8px' }}>
              ✨ {isKh ? 'ស្វាគមន៍មកកាន់ប្រព័ន្ធ SmartStok' : 'Welcome to SmartStok'}
            </span>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '6px' }}>
              {isKh ? settings.storeNameKh : settings.storeNameEn}
            </h2>
            <p style={{ opacity: 0.88, fontSize: '0.88rem', maxWidth: '580px' }}>
              {isKh
                ? 'តាមដានស្តុកទំនិញ ចំណូលលក់ គ្រប់គ្រងការនាំចូលស្តុក និងចេញវិក្កយបត្រស្កេន KHQR យ៉ាងរហ័ស និងមានប្រសិទ្ធភាពខ្ពស់។'
                : 'Real-time inventory tracking, multi-currency POS sales, KHQR receipts, and comprehensive analytics.'}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              className="btn"
              onClick={() => setActiveTab('pos')}
              style={{ background: '#ffffff', color: '#4f46e5', fontWeight: 700, boxShadow: '0 4px 14px rgba(0,0,0,0.15)' }}
            >
              <ShoppingCart size={18} />
              <span>{isKh ? 'បើកប្រព័ន្ធលក់ POS' : 'Open POS Checkout'}</span>
            </button>
            <button
              className="btn"
              onClick={onOpenAddProduct}
              style={{ background: 'rgba(255,255,255,0.18)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.3)' }}
            >
              <PackagePlus size={18} />
              <span>{isKh ? 'ថែមទំនិញថ្មី' : 'Add Product'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="kpi-grid">
        {/* Total Revenue */}
        <div className="kpi-card">
          <div>
            <div className="kpi-title">{isKh ? 'ចំណូលសរុប (Revenue)' : 'Total Revenue'}</div>
            <div className="kpi-value">{formatUSD(totalRevenueUSD)}</div>
            <div className="kpi-sub" style={{ color: 'var(--primary)', fontWeight: 700 }}>
              ≈ {formatKHR(totalRevenueKHR)}
            </div>
          </div>
          <div className="kpi-icon-wrap" style={{ background: 'var(--success-light)', color: 'var(--success)' }}>
            <DollarSign size={26} />
          </div>
        </div>

        {/* Total Sales Orders */}
        <div className="kpi-card">
          <div>
            <div className="kpi-title">{isKh ? 'ចំនួនការលក់សរុប' : 'Total Sales Orders'}</div>
            <div className="kpi-value">{sales.length}</div>
            <div className="kpi-sub" style={{ color: 'var(--success)', fontWeight: 600 }}>
              <TrendingUp size={13} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '3px' }} />
              {isKh ? 'វិក្កយបត្របានបញ្ចប់' : 'Completed Invoices'}
            </div>
          </div>
          <div className="kpi-icon-wrap" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
            <Receipt size={26} />
          </div>
        </div>

        {/* Total Products & Units */}
        <div className="kpi-card">
          <div>
            <div className="kpi-title">{isKh ? 'មុខទំនិញ / ចំនួនក្នុងស្តុក' : 'Catalog / Stock Units'}</div>
            <div className="kpi-value">{products.length} <span style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--text-muted)' }}>{isKh ? 'មុខ' : 'items'}</span></div>
            <div className="kpi-sub">
              {isKh ? `សរុប ${totalStockUnits.toLocaleString()} ឯកតាក្នុងស្តុក` : `Total ${totalStockUnits.toLocaleString()} units in stock`}
            </div>
          </div>
          <div className="kpi-icon-wrap" style={{ background: 'var(--secondary-light)', color: 'var(--secondary)' }}>
            <Boxes size={26} />
          </div>
        </div>

        {/* Inventory Value Asset */}
        <div className="kpi-card">
          <div>
            <div className="kpi-title">{isKh ? 'តម្លៃទុនស្តុក (Asset Value)' : 'Inventory Capital Value'}</div>
            <div className="kpi-value">{formatUSD(totalInventoryCost)}</div>
            <div className="kpi-sub" style={{ color: 'var(--text-muted)' }}>
              {isKh ? `តម្លៃលក់: ${formatUSD(totalInventoryRetail)}` : `Retail: ${formatUSD(totalInventoryRetail)}`}
            </div>
          </div>
          <div className="kpi-icon-wrap" style={{ background: 'rgba(139, 92, 246, 0.12)', color: '#8b5cf6' }}>
            <Layers size={26} />
          </div>
        </div>
      </div>

      {/* Row: Low Stock Alerts + Top Selling */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
        {/* Low Stock Alerts */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ color: 'var(--warning)', background: 'var(--warning-light)', padding: '6px', borderRadius: '8px' }}>
                <AlertTriangle size={20} />
              </div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800 }}>
                {isKh ? 'ទំនិញជិតអស់ពីស្តុក' : 'Low Stock Warnings'}
              </h3>
            </div>
            <span className="badge-tag warning">
              {lowStockItems.length + outOfStockItems.length} {isKh ? 'មុខ' : 'items'}
            </span>
          </div>

          {lowStockItems.length === 0 && outOfStockItems.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
              🎉 {isKh ? 'ស្តុកទំនិញទាំងអស់មានបរិមាណគ្រប់គ្រាន់!' : 'All products have healthy stock levels!'}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[...outOfStockItems, ...lowStockItems].map((item) => {
                const isZero = item.stockQty <= 0;
                return (
                  <div
                    key={item.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      background: 'var(--bg-card-subtle)',
                      borderRadius: 'var(--radius-md)',
                      borderLeft: `4px solid ${isZero ? 'var(--danger)' : 'var(--warning)'}`
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0, marginRight: '10px' }}>
                      <div style={{ fontWeight: 700, fontSize: '0.88rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {isKh ? item.nameKh : item.nameEn}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        {item.category} • {isKh ? 'កម្រិតប្រកាសអាសន្ន' : 'Min alert'}: {item.minStock} {item.unit}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span
                        className={`badge-tag ${isZero ? 'danger' : 'warning'}`}
                        style={{ fontSize: '0.8rem', padding: '3px 8px' }}
                      >
                        {isZero ? (isKh ? 'អស់ស្តុក' : 'Out of Stock') : `${item.stockQty} ${item.unit}`}
                      </span>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => onOpenRestock(item)}
                        title={isKh ? 'នាំចូលស្តុកបន្ថែម' : 'Restock item'}
                      >
                        <span>{isKh ? 'នាំចូល' : 'Restock'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Top Selling Products */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ color: 'var(--primary)', background: 'var(--primary-light)', padding: '6px', borderRadius: '8px' }}>
                <TrendingUp size={20} />
              </div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800 }}>
                {isKh ? 'ទំនិញលក់ដាច់បំផុត' : 'Top Selling Products'}
              </h3>
            </div>
            <button
              className="control-btn"
              onClick={() => setActiveTab('sales')}
              style={{ fontSize: '0.78rem', padding: '4px 10px' }}
            >
              <span>{isKh ? 'មើលទាំងអស់' : 'View All'}</span>
              <ArrowUpRight size={14} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {topProducts.map((item, index) => (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-card-subtle)'
                }}
              >
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: index === 0 ? '#f59e0b' : index === 1 ? '#94a3b8' : index === 2 ? '#b45309' : 'var(--bg-hover)',
                    color: index < 3 ? '#ffffff' : 'var(--text-main)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '0.8rem',
                    flexShrink: 0
                  }}
                >
                  {index + 1}
                </div>

                <div style={{ fontSize: '1.5rem', lineHeight: 1 }}>{item.emoji || '📦'}</div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.88rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {isKh ? item.nameKh : item.nameEn}
                  </div>
                  <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                    {formatUSD(item.sellingPrice)} / {item.unit}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '0.92rem' }}>
                    {item.soldQty} {item.unit}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    {isKh ? 'បានលក់ចេញ' : 'Sold'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Sales History */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ color: 'var(--success)', background: 'var(--success-light)', padding: '6px', borderRadius: '8px' }}>
              <Receipt size={20} />
            </div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800 }}>
              {isKh ? 'ប្រតិបត្តិការលក់ថ្មីៗ' : 'Recent Sales Transactions'}
            </h3>
          </div>
          <button
            className="control-btn"
            onClick={() => setActiveTab('sales')}
            style={{ fontSize: '0.78rem', padding: '4px 10px' }}
          >
            <span>{isKh ? 'មើលប្រវត្តិទាំងអស់' : 'View Full History'}</span>
            <ArrowUpRight size={14} />
          </button>
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>{isKh ? 'លេខវិក្កយបត្រ' : 'Invoice #'}</th>
                <th>{isKh ? 'កាលបរិច្ឆេទ' : 'Date'}</th>
                <th>{isKh ? 'អតិថិជន' : 'Customer'}</th>
                <th>{isKh ? 'ទំនិញ' : 'Items'}</th>
                <th>{isKh ? 'វិធីទូទាត់' : 'Payment'}</th>
                <th>{isKh ? 'សរុប ($)' : 'Total ($)'}</th>
                <th>{isKh ? 'សកម្មភាព' : 'Action'}</th>
              </tr>
            </thead>
            <tbody>
              {recentSales.map((s) => (
                <tr key={s.id}>
                  <td style={{ fontWeight: 700, color: 'var(--primary)' }}>{s.id}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{formatDate(s.date, lang)}</td>
                  <td>{s.customer || 'អតិថិជនទូទៅ'}</td>
                  <td>
                    {s.items?.length || 0} {isKh ? 'មុខ' : 'items'}
                  </td>
                  <td>
                    <span className={`badge-tag ${s.paymentMethod === 'KHQR' ? 'danger' : 'success'}`}>
                      {s.paymentMethod}
                    </span>
                  </td>
                  <td style={{ fontWeight: 800 }}>
                    {formatUSD(s.total)}
                    <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                      {formatKHR(s.totalRiel || usdToRiel(s.total, settings.exchangeRate))}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => onViewInvoice(s)}
                      title={isKh ? 'មើលវិក្កយបត្រ' : 'View Receipt'}
                    >
                      <Receipt size={14} />
                      <span>{isKh ? 'វិក្កយបត្រ' : 'Receipt'}</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
