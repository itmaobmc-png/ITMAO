import React from 'react';
import { Moon, Sun, Globe, ShoppingCart, Menu, Store, DollarSign } from 'lucide-react';
import { formatKHR } from '../utils/helpers';

export default function Header({
  lang,
  setLang,
  theme,
  setTheme,
  settings,
  cartCount,
  activeTab,
  setActiveTab,
  mobileOpen,
  setMobileOpen
}) {
  const isKh = lang === 'km';

  return (
    <header className="topbar no-print">
      <div className="topbar-left">
        <button
          className="control-btn mobile-nav-toggle"
          onClick={() => setMobileOpen(!mobileOpen)}
          title="Toggle Menu"
          aria-label="Toggle Navigation Menu"
        >
          <Menu size={20} />
        </button>

        <div className="page-title">
          <Store className="text-primary" size={24} style={{ color: 'var(--primary)' }} />
          <span>{isKh ? settings.storeNameKh : settings.storeNameEn}</span>
        </div>

        <div className="badge-tag primary" style={{ display: 'none', lg: 'inline-flex' }}>
          <span>1$ = {formatKHR(settings.exchangeRate)}</span>
        </div>
      </div>

      <div className="topbar-right">
        {/* Quick POS Cart Shortcut if not on POS tab */}
        {activeTab !== 'pos' && (
          <button
            className="btn btn-primary btn-sm"
            onClick={() => setActiveTab('pos')}
            style={{ position: 'relative' }}
          >
            <ShoppingCart size={16} />
            <span>{isKh ? 'ប្រព័ន្ធលក់ POS' : 'Open POS'}</span>
            {cartCount > 0 && (
              <span
                style={{
                  background: 'var(--danger)',
                  color: '#fff',
                  borderRadius: '999px',
                  padding: '1px 6px',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  marginLeft: '4px'
                }}
              >
                {cartCount}
              </span>
            )}
          </button>
        )}

        {/* Currency Rate Indicator */}
        <div
          className="badge-tag"
          style={{ background: 'var(--bg-card-subtle)', border: '1px solid var(--border-subtle)' }}
          title={isKh ? 'អត្រាប្តូរប្រាក់បច្ចុប្បន្ន' : 'Current Exchange Rate'}
        >
          <DollarSign size={14} style={{ color: 'var(--success)' }} />
          <span style={{ fontWeight: 700 }}>1$ = {settings.exchangeRate.toLocaleString()} ៛</span>
        </div>

        {/* Language Switcher */}
        <button
          className="control-btn"
          onClick={() => setLang(isKh ? 'en' : 'km')}
          title={isKh ? 'ប្តូរជាភាសាអង់គ្លេស' : 'Switch to Khmer'}
        >
          <Globe size={16} />
          <span>{isKh ? '🇰🇭 ខ្មែរ' : '🇺🇸 EN'}</span>
        </button>

        {/* Dark / Light Mode Switcher */}
        <button
          className="control-btn"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          aria-label="Toggle Dark/Light Mode"
        >
          {theme === 'dark' ? <Sun size={17} style={{ color: '#f59e0b' }} /> : <Moon size={17} />}
        </button>
      </div>
    </header>
  );
}
