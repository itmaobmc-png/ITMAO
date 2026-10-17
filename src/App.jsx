import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import POS from './components/POS';
import Products from './components/Products';
import SalesHistory from './components/SalesHistory';
import StockMovements from './components/StockMovements';
import Settings from './components/Settings';
import ReceiptModal from './components/ReceiptModal';

import {
  INITIAL_PRODUCTS,
  INITIAL_SALES,
  INITIAL_SETTINGS
} from './data/initialData';
import { loadStorage, saveStorage } from './utils/helpers';

export default function App() {
  // Theme & Language
  const [theme, setTheme] = useState(() => loadStorage('smartstok_theme', 'light'));
  const [lang, setLang] = useState(() => loadStorage('smartstok_lang', 'km'));

  // Main Datasets
  const [settings, setSettings] = useState(() => loadStorage('smartstok_settings', INITIAL_SETTINGS));
  const [products, setProducts] = useState(() => loadStorage('smartstok_products', INITIAL_PRODUCTS));
  const [sales, setSales] = useState(() => loadStorage('smartstok_sales', INITIAL_SALES));
  const [movements, setMovements] = useState(() =>
    loadStorage('smartstok_movements', [
      {
        id: 'MOV-1001',
        date: new Date(Date.now() - 86400000 * 2).toISOString(),
        productId: 'PRD-1001',
        productName: 'ភេសជ្ជៈប៉ូវកម្លាំង Sting',
        type: 'INITIAL_STOCK',
        quantity: 50,
        costPrice: 0.45,
        supplier: 'ភ្នំពេញ ឌីទ្រីប៊្យូសិន',
        notes: 'បញ្ចូលស្តុកដំបូង'
      }
    ])
  );

  // Active Tab & Navigation
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileOpen, setMobileOpen] = useState(false);

  // Cart State for POS
  const [cart, setCart] = useState(() => loadStorage('smartstok_cart', []));

  // Modals & Triggers
  const [viewingInvoice, setViewingInvoice] = useState(null);
  const [restockItemTarget, setRestockItemTarget] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

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
    saveStorage('smartstok_sales', sales);
  }, [sales]);

  useEffect(() => {
    saveStorage('smartstok_movements', movements);
  }, [movements]);

  useEffect(() => {
    saveStorage('smartstok_cart', cart);
  }, [cart]);

  // Handle completing a sale (deduct inventory, create movements, record invoice)
  const handleCompleteSale = (newSale) => {
    // 1. Deduct stock quantities
    setProducts((prevProducts) =>
      prevProducts.map((p) => {
        const cartItem = newSale.items.find((item) => item.id === p.id);
        if (cartItem) {
          const newQty = Math.max(0, p.stockQty - cartItem.qty);
          return {
            ...p,
            stockQty: newQty,
            updatedAt: new Date().toISOString()
          };
        }
        return p;
      })
    );

    // 2. Add stock movements for sold items
    const newMovements = newSale.items.map((item, idx) => ({
      id: `MOV-${Date.now().toString().slice(-6)}-${idx}`,
      date: newSale.date,
      productId: item.id,
      productName: item.nameKh || item.nameEn,
      type: 'SALE_OUT',
      quantity: -item.qty,
      costPrice: item.costPrice || 0,
      supplier: 'អតិថិជន (POS Sale)',
      notes: `វិក្កយបត្រ ${newSale.id}`
    }));

    setMovements((prev) => [...newMovements, ...prev]);

    // 3. Save new sale record
    setSales((prev) => [newSale, ...prev]);

    // 4. Automatically open Receipt Modal for printing
    setViewingInvoice(newSale);
  };

  // Record custom stock movement (e.g. from Restock or Add Product)
  const handleRecordStockMovement = (movement) => {
    setMovements((prev) => [movement, ...prev]);
  };

  // Helper actions from Dashboard
  const handleOpenRestockModal = (product) => {
    setRestockItemTarget(product);
    setActiveTab('products');
  };

  const handleOpenAddProduct = () => {
    setIsAddModalOpen(true);
    setActiveTab('products');
  };

  // Low stock badge calculation
  const lowStockCount = products.filter((p) => p.stockQty <= p.minStock).length;

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        lang={lang}
        lowStockCount={lowStockCount}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* Main Content Wrapper */}
      <div className="main-wrapper">
        {/* Top Header Bar */}
        <Header
          lang={lang}
          setLang={setLang}
          theme={theme}
          setTheme={setTheme}
          settings={settings}
          cartCount={cart.reduce((sum, it) => sum + it.qty, 0)}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          mobileOpen={mobileOpen}
          setMobileOpen={setMobileOpen}
        />

        {/* Content Body */}
        <main className="content-body">
          {activeTab === 'dashboard' && (
            <Dashboard
              products={products}
              sales={sales}
              settings={settings}
              lang={lang}
              setActiveTab={setActiveTab}
              onOpenAddProduct={handleOpenAddProduct}
              onOpenRestock={handleOpenRestockModal}
              onViewInvoice={(invoice) => setViewingInvoice(invoice)}
            />
          )}

          {activeTab === 'pos' && (
            <POS
              products={products}
              cart={cart}
              setCart={setCart}
              settings={settings}
              lang={lang}
              onCompleteSale={handleCompleteSale}
            />
          )}

          {activeTab === 'products' && (
            <Products
              products={products}
              setProducts={setProducts}
              settings={settings}
              lang={lang}
              onRecordStockMovement={handleRecordStockMovement}
              restockItemTarget={restockItemTarget}
              setRestockItemTarget={setRestockItemTarget}
              isAddModalOpen={isAddModalOpen}
              setIsAddModalOpen={setIsAddModalOpen}
            />
          )}

          {activeTab === 'sales' && (
            <SalesHistory
              sales={sales}
              setSales={setSales}
              settings={settings}
              lang={lang}
              onViewInvoice={(invoice) => setViewingInvoice(invoice)}
            />
          )}

          {activeTab === 'movements' && (
            <StockMovements
              movements={movements}
              lang={lang}
              onOpenRestockDirect={() => {
                setActiveTab('products');
              }}
            />
          )}

          {activeTab === 'settings' && (
            <Settings
              settings={settings}
              setSettings={setSettings}
              products={products}
              setProducts={setProducts}
              sales={sales}
              setSales={setSales}
              movements={movements}
              setMovements={setMovements}
              lang={lang}
            />
          )}
        </main>
      </div>

      {/* Receipt View & Print Modal */}
      {viewingInvoice && (
        <ReceiptModal
          invoice={viewingInvoice}
          settings={settings}
          lang={lang}
          onClose={() => setViewingInvoice(null)}
        />
      )}
    </div>
  );
}
