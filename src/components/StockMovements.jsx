import React, { useState } from 'react';
import {
  ArrowDownUp,
  Search,
  ArrowDownLeft,
  ArrowUpRight,
  Boxes,
  PlusCircle,
  FileText
} from 'lucide-react';
import { formatUSD, formatDate } from '../utils/helpers';

export default function StockMovements({
  movements,
  lang,
  onOpenRestockDirect
}) {
  const isKh = lang === 'km';
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');

  const filteredMovements = movements.filter((m) => {
    if (typeFilter !== 'ALL' && m.type !== typeFilter) return false;
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      m.productName?.toLowerCase().includes(q) ||
      m.supplier?.toLowerCase().includes(q) ||
      m.id?.toLowerCase().includes(q) ||
      m.notes?.toLowerCase().includes(q)
    );
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Banner */}
      <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <ArrowDownUp size={22} style={{ color: 'var(--primary)' }} />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>
              {isKh ? 'កំណត់ត្រានាំចូលស្តុក & ចលនាទំនិញ' : 'Stock In & Inventory Movements'}
            </h2>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            {isKh ? 'តាមដានប្រវត្តិការនាំទំនិញចូលស្តុក ការផ្គត់ផ្គង់ និងការកែសម្រួលស្តុកលម្អិត' : 'Audit logs of restocks, inventory shipments, and stock adjustments'}
          </p>
        </div>

        <button className="btn btn-primary" onClick={onOpenRestockDirect}>
          <PlusCircle size={18} />
          <span>{isKh ? 'នាំចូលស្តុកថ្មី (Stock In)' : 'New Stock In'}</span>
        </button>
      </div>

      {/* Filter toolbar */}
      <div className="card" style={{ padding: '16px 20px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', alignItems: 'center', justifyContent: 'space-between' }}>
          <div className="search-box">
            <Search className="search-icon" size={18} />
            <input
              type="text"
              className="input-field"
              placeholder={isKh ? 'ស្វែងរកតាមទំនិញ, អ្នកផ្គត់ផ្គង់...' : 'Search product or supplier...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              className={`category-pill ${typeFilter === 'ALL' ? 'active' : ''}`}
              onClick={() => setTypeFilter('ALL')}
            >
              {isKh ? 'ទាំងអស់' : 'All'} ({movements.length})
            </button>
            <button
              className={`category-pill ${typeFilter === 'RESTOCK_IN' ? 'active' : ''}`}
              onClick={() => setTypeFilter('RESTOCK_IN')}
            >
              📥 {isKh ? 'នាំចូលបន្ថែម' : 'Restock In'}
            </button>
            <button
              className={`category-pill ${typeFilter === 'SALE_OUT' ? 'active' : ''}`}
              onClick={() => setTypeFilter('SALE_OUT')}
            >
              📤 {isKh ? 'លក់ចេញ (POS)' : 'Sale Out'}
            </button>
            <button
              className={`category-pill ${typeFilter === 'INITIAL_STOCK' ? 'active' : ''}`}
              onClick={() => setTypeFilter('INITIAL_STOCK')}
            >
              📦 {isKh ? 'ស្តុកដំបូង' : 'Initial Stock'}
            </button>
          </div>
        </div>
      </div>

      {/* Movements Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>{isKh ? 'លេខកូដប្រតិបត្តិការ' : 'Movement ID'}</th>
                <th>{isKh ? 'កាលបរិច្ឆេទ' : 'Date & Time'}</th>
                <th>{isKh ? 'ទំនិញ' : 'Product'}</th>
                <th>{isKh ? 'ប្រភេទចលនា' : 'Movement Type'}</th>
                <th>{isKh ? 'បរិមាណ' : 'Quantity'}</th>
                <th>{isKh ? 'ថ្លៃដើម/ឯកតា' : 'Unit Cost'}</th>
                <th>{isKh ? 'តម្លៃសរុប' : 'Total Cost'}</th>
                <th>{isKh ? 'អ្នកផ្គត់ផ្គង់ / ចំណាំ' : 'Supplier / Note'}</th>
              </tr>
            </thead>
            <tbody>
              {filteredMovements.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                    📦 {isKh ? 'មិនទាន់មានកំណត់ត្រានាំចូលស្តុកទេ!' : 'No stock movements recorded!'}
                  </td>
                </tr>
              ) : (
                filteredMovements.map((m) => {
                  const isIn = m.quantity > 0;
                  return (
                    <tr key={m.id}>
                      <td style={{ fontWeight: 700, fontFamily: 'monospace', color: 'var(--primary)' }}>
                        {m.id}
                      </td>

                      <td style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                        {formatDate(m.date, lang)}
                      </td>

                      <td style={{ fontWeight: 700 }}>{m.productName}</td>

                      <td>
                        <span
                          className={`badge-tag ${
                            m.type === 'RESTOCK_IN'
                              ? 'success'
                              : m.type === 'SALE_OUT'
                              ? 'primary'
                              : 'warning'
                          }`}
                        >
                          {m.type === 'RESTOCK_IN'
                            ? isKh ? 'នាំចូលស្តុក' : 'Restock In'
                            : m.type === 'SALE_OUT'
                            ? isKh ? 'លក់ចេញ' : 'Sale Out'
                            : isKh ? 'ស្តុកដំបូង' : 'Initial Stock'}
                        </span>
                      </td>

                      <td>
                        <span
                          style={{
                            fontWeight: 800,
                            fontSize: '0.95rem',
                            color: isIn ? 'var(--success)' : 'var(--danger)'
                          }}
                        >
                          {isIn ? `+${m.quantity}` : m.quantity}
                        </span>
                      </td>

                      <td>{m.costPrice ? formatUSD(m.costPrice) : '-'}</td>

                      <td style={{ fontWeight: 700 }}>
                        {m.costPrice ? formatUSD(m.costPrice * Math.abs(m.quantity)) : '-'}
                      </td>

                      <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                        <div>{m.supplier || '-'}</div>
                        {m.notes && <div style={{ fontSize: '0.74rem', opacity: 0.8 }}>({m.notes})</div>}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
