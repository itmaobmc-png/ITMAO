import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Products from './components/Products';
import SalesSidebar from './components/SalesSidebar';
import ReceiptModal from './components/ReceiptModal';

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
  const [settings] = useState(() => {
    const loaded = loadStorage('smartstok_settings', INITIAL_SETTINGS);
    const storeNameKh = (!loaded?.storeNameKh || loaded.storeNameKh.includes('ស្មាតស្តុក'))
      ? 'ហាង សិរីពិដោរ'
      : loaded.storeNameKh;
    return { ...INITIAL_SETTINGS, ...loaded, storeNameKh, currency: 'KHR', currencySymbol: '៛' };
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

  // Cart state for POS Sales
  const [cart, setCart] = useState(() => loadStorage('smartstok_cart', []));

  // Viewing/Printing Invoice Receipt Modal
  const [viewingInvoice, setViewingInvoice] = useState(null);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [restockItemTarget, setRestockItemTarget] = useState(null);

  // Add product to Cart
  const handleAddToCart = (product) => {
    if (product.stockQty <= 0) {
      alert(lang === 'km' ? 'ទំនិញនេះអស់ពីស្តុកហើយ មិនអាចលក់បានទេ!' : 'This product is out of stock!');
      return;
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        if (existing.qty + 1 > product.stockQty) {
          alert(
            lang === 'km'
              ? `ស្តុកនៅសល់ត្រឹមតែ ${product.stockQty} ${product.unit || ''} ប៉ុណ្ណោះ!`
              : `Only ${product.stockQty} in stock!`
          );
          return prev;
        }
        return prev.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [
        ...prev,
        {
          id: product.id,
          nameKh: product.nameKh,
          nameEn: product.nameEn || product.nameKh,
          price: product.sellingPrice,
          costPrice: product.costPrice,
          qty: 1,
          unit: product.unit || 'កំប៉ុង',
          emoji: product.emoji || '📦',
          image: product.image || '',
          stockQty: product.stockQty
        }
      ];
    });
  };

  // Complete Sale (Deduct inventory, save sale, open receipt)
  const handleCompleteSale = (newSale) => {
    // Deduct stock for sold items
    setProducts((prev) =>
      prev.map((p) => {
        const soldItem = newSale.items?.find((it) => it.id === p.id);
        if (soldItem) {
          const remainingQty = Math.max(0, p.stockQty - soldItem.qty);
          return { ...p, stockQty: remainingQty, updatedAt: new Date().toISOString() };
        }
        return p;
      })
    );

    // Save sale to history
    const salesHistory = loadStorage('smartstok_sales', []);
    saveStorage('smartstok_sales', [newSale, ...salesHistory]);

    // Open receipt modal
    setViewingInvoice(newSale);
  };

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

  useEffect(() => {
    saveStorage('smartstok_cart', cart);
  }, [cart]);

  return (
    <div className="app-container">
      {/* Main Full-Width Content Wrapper */}
      <div className="main-wrapper" style={{ width: '100%', minHeight: '100vh' }}>
        {/* Top Header Bar */}
        <Header
          lang={lang}
          theme={theme}
          setTheme={setTheme}
          settings={settings}
        />

        {/* Content Body: Product Menu & Right Sales Sidebar */}
        <main className="content-body" style={{ maxWidth: '1600px', margin: '0 auto', width: '100%', padding: '24px 28px' }}>
          <div className="pos-layout">
            {/* Left Column: Products List & Grid */}
            <div style={{ minWidth: 0 }}>
              <Products
                products={products}
                setProducts={setProducts}
                settings={settings}
                lang={lang}
                restockItemTarget={restockItemTarget}
                setRestockItemTarget={setRestockItemTarget}
                isAddModalOpen={isAddModalOpen}
                setIsAddModalOpen={setIsAddModalOpen}
                onAddToCart={handleAddToCart}
              />
            </div>

            {/* Right Sidebar: បន្ថែមទំនិញថ្មី + ដាក់លក់ចេញ */}
            <div style={{ minWidth: 0 }}>
              <SalesSidebar
                cart={cart}
                setCart={setCart}
                settings={settings}
                lang={lang}
                onOpenAddProduct={() => setIsAddModalOpen(true)}
                onCompleteSale={handleCompleteSale}
              />
            </div>
          </div>
        </main>
      </div>

      {/* Printable Receipt Modal */}
      <ReceiptModal
        invoice={viewingInvoice}
        settings={settings}
        lang={lang}
        onClose={() => setViewingInvoice(null)}
      />
    </div>
  );
}
