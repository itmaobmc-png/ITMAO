import React from 'react';
import {
  LayoutDashboard,
  ShoppingCart,
  Boxes,
  FileText,
  ArrowDownUp,
  Settings,
  Sparkles,
  X
} from 'lucide-react';

export default function Sidebar({
  activeTab,
  setActiveTab,
  lang,
  lowStockCount,
  mobileOpen,
  setMobileOpen
}) {
  const isKh = lang === 'km';

  const menuItems = [
    {
      id: 'dashboard',
      label: isKh ? 'ផ្ទាំងទិន្នន័យទូទៅ' : 'Dashboard',
      icon: LayoutDashboard
    },
    {
      id: 'pos',
      label: isKh ? 'ប្រព័ន្ធគិតលុយ POS' : 'Point of Sale (POS)',
      icon: ShoppingCart,
      isSpecial: true
    },
    {
      id: 'products',
      label: isKh ? 'គ្រប់គ្រងស្តុកទំនិញ' : 'Stock & Products',
      icon: Boxes,
      badge: lowStockCount > 0 ? lowStockCount : null
    },
    {
      id: 'sales',
      label: isKh ? 'ប្រវត្តិការលក់' : 'Sales History',
      icon: FileText
    },
    {
      id: 'movements',
      label: isKh ? 'ប្រវត្តិនាំចូលស្តុក' : 'Stock In Movements',
      icon: ArrowDownUp
    },
    {
      id: 'settings',
      label: isKh ? 'ការកំណត់ប្រព័ន្ធ' : 'Settings',
      icon: Settings
    }
  ];

  const handleSelect = (id) => {
    setActiveTab(id);
    if (setMobileOpen) setMobileOpen(false);
  };

  return (
    <aside className={`sidebar no-print ${mobileOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <div className="logo-badge">
          <Sparkles size={24} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <span className="logo-title">SmartStok</span>
          <span className="logo-subtitle">{isKh ? 'ប្រព័ន្ធស្តុក & លក់ទំនិញ' : 'Stock & POS System'}</span>
        </div>
        {mobileOpen && (
          <button
            className="control-btn mobile-nav-toggle"
            onClick={() => setMobileOpen(false)}
            style={{ padding: '4px' }}
          >
            <X size={18} />
          </button>
        )}
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              className={`nav-link ${isActive ? 'active' : ''}`}
              onClick={() => handleSelect(item.id)}
            >
              <IconComponent size={20} />
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.badge && (
                <span className="badge-count" title={isKh ? `${item.badge} មុខទំនិញជិតអស់` : `${item.badge} items low in stock`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="store-status-card">
          <div className="status-indicator"></div>
          <div style={{ fontSize: '0.78rem', lineHeight: 1.3 }}>
            <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>
              {isKh ? 'ប្រព័ន្ធដំណើរការធម្មតា' : 'System Online'}
            </div>
            <div style={{ color: 'var(--text-muted)' }}>
              {isKh ? 'Vercel Ready ⚡ Cloud Sync' : 'Ready for Vercel ⚡'}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
