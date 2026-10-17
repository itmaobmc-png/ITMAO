import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Products from './components/Products';

import {
  INITIAL_PRODUCTS,
  INITIAL_SETTINGS
} from './data/initialData';
import { loadStorage, saveStorage } from './utils/helpers';

export default function App() {
  // Theme & Language
  const [theme, setTheme] = useState(() => loadStorage('smartstok_theme', 'light'));
  const [lang, setLang] = useState(() => loadStorage('smartstok_lang', 'km'));

  // Main Settings
  const [settings, setSettings] = useState(() => {
    const loaded = loadStorage('smartstok_settings', INITIAL_SETTINGS);
    return { ...INITIAL_SETTINGS, ...loaded, currency: 'KHR', currencySymbol: '៛' };
  });

  // Products list in Khmer Riel
  const [products, setProducts] = useState(() => {
    const loaded = loadStorage('smartstok_products', INITIAL_PRODUCTS);
    if (Array.isArray(loaded)) {
      return loaded.map((p) => {
        const { nameEn, category, supplier, ...rest } = p;
        return {
          ...rest,
          costPrice: p.costPrice < 100 ? Math.round((p.costPrice * 4000) / 100) * 100 : p.costPrice,
          sellingPrice: p.sellingPrice < 100 ? Math.round((p.sellingPrice * 4000) / 100) * 100 : p.sellingPrice
        };
      });
    }
    return loaded;
  });

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [restockItemTarget, setRestockItemTarget] = useState(null);

  // Persistence Effects
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    saveStorage('smartstok_theme', theme);
  }, [theme]);

  useEffect(() => {
    saveStorage('smartstok_lang', lang);
  }, [lang]);

  useEffect(() => {
    saveStorage('smartstok_settings', settings);
  }, [settings]);

  useEffect(() => {
    saveStorage('smartstok_products', products);
  }, [products]);

  return (
    <div className="app-container">
      {/* Main Full-Width Content Wrapper */}
      <div className="main-wrapper" style={{ width: '100%', minHeight: '100vh' }}>
        {/* Top Header Bar */}
        <Header
          lang={lang}
          setLang={setLang}
          theme={theme}
          setTheme={setTheme}
          settings={settings}
        />

        {/* Content Body: Pure Product & Price Menu */}
        <main className="content-body" style={{ maxWidth: '1440px', margin: '0 auto', width: '100%', padding: '24px 28px' }}>
          <Products
            products={products}
            setProducts={setProducts}
            settings={settings}
            lang={lang}
            restockItemTarget={restockItemTarget}
            setRestockItemTarget={setRestockItemTarget}
            isAddModalOpen={isAddModalOpen}
            setIsAddModalOpen={setIsAddModalOpen}
          />
        </main>
      </div>
    </div>
  );
}
