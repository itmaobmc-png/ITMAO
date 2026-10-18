import React from 'react';
import { Moon, Sun, Store, Sparkles } from 'lucide-react';

export default function Header({
  lang,
  theme,
  setTheme,
  settings
}) {
  const isKh = lang === 'km';

  return (
    <header className="topbar no-print">
      <div className="topbar-left">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div className="logo-badge" style={{ width: '38px', height: '38px' }}>
            <Sparkles size={20} />
          </div>
          <div style={{ fontWeight: 900, fontSize: '1.25rem', letterSpacing: '0.04em', lineHeight: 1 }}>
            PIDOR SHOP
          </div>
        </div>

        <div className="page-title" style={{ marginLeft: '18px', paddingLeft: '18px', borderLeft: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Store size={22} style={{ color: '#d97706', flexShrink: 0 }} />
          <span
            style={{
              fontSize: '1.25rem',
              fontWeight: 900,
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 50%, #b45309 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              color: '#d97706',
              letterSpacing: '0.02em',
              lineHeight: 1.2,
              filter: 'drop-shadow(0 1px 1px rgba(217, 119, 6, 0.2))'
            }}
          >
            {isKh ? settings.storeNameKh : settings.storeNameEn}
          </span>
        </div>
      </div>

      <div className="topbar-right">

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
