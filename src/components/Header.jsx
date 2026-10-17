import React from 'react';
import { Moon, Sun, Globe, Store, Sparkles } from 'lucide-react';

export default function Header({
  lang,
  setLang,
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
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.05rem', lineHeight: 1.2 }}>
              SmartStok
            </div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
              {isKh ? 'Menu ផលិតផល & តម្លៃ' : 'Products & Prices Menu'}
            </div>
          </div>
        </div>

        <div className="page-title" style={{ marginLeft: '16px', paddingLeft: '16px', borderLeft: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.95rem' }}>
          <Store className="text-primary" size={18} style={{ color: 'var(--primary)' }} />
          <span>{isKh ? settings.storeNameKh : settings.storeNameEn}</span>
        </div>
      </div>

      <div className="topbar-right">
        {/* Currency Indicator - Pure Khmer Riel */}
        <div
          className="badge-tag"
          style={{ background: 'var(--bg-card-subtle)', border: '1px solid var(--border-subtle)', fontWeight: 700 }}
          title={isKh ? 'ប្រព័ន្ធគិតជាប្រាក់រៀលសុទ្ធសាធ' : 'Khmer Riel Currency'}
        >
          <span>🇰🇭 ប្រាក់រៀល (៛)</span>
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
